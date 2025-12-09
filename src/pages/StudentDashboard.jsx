import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Logo from '../components/Logo';

// إعداد Supabase

function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    lessonsCompleted: 0,
    lessonsInProgress: 0,
    accuracyPercent: 0,
    streakDays: 0,
    totalLessons: 0,
  });
  const [classInfo, setClassInfo] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    loadStudentDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // دالة تحويل الأرقام إلى عربية
  const toArabicNumbers = (num) => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (digit) => arabicNumbers[digit]);
  };

  // دالة تحويل رقم الصف إلى نص
  const gradeNumberToText = (grade) => {
    const gradeMap = {
      1: 'الصف الأول',
      2: 'الصف الثاني',
      3: 'الصف الثالث',
      4: 'الصف الرابع',
      5: 'الصف الخامس',
      6: 'الصف السادس',
    };
    return gradeMap[grade] || 'طالبة';
  };

  // دالة استخراج الحروف الأولى
  const getInitials = (fullName) => {
    if (!fullName) return '؟';
    const names = fullName.trim().split(' ');
    if (names.length === 0) return '؟';
    const firstInitial = names[0].charAt(0);
    const lastInitial =
      names.length > 1 ? names[names.length - 1].charAt(0) : '';
    return firstInitial + lastInitial;
  };

  const loadStudentDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      // قراءة currentUser من sessionStorage
      const raw = sessionStorage.getItem('currentUser');
      if (!raw) {
        navigate('/login');
        return;
      }

      const currentUser = JSON.parse(raw);
      if (!currentUser || currentUser.role !== 'student') {
        setError('هذه الصفحة مخصصة للطالبات فقط');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // جلب بيانات الطالبة
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', currentUser.studentId)
        .maybeSingle();

      if (studentError || !student) {
        setError('لم يتم العثور على بيانات الطالبة');
        return;
      }

      setStudentData(student);

      // جلب بيانات الفصل في متغيّر محلي + state
      let resolvedClassInfo = null;
      let totalLessons = 0;

      const { data: studentClass } = await supabase
        .from('student_classes')
        .select('class_id')
        .eq('student_id', student.student_id)
        .limit(1);

      if (studentClass && studentClass.length > 0) {
        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .eq('class_id', studentClass[0].class_id)
          .maybeSingle();

        if (classData) {
          resolvedClassInfo = classData;
          setClassInfo(classData);
        }
      }

      // حساب النقاط
      const { data: pointsData } = await supabase
        .from('game_points_ledger')
        .select('points')
        .eq('student_id', student.student_id);

      const totalPoints =
        pointsData?.reduce(
          (sum, item) => sum + (item.points || 0),
          0
        ) || 0;

      // جلب نتائج الدروس
      const { data: lessonResults } = await supabase
        .from('lesson_results')
        .select('*')
        .eq('student_id', student.student_id);

      // حساب الدروس المكتملة والدقة
      const lessonAccuracyMap = {};
      lessonResults?.forEach((result) => {
        const accuracy =
          result.total_count > 0
            ? result.correct_count / result.total_count
            : 0;
        if (
          !lessonAccuracyMap[result.lesson_id] ||
          accuracy > lessonAccuracyMap[result.lesson_id]
        ) {
          lessonAccuracyMap[result.lesson_id] = accuracy;
        }
      });

      const lessonsCompleted = Object.values(lessonAccuracyMap).filter(
        (acc) => acc >= 0.95
      ).length;

      const totalAccuracy = Object.values(lessonAccuracyMap).reduce(
        (sum, acc) => sum + acc,
        0
      );

      const accuracyPercent =
        Object.keys(lessonAccuracyMap).length > 0
          ? Math.round(
              (totalAccuracy / Object.keys(lessonAccuracyMap).length) * 100
            )
          : 0;

      // جلب عدد الدروس من class_lessons إن وجد فصل
      if (resolvedClassInfo) {
        const { data: classLessons } = await supabase
          .from('class_lessons')
          .select('*')
          .eq('class_id', resolvedClassInfo.class_id);

        totalLessons = classLessons?.length || 0;
      }

      // في حال لم يوجد فصل أو لم توجد بيانات، نعتمد على lesson_results
      if (totalLessons === 0 && lessonResults) {
        const uniqueLessonIds = [
          ...new Set(lessonResults.map((item) => item.lesson_id)),
        ];
        totalLessons = uniqueLessonIds.length;
      }

      const lessonsInProgress = Math.max(
        0,
        totalLessons - lessonsCompleted
      );

      // حساب الأيام المتتالية
      const { data: sessions } = await supabase
        .from('sessions')
        .select('created_at')
        .eq('student_id', student.student_id)
        .order('created_at', { ascending: false })
        .limit(365);

      let streakDays = 0;
      if (sessions) {
        const uniqueDates = new Set();
        sessions.forEach((session) => {
          const date = new Date(session.created_at);
          const dateStr = date.toISOString().split('T')[0];
          uniqueDates.add(dateStr);
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
          const dateStr = today.toISOString().split('T')[0];
          if (uniqueDates.has(dateStr)) {
            streakDays++;
            today.setDate(today.getDate() - 1);
          } else {
            break;
          }
        }
      }

      setStats({
        totalPoints,
        lessonsCompleted,
        lessonsInProgress,
        accuracyPercent,
        streakDays,
        totalLessons,
      });
    } catch (err) {
      console.error('خطأ في تحميل البيانات:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-overlay" style={{ display: 'flex' }}>
        <div className="loading-container">
          <div className="loading-icon"></div>
          <div className="loading-text">
            جاري تحميل بيانات الطالبة
            <span className="loading-dots"></span>
          </div>
          <div className="loading-subtext">
            نرجى الانتظار قليلاً...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const gradeText = gradeNumberToText(studentData?.grade || 0);
  const className = classInfo ? classInfo.class_name : '';
  const roleText = className ? `${gradeText} – ${className}` : gradeText;
  const progressPercent =
    stats.totalLessons > 0
      ? Math.round(
          (stats.lessonsCompleted / stats.totalLessons) * 100
        )
      : 0;

  return (
    <>
      {showSidebar && (
        <div
          className="sidebar-backdrop"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      <div className="dashboard-container">
        <div className="dashboard-shell">
          {/* القائمة الجانبية */}
          <aside
            className={`dashboard-sidebar ${showSidebar ? 'open' : ''}`}
          >
            <button
              className="sidebar-close"
              onClick={() => setShowSidebar(false)}
            >
              ✕
            </button>
            <nav>
              <ul className="sidebar-menu">
                <li className="sidebar-menu-item">
                  <button
                    type="button"
                    className="sidebar-menu-link active"
                  >
                    <span className="sidebar-menu-text">نظرة عامة</span>
                    <span className="sidebar-menu-icon">🏠</span>
                  </button>
                </li>
                <li className="sidebar-menu-item">
                  <Link
                    to="/student/chapters"
                    className="sidebar-menu-link"
                  >
                    <span className="sidebar-menu-text">
                      دروسي
                    </span>
                    <span className="sidebar-menu-icon">📘</span>
                  </Link>
                </li>
                <li className="sidebar-menu-item">
                  <button type="button" className="sidebar-menu-link">
                    <span className="sidebar-menu-text">لعب جماعي</span>
                    <span className="sidebar-menu-icon">🛡️</span>
                  </button>
                </li>
                <li className="sidebar-menu-item">
                  <button
                    type="button"
                    className="sidebar-menu-link"
                    onClick={handleLogout}
                  >
                    <span className="sidebar-menu-text">
                      تسجيل الخروج
                    </span>
                    <span className="sidebar-menu-icon">🚪</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* المحتوى الرئيسي */}
          <main className="dashboard-main">
            <div className="dashboard-wrapper">
              {/* الهيدر */}
              <header className="dashboard-header">
                <div className="brand-section">
                  <button
                    className="sidebar-toggle"
                    onClick={() => setShowSidebar(true)}
                  >
                    ☰
                  </button>
                  <Logo
                    variant="default"
                    size="small"
                    showText={false}
                  />
                  <div className="brand-info">
                    <div className="brand-title">
                      منصة سلمى التعليمية
                    </div>
                    <div className="brand-subtitle">لوحة الطالبة</div>
                  </div>
                </div>

                <div className="user-section">
                  <div className="notification-wrapper">
                    <button
                      className="icon-btn"
                      onClick={() =>
                        setShowNotifications((prev) => !prev)
                      }
                    >
                      🔔
                      <span className="notification-badge">
                        {toArabicNumbers(0)}
                      </span>
                    </button>
                    {showNotifications && (
                      <div className="notification-panel">
                        <div className="notification-header">
                          <div className="notification-title">
                            إشعارات جديدة
                          </div>
                          <div className="notification-count">
                            {toArabicNumbers(0)} إشعارات
                          </div>
                        </div>
                        <ul className="notification-list">
                          <li className="notification-item">
                            لا توجد إشعارات جديدة
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="user-chip">
                    <div className="user-avatar">
                      {getInitials(studentData?.full_name)}
                    </div>
                    <div className="user-info">
                      <div className="user-name">
                        {studentData?.full_name || 'طالبة'}
                      </div>
                      <div className="user-role">{roleText}</div>
                    </div>
                  </div>
                </div>
              </header>

              {/* الإحصائيات السريعة */}
              <section>
                <div className="quick-stats">
                  <div className="quick-stat-item">
                    <div className="quick-stat-icon">⭐</div>
                    <div className="quick-stat-label">نقاطي</div>
                    <div className="quick-stat-value">
                      {toArabicNumbers(stats.totalPoints)}
                    </div>
                  </div>
                  <div className="quick-stat-item">
                    <div className="quick-stat-icon">📚</div>
                    <div className="quick-stat-label">
                      دروس مكتملة
                    </div>
                    <div className="quick-stat-value">
                      {toArabicNumbers(stats.lessonsCompleted)}
                    </div>
                  </div>
                  <div className="quick-stat-item">
                    <div className="quick-stat-icon">🎯</div>
                    <div className="quick-stat-label">
                      تحديات مكتملة
                    </div>
                    <div className="quick-stat-value">
                      {toArabicNumbers(0)}
                    </div>
                  </div>
                  <div className="quick-stat-item">
                    <div className="quick-stat-icon">🔥</div>
                    <div className="quick-stat-label">
                      أيام متتالية
                    </div>
                    <div className="quick-stat-value">
                      {toArabicNumbers(stats.streakDays)}
                    </div>
                  </div>
                </div>
              </section>

              {/* الصف الأول: دروسي + تحدياتي */}
              <section>
                <div className="row g-3">
                  <div className="col-12 col-lg-6">
                    <div className="ticket-card">
                      <div className="ticket-header turquoise">
                        <div className="ticket-title">
                          <span>دروسي</span>
                          <span className="ticket-badge">
                            وحدات ودروس
                          </span>
                        </div>
                        <div className="ticket-subtitle">
                          الوحدات والتمارين التي عملتِ عليها مؤخرًا
                        </div>
                      </div>
                      <div className="ticket-body">
                        <ul className="list-simple">
                          <li>
                            <span>دروس مكتملة</span>
                            <span
                              className="chip-soft"
                              style={{
                                background:
                                  'rgba(74,222,128,0.12)',
                                borderColor:
                                  'rgba(74,222,128,0.6)',
                                color: 'var(--color-primary)',
                              }}
                            >
                                {toArabicNumbers(stats.lessonsCompleted)}{' '}
                                دروس
                            </span>
                          </li>
                          <li>
                            <span>دروس قيد التعلّم</span>
                            <span
                              className="chip-soft"
                              style={{
                                background:
                                  'rgba(250,204,21,0.16)',
                                borderColor:
                                  'rgba(250,204,21,0.7)',
                                color: 'var(--color-primary)',
                              }}
                            >
                                {toArabicNumbers(stats.lessonsInProgress)}{' '}
                                درس
                            </span>
                          </li>
                          <li>
                            <span>متوسط الدقّة في الحل</span>
                            <span className="chip-soft">
                              {toArabicNumbers(
                                stats.accuracyPercent
                              )}
                              ٪
                            </span>
                          </li>
                        </ul>
                        <div className="cta-row">
                          {/* الزر الرئيسي الآن يفتح صفحة الأبواب */}
                          <Link
                            to="/student/chapters"
                            className="cta-btn cta-btn-primary"
                            onClick={() => console.log('دروسي clicked → /student/chapters')}
                          >
                            <span className="cta-icon">📘</span>
                            <span>دروسي</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="ticket-card">
                      <div className="ticket-header pink">
                        <div className="ticket-title">
                          <span>تحدياتي</span>
                          <span className="ticket-badge">
                            فردي وجماعي
                          </span>
                        </div>
                        <div className="ticket-subtitle">
                          التحديات المفتوحة والمنتهية لهذا الأسبوع
                        </div>
                      </div>
                      <div className="ticket-body">
                        <ul className="list-simple">
                          <li>
                            <span>تحديات مكتملة</span>
                            <span
                              className="chip-soft"
                              style={{
                                background:
                                  'rgba(74,222,128,0.12)',
                                borderColor:
                                  'rgba(74,222,128,0.6)',
                                color: 'var(--color-primary)',
                              }}
                            >
                              {toArabicNumbers(0)}
                            </span>
                          </li>
                          <li>
                            <span>تحديات ما زالت مفتوحة</span>
                            <span
                              className="chip-soft"
                              style={{
                                background:
                                  'rgba(250,204,21,0.16)',
                                borderColor:
                                  'rgba(250,204,21,0.7)',
                                color: 'var(--color-primary)',
                              }}
                            >
                              {toArabicNumbers(0)}
                            </span>
                          </li>
                          <li>
                            <span>نقاط التحديات</span>
                            <span className="chip-soft">
                              {toArabicNumbers(0)} نقطة
                            </span>
                          </li>
                        </ul>
                        <div className="cta-row">
                          <button
                            type="button"
                            className="cta-btn cta-btn-tertiary"
                          >
                            <span className="cta-icon">↗️</span>
                            <span>صفحة التحديات</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* الصف الثاني: تقدّمي + أبطال الأسبوع */}
              <section>
                <div className="row g-3">
                  <div className="col-12 col-lg-6">
                    <div className="ticket-card">
                      <div className="ticket-header yellow">
                        <div className="ticket-title">
                          <span>تقدّمي</span>
                          <span className="ticket-badge">
                            {toArabicNumbers(progressPercent)}٪{' '}
                            مثال
                          </span>
                        </div>
                        <div className="ticket-subtitle">
                          ملخص نسبة تقدّمك في وحدات الصف
                        </div>
                      </div>
                      <div className="ticket-body">
                        <div className="progress-bar-wrapper">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${progressPercent}%`,
                            }}
                          ></div>
                        </div>
                        <p className="small-muted">
                          أنهيتِ حتى الآن تقريبًا{' '}
                          {toArabicNumbers(progressPercent)}٪ من
                          أهدافك في المنصة. استمري لتصلي إلى
                          ١٠٠٪ 💪
                        </p>
                        <ul className="list-simple">
                          <li>
                            <span>وحدات مكتملة بالكامل</span>
                            <span
                              className="chip-soft"
                              style={{
                                background:
                                  'rgba(74,222,128,0.12)',
                                borderColor:
                                  'rgba(74,222,128,0.6)',
                                color: 'var(--color-primary)',
                              }}
                            >
                                {toArabicNumbers(Math.floor(stats.lessonsCompleted / 2))}{' '}
                                وحدة
                            </span>
                          </li>
                          <li>
                            <span>وحدات قيد التقدّم</span>
                            <span className="chip-soft">
                              {toArabicNumbers(
                                Math.ceil(
                                  stats.lessonsInProgress / 2
                                )
                              )}{' '}
                              وحدات
                            </span>
                          </li>
                        </ul>
                        <div className="cta-row">
                          <button
                            type="button"
                            className="cta-btn cta-btn-secondary"
                          >
                            <span className="cta-icon">↗️</span>
                            <span>تفاصيل التقدّم</span>
                          </button>
                            </button>
                          </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="ticket-card">
                      <div className="ticket-header turquoise">
                        <div className="ticket-title">
                          <span>أبطال الأسبوع</span>
                          <span className="ticket-badge">
                            أفضل ٣ طالبات
                          </span>
                        </div>
                        <div className="ticket-subtitle">
                          أعلى الطالبات نقاطًا في صفّك هذا
                          الأسبوع
                        </div>
                      </div>
                      <div className="ticket-body">
                        <ul className="list-simple">
                          <li
                            style={{
                              justifyContent: 'center',
                              color: 'var(--text-soft)',
                            }}
                          >
                            قريباً...
                          </li>
                        </ul>
                        <p className="small-muted">
                          هل تكونين أنتِ البطلة القادمة؟ ✨
                        </p>
                        <div className="cta-row">
                          <button
                            type="button"
                            className="cta-btn cta-btn-secondary"
                          >
                            <span className="cta-icon">↗️</span>
                            <span>المتصدرون</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="footer-note">
                <span>منصة سلمى التعليمية</span> – نظرة عامة سريعة
                على دروسي، تحدياتي، تقدّمي، وأبطال الأسبوع.
              </div>
              <footer className="copy-footer">
                جميع الحقوق محفوظة لمنصة سلمى التعليمية © 2025
              </footer>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default StudentDashboard;
