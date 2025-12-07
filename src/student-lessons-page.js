import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supa = createClient(supabaseUrl, supabaseAnonKey);

// تحويل الأرقام الإنجليزية إلى عربية
function toArabicNumbers(str) {
  return String(str).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// تحويل رقم الصف إلى نص عربي
function gradeToText(grade) {
  const grades = ['الصف الأول','الصف الثاني','الصف الثالث','الصف الرابع','الصف الخامس','الصف السادس'];
  return grades[grade-1] || '';
}

// استخراج أول حرفين من الاسم العربي
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
}

// إعداد الوحدات (يرجى ملء lessonCodes لاحقاً)
const UNITS_CONFIG = [
  { unitId: 'place_value', cardSelector: '#unit-place-value', lessonCodes: [/* مثال: "1-1", "1-7" */] },
  { unitId: 'compare_numbers', cardSelector: '#unit-compare-numbers', lessonCodes: [/* ... */] },
  { unitId: 'add_subtract', cardSelector: '#unit-add-subtract', lessonCodes: [/* ... */] },
  { unitId: 'multiply', cardSelector: '#unit-multiply', lessonCodes: [/* ... */] },
  { unitId: 'division', cardSelector: '#unit-division', lessonCodes: [/* ... */] },
  { unitId: 'algebra', cardSelector: '#unit-algebra', lessonCodes: [/* ... */] },
  { unitId: 'fractions', cardSelector: '#unit-fractions', lessonCodes: [/* ... */] },
];

// تحميل بيانات الطالبة والفصل
async function loadStudentLessons() {
  // تحقق من هوية المستخدم
  const userRaw = localStorage.getItem('currentUser');
  let currentUser;
  try { currentUser = JSON.parse(userRaw); } catch { currentUser = null; }
  if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
    window.location.href = '/login.html';
    return;
  }
  const currentStudentId = currentUser.studentId;
  const currentUserId = currentUser.userId;

  // جلب بيانات الطالبة
  const { data: student, error: errStudent } = await supa
    .from('students')
    .select('full_name, grade')
    .eq('student_id', currentStudentId)
    .single();
  if (errStudent || !student) {
    showError('تعذر تحميل بيانات الطالبة');
    return;
  }

  // جلب الفصول المرتبطة بالطالبة
  const { data: studentClasses, error: errClasses } = await supa
    .from('student_classes')
    .select('class_id')
    .eq('student_id', currentStudentId);
  if (errClasses) {
    showError('تعذر تحميل بيانات الفصول');
    return;
  }
  if (!studentClasses || studentClasses.length === 0) {
    showError('لم يتم ربطك بأي فصل بعد، انتظري معلمتك 💜');
    return;
  }
  // اختيار الفصل النشط: أقل class_id
  const activeClassId = studentClasses.map(c => c.class_id).sort()[0];

  // جلب اسم الفصل
  const { data: classObj } = await supa
    .from('classes')
    .select('class_name')
    .eq('class_id', activeClassId)
    .single();
  const className = classObj?.class_name || '';

  // تحديث الهيدر
  updateHeader(student.full_name, student.grade, className);

  // جلب دروس الفصل
  const { data: classLessons } = await supa
    .from('class_lessons')
    .select('lesson_id, status')
    .eq('class_id', activeClassId);
  const lessonIds = classLessons?.map(l => l.lesson_id) || [];
  const statusByLessonId = {};
  classLessons?.forEach(l => { statusByLessonId[l.lesson_id] = l.status; });

  // جلب معلومات الدروس
  const { data: lessons } = await supa
    .from('lessons')
    .select('lesson_id, lesson_code, lesson_name')
    .in('lesson_id', lessonIds);
  const lessonsById = {};
  lessons?.forEach(l => {
    lessonsById[l.lesson_id] = {
      ...l,
      statusFromClass: statusByLessonId[l.lesson_id]
    };
  });

  // جلب نتائج الطالبة
  const { data: results } = await supa
    .from('lesson_results')
    .select('lesson_id, correct_count, total_count')
    .eq('student_id', currentStudentId)
    .in('lesson_id', lessonIds);
  // حساب أفضل دقة لكل درس
  const bestAccuracyByLessonId = {};
  results?.forEach(r => {
    if (!r.total_count) return;
    const acc = r.correct_count / r.total_count;
    if (!bestAccuracyByLessonId[r.lesson_id] || acc > bestAccuracyByLessonId[r.lesson_id]) {
      bestAccuracyByLessonId[r.lesson_id] = acc;
    }
  });

  // تحديث بطاقات الوحدات
  for (const unit of UNITS_CONFIG) {
    const card = document.querySelector(unit.cardSelector);
    if (!card) continue;
    // جمع الدروس الخاصة بهذه الوحدة
    const unitLessons = Object.values(lessonsById).filter(l => unit.lessonCodes.includes(l.lesson_code));
    const openLessons = unitLessons.filter(l => l.statusFromClass === 'open');
    const lockedLessons = unitLessons.filter(l => l.statusFromClass === 'locked');
    // إذا كل الدروس مقفلة
    if (openLessons.length === 0 && lockedLessons.length > 0) {
      updateUnitCard(card, 0, 'locked', 0);
      continue;
    }
    // حساب التقدم
    let sumAcc = 0, completed = 0, withResults = 0;
    openLessons.forEach(l => {
      const acc = bestAccuracyByLessonId[l.lesson_id] || 0;
      sumAcc += acc;
      if (acc >= 0.95) completed++;
      if (acc > 0) withResults++;
    });
    const openCount = openLessons.length;
    const unitProgress = openCount ? Math.round((sumAcc / openCount) * 100) : 0;
    let status = 'in-progress';
    if (openCount && completed === openCount) status = 'completed';
    if (openCount && withResults === 0) status = 'in-progress';
    updateUnitCard(card, unitProgress, status, openCount);
  }

  // جلب الإشعارات
  await loadNotifications(currentStudentId, activeClassId);
}

function updateHeader(fullName, grade, className) {
  // اسم الطالبة
  const nameEl = document.querySelector('.user-name');
  if (nameEl) nameEl.textContent = 'الطالبة ' + fullName;
  // الصف والفصل
  const roleEl = document.querySelector('.user-role');
  if (roleEl) {
    let txt = gradeToText(grade);
    if (className) txt += ' - فصل ' + className;
    roleEl.textContent = txt;
  }
  // دائرة الأفاتار
  const avatarEl = document.querySelector('.user-avatar');
  if (avatarEl) avatarEl.textContent = getInitials(fullName);
}

function updateUnitCard(card, progress, status, openCount) {
  card.setAttribute('data-status', status);
  // شارة الحالة
  const statusSpan = card.querySelector('.lesson-status');
  if (statusSpan) {
    if (status === 'completed') {
      statusSpan.textContent = '✓ مكتمل';
      statusSpan.className = 'lesson-status status-completed';
    } else if (status === 'locked') {
      statusSpan.textContent = '🔒 مقفلة';
      statusSpan.className = 'lesson-status status-locked';
    } else {
      statusSpan.textContent = openCount ? '⏳ جاري' : 'لم يبدأ';
      statusSpan.className = 'lesson-status status-in-progress';
    }
  }
  // شريط التقدم
  const bar = card.querySelector('.progress-bar-fill');
  if (bar) bar.style.width = progress + '%';
  // نص النسبة
  const percentEl = card.querySelector('.progress-label span:last-child');
  if (percentEl) percentEl.textContent = toArabicNumbers(progress) + '%';
}

async function loadNotifications(studentId, classId) {
  // جلب آخر 3 إشعارات
  const { data: notifs } = await supa
    .from('notifications')
    .select('message, created_at')
    .or(`(target_type.eq.student,student_id.eq.${studentId}),(target_type.eq.class,class_id.eq.${classId}),(target_type.eq.all)`)
    .order('created_at', { ascending: false })
    .limit(3);
  // تحديث شارة الجرس
  const badge = document.querySelector('.notification-badge');
  if (badge) badge.textContent = toArabicNumbers(notifs?.length || 0);
  // تحديث قائمة الإشعارات
  const list = document.querySelector('.notification-list');
  if (list) {
    list.innerHTML = '';
    (notifs || []).forEach(n => {
      const li = document.createElement('li');
      li.className = 'notification-item';
      li.textContent = n.message;
      list.appendChild(li);
    });
  }
  // تحديث العداد
  const countEl = document.querySelector('.notification-count');
  if (countEl) countEl.textContent = toArabicNumbers(notifs?.length || 0) + ' إشعارات';
}

function showError(msg) {
  // عرض رسالة خطأ لطيفة في الصفحة
  const wrapper = document.querySelector('.dashboard-wrapper');
  if (wrapper) {
    wrapper.innerHTML = `<div style="text-align:center;padding:40px 0;font-size:18px;color:#92400e;">${msg}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadStudentLessons);

// زر "عرض كل الإشعارات"
document.getElementById('viewAllNotificationsBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/dashboard.html?tab=notifications';
});
