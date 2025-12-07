/*
 * Student Lessons Page - صفحة دروس الطالبة
 * 
 * DATABASE TABLES USED (من قاعدة البيانات الفعلية فقط):
 * ============================================================
 * 
 * 1. هوية الطالبة والفصل:
 *    - users: للتحقق من الدور (role)
 *    - students: full_name, grade, class_section, student_id
 *    - student_classes: ربط student_id بـ class_id
 *    - classes: class_name, teacher_id
 * 
 * 2. الدروس والوحدات:
 *    - lessons: lesson_id, lesson_code, lesson_name, chapter_id
 *    - class_lessons: lesson_id, class_id, status (open/locked/soon), display_order
 *    - chapters: استنتاج من lesson_code pattern (مثل "1-1" = الفصل 1)
 * 
 * 3. تقدم الطالبة:
 *    - lesson_results: lesson_id, student_id, correct_count, total_count, created_at
 *      → accuracy = correct_count / total_count
 *      → best accuracy per lesson
 * 
 * 4. المحاولات والجلسات:
 *    - attempts: attempt_id, student_id, question_id, is_correct, session_id
 *    - sessions: session_id, student_id, total_questions, correct_answers, created_at
 *    - question_bank: question_id, skill_tag, lesson_id
 * 
 * 5. النقاط والمستويات:
 *    - game_points_ledger: student_id, points, source_type, created_at
 *      → Total XP = SUM(points)
 *    - levels: level, required_points, title, description
 *      → Current level = highest level where total_points >= required_points
 * 
 * 6. نقاط القوة والضعف:
 *    - question_bank.skill_tag + attempts.is_correct
 *      → accuracy per skill_tag
 *      → skills >= 0.9 = نقاط قوة
 *      → skills < 0.6 = تحتاج دعم
 *    - recommendations: student_id, skill_tag, suggestion_text
 * 
 * 7. الإشعارات:
 *    - notifications: message, target_type, student_id/class_id, created_at
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { toArabicNumbers, gradeNumberToText, getInitials } from '../utils/helpers';
import Logo from '../components/Logo';

// تكوين الوحدات الدراسية للصف الخامس
const UNITS_CONFIG = [
  {
    unitId: 'place_value',
    unitName: 'القيمة المنزلية',
    unitIcon: '🔢',
    chapterNumbers: [1], // الفصل 1
    color: '#00BCD4'
  },
  {
    unitId: 'add_subtract',
    unitName: 'الجمع والطرح',
    unitIcon: '➕➖',
    chapterNumbers: [2],
    color: '#7C4DFF'
  },
  {
    unitId: 'multiply',
    unitName: 'الضرب',
    unitIcon: '✖️',
    chapterNumbers: [3],
    color: '#FF6FB5'
  },
  {
    unitId: 'division',
    unitName: 'القسمة',
    unitIcon: '➗',
    chapterNumbers: [4],
    color: '#FFE48F'
  },
  {
    unitId: 'algebra',
    unitName: 'العبارات الجبرية والمعادلات',
    unitIcon: '🧩',
    chapterNumbers: [5],
    color: '#4ADE80'
  },
  {
    unitId: 'fractions',
    unitName: 'الكسور الاعتيادية',
    unitIcon: '🍕',
    chapterNumbers: [6],
    color: '#FB7185'
  }
];

function StudentLessonsPage() {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [units, setUnits] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  // Load all data on mount
  useEffect(() => {
    loadStudentLessonsData();
  }, []);

  /**
   * تحميل جميع بيانات صفحة الدروس
   */
  const loadStudentLessonsData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // 1. التحقق من هوية الطالبة من localStorage
      const userRaw = localStorage.getItem('currentUser');
      let currentUser;
      try {
        currentUser = JSON.parse(userRaw);
      } catch {
        currentUser = null;
      }

      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        navigate('/login');
        return;
      }

      const currentStudentId = currentUser.studentId;

      // 2. جلب البيانات بشكل متوازي (Performance Optimization)
      const [
        { data: student, error: studentError },
        { data: studentClasses, error: classesError },
        { data: pointsData },
        { data: lessonResults },
        { data: sessions }
      ] = await Promise.all([
        // بيانات الطالبة
        supabase
          .from('students')
          .select('full_name, grade, class_section')
          .eq('student_id', currentStudentId)
          .single(),
        
        // فصول الطالبة
        supabase
          .from('student_classes')
          .select('class_id')
          .eq('student_id', currentStudentId),
        
        // نقاط الطالبة
        supabase
          .from('game_points_ledger')
          .select('points')
          .eq('student_id', currentStudentId),
        
        // نتائج الدروس
        supabase
          .from('lesson_results')
          .select('*')
          .eq('student_id', currentStudentId),
        
        // الجلسات
        supabase
          .from('sessions')
          .select('created_at')
          .eq('student_id', currentStudentId)
          .order('created_at', { ascending: false })
          .limit(30)
      ]);

      if (studentError || !student) {
        setError('تعذر تحميل بيانات الطالبة');
        return;
      }

      setStudentData(student);

      // 3. معالجة الفصول
      if (classesError || !studentClasses || studentClasses.length === 0) {
        setError('لم يتم ربطك بأي فصل بعد، انتظري معلمتك 💜');
        return;
      }

      // اختيار الفصل النشط (أول فصل)
      const activeClassId = studentClasses[0].class_id;

      // جلب معلومات الفصل
      const { data: classData } = await supabase
        .from('classes')
        .select('class_name')
        .eq('class_id', activeClassId)
        .single();

      setClassInfo(classData);

      // 4. جلب دروس الفصل
      const { data: classLessons } = await supabase
        .from('class_lessons')
        .select('lesson_id, status, display_order')
        .eq('class_id', activeClassId);

      if (!classLessons || classLessons.length === 0) {
        setError('لا توجد دروس مفعّلة في الفصل حالياً');
        return;
      }

      const lessonIds = classLessons.map(l => l.lesson_id);
      const statusByLessonId = {};
      classLessons.forEach(l => {
        statusByLessonId[l.lesson_id] = l.status;
      });

      // 5. جلب معلومات الدروس
      const { data: lessons } = await supabase
        .from('lessons')
        .select('lesson_id, lesson_code, lesson_name')
        .in('lesson_id', lessonIds);

      // 6. حساب أفضل دقة لكل درس
      const bestAccuracyByLessonId = {};
      lessonResults?.forEach(result => {
        if (!result.total_count) return;
        const accuracy = result.correct_count / result.total_count;
        if (!bestAccuracyByLessonId[result.lesson_id] || 
            accuracy > bestAccuracyByLessonId[result.lesson_id]) {
          bestAccuracyByLessonId[result.lesson_id] = accuracy;
        }
      });

      // 7. تنظيم الدروس حسب الوحدات
      const unitsData = UNITS_CONFIG.map(unitConfig => {
        // جمع الدروس التي تنتمي لهذه الوحدة
        const unitLessons = lessons?.filter(lesson => {
          // استخراج رقم الفصل من lesson_code (مثل "1-1" -> 1)
          const chapterNum = parseInt(lesson.lesson_code.split('-')[0]);
          return unitConfig.chapterNumbers.includes(chapterNum);
        }) || [];

        // تصنيف الدروس حسب الحالة
        const openLessons = unitLessons.filter(l => 
          statusByLessonId[l.lesson_id] === 'open'
        );
        const lockedLessons = unitLessons.filter(l => 
          statusByLessonId[l.lesson_id] === 'locked'
        );

        // حساب التقدم في الوحدة
        let unitProgress = 0;
        let unitStatus = 'in-progress';
        let completedCount = 0;

        if (openLessons.length === 0 && lockedLessons.length > 0) {
          unitStatus = 'locked';
        } else if (openLessons.length > 0) {
          let sumAccuracy = 0;
          openLessons.forEach(lesson => {
            const accuracy = bestAccuracyByLessonId[lesson.lesson_id] || 0;
            sumAccuracy += accuracy;
            if (accuracy >= 0.95) completedCount++;
          });
          
          unitProgress = Math.round((sumAccuracy / openLessons.length) * 100);
          
          if (completedCount === openLessons.length && openLessons.length > 0) {
            unitStatus = 'completed';
          }
        }

        return {
          ...unitConfig,
          progress: unitProgress,
          status: unitStatus,
          totalLessons: openLessons.length,
          completedLessons: completedCount,
          lessons: unitLessons
        };
      });

      setUnits(unitsData);

      // 8. جلب الإشعارات
      await loadNotifications(currentStudentId, activeClassId);

    } catch (err) {
      console.error('خطأ في تحميل البيانات:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * تحميل الإشعارات
   */
  const loadNotifications = async (studentId, classId) => {
    try {
      const { data: notifs } = await supabase
        .from('notifications')
        .select('message, created_at')
        .or(`target_type.eq.student,student_id.eq.${studentId},target_type.eq.class,class_id.eq.${classId},target_type.eq.all`)
        .order('created_at', { ascending: false })
        .limit(5);

      setNotifications(notifs || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  /**
   * تصفية الوحدات حسب الحالة
   */
  const filteredUnits = useMemo(() => {
    if (filterStatus === 'all') return units;
    return units.filter(unit => unit.status === filterStatus);
  }, [units, filterStatus]);

  /**
   * معالجات الأحداث
   */
  const handleFilterChange = useCallback((status) => {
    setFilterStatus(status);
  }, []);

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="loading-overlay" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container" style={{ textAlign: 'center' }}>
          <div className="loading-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div className="loading-text" style={{ fontSize: '18px', color: '#0f172a' }}>
            جاري تحميل صفحة الدروس...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container" style={{ minHeight: '100vh', padding: '40px 20px' }}>
        <div className="error-card" style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          padding: '32px', 
          background: '#fff', 
          borderRadius: '16px', 
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '16px' }}>حدث خطأ</h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              background: '#00BCD4',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSidebar && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}

      <div className="dashboard-container">
        <div className="dashboard-shell">

          {/* القائمة الجانبية */}
          <aside className={`dashboard-sidebar ${showSidebar ? 'open' : ''}`}>
            <button className="sidebar-close" onClick={toggleSidebar}>✕</button>
            <nav>
              <ul className="sidebar-menu">
                <li className="sidebar-menu-item">
                  <a href="/dashboard" className="sidebar-menu-link">
                    <span className="sidebar-menu-text">نظرة عامة</span>
                    <span className="sidebar-menu-icon">🏠</span>
                  </a>
                </li>
                <li className="sidebar-menu-item">
                  <a href="#" className="sidebar-menu-link active">
                    <span className="sidebar-menu-text">التعلّم والألعاب</span>
                    <span className="sidebar-menu-icon">🎮</span>
                  </a>
                </li>
                <li className="sidebar-menu-item">
                  <a href="#" className="sidebar-menu-link">
                    <span className="sidebar-menu-text">لعب جماعي</span>
                    <span className="sidebar-menu-icon">🛡️</span>
                  </a>
                </li>
                <li className="sidebar-menu-item">
                  <a href="#" className="sidebar-menu-link" onClick={handleLogout}>
                    <span className="sidebar-menu-text">تسجيل الخروج</span>
                    <span className="sidebar-menu-icon">🚪</span>
                  </a>
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
                  <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
                  <Logo variant="default" size="small" showText={false} />
                  <div className="brand-info">
                    <div className="brand-title">منصة سلمى التعليمية</div>
                    <div className="brand-subtitle">صفحة التعلّم</div>
                  </div>
                </div>

                <div className="user-section">
                  <div className="notification-wrapper">
                    <button 
                      className="icon-btn" 
                      onClick={toggleNotifications}
                    >
                      🔔
                      <span className="notification-badge">
                        {toArabicNumbers(notifications.length)}
                      </span>
                    </button>
                    {showNotifications && (
                      <div className="notification-panel">
                        <div className="notification-header">
                          <div className="notification-title">إشعارات جديدة</div>
                          <div className="notification-count">
                            {toArabicNumbers(notifications.length)} إشعارات
                          </div>
                        </div>
                        <ul className="notification-list">
                          {notifications.length === 0 ? (
                            <li className="notification-item">لا توجد إشعارات جديدة</li>
                          ) : (
                            notifications.map((notif, idx) => (
                              <li key={idx} className="notification-item">
                                {notif.message}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="user-chip">
                    <div className="user-avatar">
                      {getInitials(studentData?.full_name)}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{studentData?.full_name || 'طالبة'}</div>
                      <div className="user-role">
                        {gradeNumberToText(studentData?.grade)}
                        {classInfo?.class_name && ` - ${classInfo.class_name}`}
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* عنوان الصفحة */}
              <section className="page-title-section">
                <h1 className="page-title">
                  <span>📚</span>
                  <span>صفحة التعلّم</span>
                </h1>
                <p className="page-subtitle">
                  اختاري الوحدة التي تريدين التقدّم فيها، وابدئي اللعب على دروس الرياضيات
                  {studentData?.grade && ` للصف ${gradeNumberToText(studentData.grade)}`}.
                </p>
              </section>

              {/* فلاتر الدروس */}
              <div className="filters-section">
                <button 
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  الكل
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('completed')}
                >
                  ✓ مكتملة
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('in-progress')}
                >
                  ⏳ جارية
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'locked' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('locked')}
                >
                  🔒 مقفلة
                </button>
              </div>

              {/* الوحدات الدراسية */}
              <section>
                <div className="row g-3">
                  {filteredUnits.map((unit, index) => (
                    <div key={unit.unitId} className="col-12 col-md-6 col-lg-4">
                      <div className="lesson-card" data-status={unit.status}>
                        <span className={`lesson-status status-${unit.status}`}>
                          {unit.status === 'completed' && '✓ مكتمل'}
                          {unit.status === 'in-progress' && '⏳ جاري'}
                          {unit.status === 'locked' && '🔒 مقفلة'}
                        </span>
                        
                        <div className="lesson-icon" style={{ background: `${unit.color}20`, color: unit.color }}>
                          {unit.unitIcon}
                        </div>
                        
                        <h3 className="lesson-title">{unit.unitName}</h3>

                        <div className="progress-wrapper">
                          <div className="progress-label">
                            <span>التقدم</span>
                            <span>{toArabicNumbers(unit.progress)}%</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${unit.progress}%`,
                                background: `linear-gradient(90deg, ${unit.color}, ${unit.color}dd)`
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="cta-row">
                          {unit.status !== 'locked' ? (
                            <>
                              <a 
                                href={`#/unit/${unit.unitId}/lessons`} 
                                className="cta-btn cta-btn-primary"
                              >
                                <span className="cta-icon">📖</span>
                                <span>الدروس والتمارين</span>
                              </a>
                              <button className="cta-btn cta-btn-secondary">
                                <span className="cta-icon">🎮</span>
                                <span>الألعاب</span>
                              </button>
                            </>
                          ) : (
                            <button className="cta-btn cta-btn-disabled" disabled>
                              <span className="cta-icon">🔒</span>
                              <span>مقفلة حالياً</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ملاحظة التذييل */}
              <div className="footer-note">
                <span>منصة سلمى التعليمية</span> – صفحة التعلّم تعرض الوحدات مع نسبة التقدم في كل وحدة.
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

export default StudentLessonsPage;
