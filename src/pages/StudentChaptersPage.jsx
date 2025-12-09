import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './StudentChaptersPage.css';


function toArabicNumber(num) {
  return String(num).replace(/[0-9]/g, d =>
    '٠١٢٣٤٥٦٧٨٩'[d]
  );
}

const GRADE_LABELS = {
  1: 'الأول',
  2: 'الثاني',
  3: 'الثالث',
  4: 'الرابع',
  5: 'الخامس',
  6: 'السادس',
};

const SEMESTER_LABELS = {
  1: 'الأول',
  2: 'الثاني',
};

const ICONS = ['📘', '📗', '📙', '📕', '📒', '📚'];

const StudentChaptersPage = () => {
  const navigate = useNavigate();
  const [chaptersList, setChaptersList] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // تحقق من جلسة المستخدم
    let raw = sessionStorage.getItem('currentUser');
    let currentUser = null;
    try {
      currentUser = JSON.parse(raw);
    } catch {
      currentUser = null;
    }
    if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
      navigate('/login');
      return;
    }

    async function fetchChaptersAndProgress() {
      setIsLoading(true);
      setError(null);
      // جلب الأبواب
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('chapter_id, chapter_number, chapter_name, grade, semester, subject, display_order, is_active')
        .eq('grade', 5)
        .eq('semester', 1)
        .eq('subject', 'رياضيات')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (chaptersError) {
        setError(chaptersError);
        setIsLoading(false);
        return;
      }
      setChaptersList(chapters);

      // جلب التقدم لكل باب
      const progress = {};
      for (const chapter of chapters) {
        // جلب الدروس النشطة لهذا الباب
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('lesson_id')
          .eq('chapter_id', chapter.chapter_id)
          .eq('is_active', true);
        if (lessonsError) {
          progress[chapter.chapter_id] = { percent: 0, completed: 0, total: 0 };
          continue;
        }
        const lessonIds = lessons.map(l => l.lesson_id);
        if (lessonIds.length === 0) {
          progress[chapter.chapter_id] = { percent: 0, completed: 0, total: 0 };
          continue;
        }
        // جلب الأسئلة المنشورة لهذا الباب
        const { data: questions, error: questionsError } = await supabase
          .from('question_bank')
          .select('question_id, lesson_id')
          .in('lesson_id', lessonIds)
          .eq('status', 'published');
        if (questionsError) {
          progress[chapter.chapter_id] = { percent: 0, completed: 0, total: 0 };
          continue;
        }
        const questionIds = questions.map(q => q.question_id);
        const totalQuestions = questionIds.length;
        if (totalQuestions === 0) {
          progress[chapter.chapter_id] = { percent: 0, completed: 0, total: 0 };
          continue;
        }
        // جلب المحاولات الصحيحة للطالبة
        const { data: attempts, error: attemptsError } = await supabase
          .from('question_attempts')
          .select('question_id')
          .eq('student_id', currentUser.studentId)
          .in('lesson_id', lessonIds)
          .eq('is_correct', true);
        if (attemptsError) {
          progress[chapter.chapter_id] = { percent: 0, completed: 0, total: totalQuestions };
          continue;
        }
        // حساب عدد الأسئلة التي أجابت عليها الطالبة بشكل صحيح
        const uniqueCorrect = new Set(attempts.map(a => a.question_id));
        const completed = uniqueCorrect.size;
        const percent = Math.round((completed / totalQuestions) * 100);
        progress[chapter.chapter_id] = { percent, completed, total: totalQuestions };
      }
      setProgressMap(progress);
      setIsLoading(false);
    }

    fetchChaptersAndProgress();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="lesson-page-loading" dir="rtl">
        <div className="spinner" />
        <p>جاري تحميل الأبواب...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-page-error" dir="rtl">
        <h3>⚠️ حدث خطأ</h3>
        <p>{error.message || String(error)}</p>
        <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div className="student-chapters-root" dir="rtl">
      <h2 className="student-chapters-title">الأبواب الدراسية</h2>
      <div className="chapters-grid">
        {chaptersList.map((chapter, idx) => {
          const progress = progressMap[chapter.chapter_id] || { percent: 0, completed: 0, total: 0 };
          return (
            <Link
              to={`/student/chapters/${chapter.chapter_id}`}
              className="chapter-card-link"
              key={chapter.chapter_id}
            >
              <div className="chapter-card">
                <div className="chapter-card-icon">{ICONS[idx % ICONS.length]}</div>
                <div className="chapter-card-main">
                  <div className="chapter-card-title">
                    الباب {toArabicNumber(chapter.chapter_number)}: {chapter.chapter_name}
                  </div>
                  <div className="chapter-card-sub">
                    الصف {GRADE_LABELS[chapter.grade]} – الفصل {SEMESTER_LABELS[chapter.semester]}
                  </div>
                  <div className="chapter-progress-bar">
                    <div
                      className="chapter-progress-fill"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <div className="chapter-progress-label">
                    {progress.percent > 0
                      ? `٪${toArabicNumber(progress.percent)} من دروس الباب مكتملة`
                      : 'ابدأي الآن!'}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default StudentChaptersPage;
