import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./StudentLessonsPage.css";
import { supabase } from "../../supabaseClient";

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Use 'supabase' from supabaseClient.js

const DEFAULT_COLOR = "var(--color-primary)";

export default function StudentLessonsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState([]);
  const [student, setStudent] = useState(null);
  const [chaptersMap, setChaptersMap] = useState({});

  // helper: translate internal status keys to Arabic labels
  function translateStatus(status) {
    switch (status) {
      case 'locked':
        return 'مقفلة';
      case 'soon':
        return 'قريبًا';
      case 'not-started':
        return 'لم يبدأ';
      case 'in-progress':
        return 'جارية';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
    }
  }

  // helper: convert western digits to Arabic-Indic digits (٠١٢...)
  function toArabicNumbers(num) {
    if (num === null || num === undefined) return '';
    const map = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(num).split('').map(ch => {
      if (ch >= '0' && ch <= '9') return map[Number(ch)];
      return ch;
    }).join('');
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // read currentUser from sessionStorage (use same storage as StudentDashboard)
        const raw = sessionStorage.getItem("currentUser");
        console.debug('StudentLessonsPage: currentUser raw from sessionStorage ->', raw);
        if (!raw) {
          navigate('/login');
          return;
        }
        let currentUser = null;
        try {
          currentUser = JSON.parse(raw);
        } catch (e) {
          console.error('StudentLessonsPage: invalid currentUser JSON', e);
          navigate('/login');
          return;
        }
        if (!currentUser || currentUser.role !== "student" || !currentUser.studentId) {
          navigate('/login');
          return;
        }
        const studentId = currentUser.studentId;

        // fetch student row (keep for UI info)
        const { data: studentRows, error: studentErr } = await supa
          .from("students")
          .select("*")
          .eq("student_id", studentId)
          .single();
        if (studentErr) throw studentErr;
        if (!mounted) return;
        setStudent(studentRows || null);

        // --- Simplified: load lessons directly from `lessons` table ---
        const { data: lessonsRows, error: lessonsErr } = await supa
          .from('lessons')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (lessonsErr) throw lessonsErr;

        if (!lessonsRows || lessonsRows.length === 0) {
          if (mounted) {
            setLessons([]);
            setLoading(false);
          }
          return;
        }

        const lessonIds = lessonsRows.map((l) => l.lesson_id);

        // fetch lesson_results for this student and lessons
        const { data: resultsRows, error: resultsErr } = await supa
          .from('lesson_results')
          .select('lesson_id, correct_count, total_count')
          .eq('student_id', studentId)
          .in('lesson_id', lessonIds);
        if (resultsErr) throw resultsErr;

        // compute best accuracy per lesson
        const bestAccuracy = {};
        (resultsRows || []).forEach((r) => {
          const total = r.total_count || 0;
          const correct = r.correct_count || 0;
          const acc = total > 0 ? correct / total : 0;
          if (!bestAccuracy[r.lesson_id] || acc > bestAccuracy[r.lesson_id]) {
            bestAccuracy[r.lesson_id] = acc;
          }
        });

        // helper to pick fields
        function pickColor(lessonRow) {
          return (
            lessonRow.card_color ||
            lessonRow.lesson_color ||
            lessonRow.theme_color ||
            lessonRow.color ||
            DEFAULT_COLOR
          );
        }

        function pickDescription(lessonRow) {
          return (
            lessonRow.short_description || lessonRow.summary || lessonRow.description || lessonRow.objective || ""
          );
        }

        // assemble final lessons array for UI
        const finalLessons = (lessonsRows || []).map((lr) => {
          const acc = bestAccuracy[lr.lesson_id] || 0;
          const progress = Math.round(acc * 100);
          let status = 'not-started';
          if (bestAccuracy[lr.lesson_id] === undefined) {
            status = 'not-started';
          } else if (acc >= 0.95) {
            status = 'completed';
          } else {
            status = 'in-progress';
          }

          return {
            lesson_id: lr.lesson_id,
            lesson_name: lr.lesson_name,
            chapter_id: lr.chapter_id,
            description: pickDescription(lr),
            color: pickColor(lr),
            progress,
            status,
            _raw: lr,
          };
        });

        if (!mounted) return;
        setLessons(finalLessons);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("حدث خطأ أثناء تحميل بيانات الدروس.");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="loading-spinner">جاري التحميل...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="lessons-page-container" dir="rtl">
      <div className="filters-row">
        <button className="filter-btn active">الكل</button>
        <button className="filter-btn">مكتملة</button>
        <button className="filter-btn">جارية</button>
        <button className="filter-btn">مقفلة</button>
      </div>

      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div className="lesson-card" key={lesson.lesson_id}>
            <div
              className="lesson-status-badge"
              style={{
                background:
                  lesson.status === "locked" || lesson.status === "soon"
                    ? "var(--color-accent)"
                    : lesson.progress >= 95
                    ? "var(--color-accent)"
                    : lesson.color,
              }}
            >
              {translateStatus(lesson.status)}
            </div>

            <div className="lesson-icon">{lesson._raw?.icon || "📘"}</div>
            <h3 className="lesson-title" style={{ color: lesson.color }}>
              {lesson.lesson_name}
            </h3>
            <div className="lesson-description">{lesson.description}</div>

            <div className="lesson-meta">
              {lesson.chapter_id && chaptersMap[lesson.chapter_id] && (
                <>
                  <span>الوحدة {chaptersMap[lesson.chapter_id].chapter_number}</span>
                  {" | "}
                </>
              )}
              <span>{lesson._raw?.exercise_count || ""}</span>
            </div>

            <div className="progress-label">التقدم</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${lesson.progress}%`, background: lesson.color }} />
            </div>
            <div className="progress-percent">{toArabicNumbers(lesson.progress)}٪</div>

            <div className="lesson-actions">
              <button className="action-btn main">{lesson.progress === 100 ? "مراجعة الدروس" : "متابعة التمارين"}</button>
              <button className="action-btn secondary">لعبة الدرس</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
