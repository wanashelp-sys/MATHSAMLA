// File: src/pages/StudentLessonsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './StudentLessonPageEnhanced.css';

// إعداد Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Use 'supabase' from supabaseClient.js

// تحويل الأرقام لعربية
const toArabicNumbers = (num) => {
  if (num === null || num === undefined) return '';
  const map = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(num)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? map[Number(ch)] : ch))
    .join('');
};

const statusText = (status) => {
  if (status === 'completed') return 'مكتمل';
  if (status === 'in-progress') return 'جاري';
  return 'لم يبدأ';
};

export default function StudentLessonsPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // ✅ التأكد من الطالبة
        const raw = sessionStorage.getItem('currentUser');
        if (!raw) {
          navigate('/login');
          return;
        }
        let currentUser = null;
        try {
          currentUser = JSON.parse(raw);
        } catch (e) {
          navigate('/login');
          return;
        }
        if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
          navigate('/login');
          return;
        }
        const studentId = currentUser.studentId;

        // 1) جلب جميع الأبواب من جدول chapters
        const { data: chapterRows, error: chErr } = await supabase
          .from('chapters')
          .select('chapter_id, chapter_number, chapter_name, grade, semester, subject, display_order, is_active')
          .eq('is_active', true)
          // لو حابة تربطيها بصف معيّن (مثلاً صف الطالبة):
          // .eq('grade', currentUser.grade)
          // .eq('subject', 'math')
          .order('display_order', { ascending: true });

        if (chErr) throw chErr;
        if (!mounted) return;

        if (!chapterRows || chapterRows.length === 0) {
          setChapters([]);
          setIsLoading(false);
          return;
        }

        const chapterIds = chapterRows.map((c) => c.chapter_id);

        // 2) جلب الدروس المرتبطة بكل باب (نفترض أن جدول lessons فيه عمود chapter_id)
        const { data: lessonRows, error: lErr } = await supabase
          .from('lessons')
          .select('lesson_id, chapter_id')
          .in('chapter_id', chapterIds);

        if (lErr) throw lErr;

        const lessonIds = (lessonRows || []).map((l) => l.lesson_id);

        // 3) جلب نتائج الطالبة من lesson_results لحساب التقدم
        let resultRows = [];
        if (lessonIds.length > 0) {
          const { data: resData, error: rErr } = await supabase
            .from('lesson_results')
            .select('lesson_id, correct_count, total_count')
            .eq('student_id', studentId)
            .in('lesson_id', lessonIds);

          if (rErr) throw rErr;
          resultRows = resData || [];
        }

        // أفضل دقة لكل درس
        const bestAccuracyByLesson = {};
        for (const r of resultRows) {
          if (!r.total_count) continue;
          const acc = r.correct_count / r.total_count;
          if (!bestAccuracyByLesson[r.lesson_id] || acc > bestAccuracyByLesson[r.lesson_id]) {
            bestAccuracyByLesson[r.lesson_id] = acc;
          }
        }

        // تجميع الدروس حسب الباب
        const lessonsByChapter = {};
        for (const l of lessonRows || []) {
          if (!lessonsByChapter[l.chapter_id]) lessonsByChapter[l.chapter_id] = [];
          lessonsByChapter[l.chapter_id].push(l);
        }

        // بناء بطاقات الأبواب مع التقدم
        const chapterCards = chapterRows.map((ch) => {
          const chLessons = lessonsByChapter[ch.chapter_id] || [];
          const totalLessons    = chLessons.length;
          let   completedLessons = 0;

          chLessons.forEach((l) => {
            const acc = bestAccuracyByLesson[l.lesson_id] || 0;
            if (acc >= 0.95) completedLessons++;
          });

          const progressPercent =
            totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          let status = 'not-started';
          if (totalLessons > 0 && completedLessons > 0 && completedLessons < totalLessons) {
            status = 'in-progress';
          }
          if (totalLessons > 0 && completedLessons === totalLessons) {
            status = 'completed';
          }

          const firstLessonId = chLessons[0]?.lesson_id || null;

          return {
            ...ch,
            totalLessons,
            completedLessons,
            progressPercent,
            status,
            firstLessonId
          };
        });

        if (!mounted) return;
        setChapters(chapterCards);
      } catch (err) {
        console.error('chapters load error', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [navigate]);

  // ✅ حالة التحميل
  if (isLoading) {
    return (
      <div className="lesson-page-loading">
        <div className="spinner" />
        <p>جاري تحميل الأبواب...</p>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className="lesson-page-error">
        <h3>⚠️ حدث خطأ</h3>
        <p>{error.message || String(error)}</p>
        <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div className="student-lessons-page" dir="rtl">
      <header className="chapters-header">
        <h1>أبوابي في الرياضيات</h1>
        <p>اختاري الباب الذي تريدين البدء به 👇</p>
      </header>

      {chapters.length === 0 && (
        <div className="empty-state">
          لا توجد أبواب مفعّلة حالياً.
        </div>
      )}

      <div className="chapters-grid">
        {chapters.map((ch) => (
          <div
            key={ch.chapter_id}
            className={`chapter-card glass-card status-${ch.status}`}
          >
            <div className="chapter-card-top">
              <span className="chapter-pill">
                الباب {toArabicNumbers(ch.chapter_number)}
              </span>
              <span className="chapter-status">
                {statusText(ch.status)}
              </span>
            </div>

            <h2 className="chapter-name">{ch.chapter_name}</h2>

            <div className="chapter-meta">
              <span>الصف الخامس – الفصل {toArabicNumbers(ch.semester)}</span>
              <span>عدد الدروس: {toArabicNumbers(ch.totalLessons)}</span>
            </div>

            {/* شريط التقدم الزجاجي */}
            <div className="chapter-progress-wrapper">
              <div className="chapter-progress-bar">
                <div
                  className="chapter-progress-fill"
                  style={{ width: `${ch.progressPercent}%` }}
                />
              </div>
              <div className="chapter-progress-text">
                {toArabicNumbers(ch.progressPercent)}٪ مكتمل
              </div>
            </div>

            <div className="chapter-actions">
              {ch.firstLessonId ? (
                <Link
                  to={`/student/lessons/${ch.firstLessonId}`}
                  className="chapter-btn primary"
                >
                  ابدئي هذا الباب
                </Link>
              ) : (
                <button className="chapter-btn disabled" disabled>
                  الدروس قيد الإعداد
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
