import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import emailjs from 'emailjs-com';
import Logo from '../components/Logo';

// إعداد Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ydmavbbgtvkygosbyezv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbWF2YmJndHZreWdvc2J5ZXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTY5MzgsImV4cCI6MjA3ODM3MjkzOH0.Ri4TmK2Bv7xx3DZl0D0pPK7dOOSM7OkP9FPko_-R3Ys';
// Use 'supabase' from supabaseClient.js

// إعداد EmailJS
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_tv0lnvr';
const TEACHER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEACHER_TEMPLATE_ID || 'template_3doz3mf';
const STUDENT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_STUDENT_TEMPLATE_ID || 'template_jmr3xcd';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY';

emailjs.init(PUBLIC_KEY);

function RegisterPage() {
  const [currentRole, setCurrentRole] = useState('teacher');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    grade: '',
    className: '',
    teacherCode: '',
    acceptPolicy: false
  });
  const [generatedCode, setGeneratedCode] = useState('سيظهر هنا بعد إنشاء الحساب');
  const [error, setError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    title: '',
    text: '',
    extra: ''
  });

  // تحديث نص التلميحات عند تغيير الدور
  const getRoleHint = () => {
    if (currentRole === 'teacher') {
      return 'أنتِ الآن في وضع <strong>تسجيل المعلمة</strong>، سيتم إنشاء كود فصل خاص بك لضم الطالبات.';
    }
    return 'أنتِ الآن في وضع <strong>تسجيل الطالبة</strong>، ستنضمّين لفصل معلمتك باستخدام الكود الذي تحصلين عليه منها.';
  };

  const getSideContent = () => {
    if (currentRole === 'teacher') {
      return {
        tag: { icon: '🌐', text: 'تسجيل معلمة من المتصفح' },
        title: 'مرحباً بك في منصة سلمى التعليمية 👋',
        subtitle: 'حساب المعلمة يمنحك أدوات إدارة الفصول، إنشاء التحديات، ومتابعة تقدّم طالباتك بتقارير ذكية.',
        list: [
          'لوحة تحكم للمعلمة لمتابعة تقدّم كل طالبة.',
          'إنشاء تحديات فردية وجماعية في مهارات الرياضيات.',
          'تقارير وبيانات تساعدك في دعم الطالبات المتعثّرات.'
        ],
        footer: 'عند تسجيلك كمعلمة، سيتم إنشاء كود خاص لفصلك يمكنك مشاركته مع الطالبات. سيتم إرسال الكود إلى بريدك الإلكتروني أيضًا.'
      };
    }
    return {
      tag: { icon: '👧🏻', text: 'تسجيل طالبة' },
      title: 'جاهزة للمغامرة؟ 🎮',
      subtitle: 'سجّلي حسابك وادخلي عالم التحديات والألعاب التعليمية في منصة سلمى التعليمية.',
      list: [
        'ألعاب تعليمية ممتعة تجعل الرياضيات مغامرة.',
        'تحديات، نقاط، وأوسمة لبطلات المنصة.',
        'متابعة تقدّمك في كل مهارة خطوة بخطوة.'
      ],
      footer: 'احصلي على كود الفصل من معلمتك، ثم اكتبيه هنا للانضمام لفصلها والمشاركة في التحديات.'
    };
  };

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    setError('');
    setGlobalError('');
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const generateTeacherCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyTeacherCode = () => {
    if (!generatedCode || generatedCode.includes('سيظهر')) return;
    navigator.clipboard.writeText(generatedCode)
      .then(() => alert('تم نسخ الكود: ' + generatedCode))
      .catch(() => alert('يمكنك نسخ الكود يدويًا: ' + generatedCode));
  };

  const sendTeacherWelcomeEmail = async ({ teacher_name, teacher_email, teacher_code, login_url }) => {
    try {
      await emailjs.send(SERVICE_ID, TEACHER_TEMPLATE_ID, {
        teacher_name,
        teacher_email,
        teacher_code,
        login_url
      });
    } catch (error) {
      console.warn('Teacher email send failed:', error);
    }
  };

  const sendStudentWelcomeEmail = async ({ student_name, student_email, teacher_name, teacher_code, login_url }) => {
    try {
      await emailjs.send(SERVICE_ID, STUDENT_TEMPLATE_ID, {
        student_name,
        student_email,
        teacher_name,
        teacher_code,
        login_url
      });
    } catch (error) {
      console.warn('Student email send failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGlobalError('');
    setIsSubmitting(true);

    const { fullName, email, phone, username, password, confirmPassword, acceptPolicy } = formData;

    // التحقق من البيانات الأساسية
    if (!fullName) {
      setError('❌ يرجى كتابة الاسم الثلاثي.');
      setIsSubmitting(false);
      return;
    }
    if (!email) {
      setError('❌ يرجى كتابة البريد الإلكتروني.');
      setIsSubmitting(false);
      return;
    }
    if (!username) {
      setError('❌ يرجى اختيار اسم مستخدم.');
      setIsSubmitting(false);
      return;
    }
    if (!password || password.length < 6) {
      setError('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      setIsSubmitting(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('❌ كلمتا المرور غير متطابقتين.');
      setIsSubmitting(false);
      return;
    }
    if (!acceptPolicy) {
      setError('❌ يجب الموافقة على شروط الاستخدام وسياسة الخصوصية أولاً.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (currentRole === 'teacher') {
        // تسجيل معلمة
        const { schoolName } = formData;
        if (!schoolName) {
          setError('❌ يرجى كتابة اسم المدرسة.');
          setIsSubmitting(false);
          return;
        }

        // 1) إنشاء المستخدم
        const { data: userRow, error: userError } = await supabase
          .from('users')
          .insert({
            username,
            email,
            phone: phone || null,
            password_hash: password,
            role: 'teacher'
          })
          .select('user_id, username, email')
          .single();

        if (userError || !userRow) {
          console.error('userError (teacher):', userError);
          if (userError && userError.code === '23505') {
            setError('❌ البريد الإلكتروني أو اسم المستخدم مسجّل مسبقاً. جرّبي بيانات مختلفة.');
          } else {
            setError('❌ تعذّر إنشاء حساب الدخول (خطأ من قاعدة البيانات).');
            setGlobalError((userError && (userError.code + ': ' + userError.message)) || 'خطأ غير معروف من Supabase.');
          }
          setIsSubmitting(false);
          return;
        }

        const userId = userRow.user_id;

        // 2) إنشاء سجل المعلمة
        const { data: teacherRow, error: teacherError } = await supabase
          .from('teachers')
          .insert({
            full_name: fullName,
            user_id: userId,
            school_name: schoolName
          })
          .select('teacher_id')
          .single();

        if (teacherError || !teacherRow) {
          console.error('teacherError:', teacherError);
          setError('❌ تم إنشاء حساب الدخول، لكن تعذّر حفظ بيانات المعلمة.');
          if (teacherError) {
            setGlobalError(teacherError.code + ': ' + teacherError.message);
          }
          setIsSubmitting(false);
          return;
        }

        const teacherId = teacherRow.teacher_id;
        const teacherCode = generateTeacherCode();

        // 3) إنشاء الفصل
        const { data: classRow, error: classError } = await supabase
          .from('classes')
          .insert({
            teacher_id: teacherId,
            class_name: 'فصل منصة سلمى',
            join_code: teacherCode
          })
          .select('class_id, join_code')
          .single();

        if (classError || !classRow) {
          console.error('classError:', classError);
          setError('❌ تم إنشاء حساب المعلمة، لكن تعذّر إنشاء الفصل الافتراضي.');
          if (classError) {
            setGlobalError(classError.code + ': ' + classError.message);
          }
          setIsSubmitting(false);
          return;
        }

        const finalCode = classRow.join_code || teacherCode;
        setGeneratedCode(finalCode);

        // إرسال بريد ترحيبي
        await sendTeacherWelcomeEmail({
          teacher_name: fullName,
          teacher_email: email,
          teacher_code: finalCode,
          login_url: window.location.origin + '/teacher-login'
        });

        setSuccessData({
          title: 'تم إنشاء حساب المعلمة بنجاح 🎉',
          text: 'تم إنشاء حسابك وربط فصل افتراضي خاص بك.',
          extra: `يمكنك الآن مشاركة هذا الكود مع طالباتك: ${finalCode}. تم إرسال رسالة ترحيبية إلى بريدك تحتوي على الكود وتعليمات الدخول.`
        });
        setShowSuccessModal(true);

      } else {
        // تسجيل طالبة
        const { grade, className, teacherCode } = formData;

        if (!grade) {
          setError('❌ يرجى اختيار الصف الدراسي.');
          setIsSubmitting(false);
          return;
        }
        if (!className) {
          setError('❌ يرجى كتابة اسم الفصل مثل: خامس-1.');
          setIsSubmitting(false);
          return;
        }
        if (!teacherCode) {
          setError('❌ يرجى إدخال كود المعلمة للانضمام إلى الفصل.');
          setIsSubmitting(false);
          return;
        }

        // 1) العثور على الفصل
        const { data: classFound, error: classFindError } = await supabase
          .from('classes')
          .select('class_id, teacher_id, join_code')
          .eq('join_code', teacherCode)
          .single();

        if (classFindError || !classFound) {
          console.error('classFindError:', classFindError);
          setError('❌ تعذّر العثور على فصل بهذا الكود. تحقّقي من صحة الكود مع معلمتك.');
          if (classFindError) {
            setGlobalError(classFindError.code + ': ' + classFindError.message);
          }
          setIsSubmitting(false);
          return;
        }

        // 2) إنشاء المستخدم
        const { data: userRow, error: userError } = await supabase
          .from('users')
          .insert({
            username,
            email,
            phone: phone || null,
            password_hash: password,
            role: 'student'
          })
          .select('user_id, username, email')
          .single();

        if (userError || !userRow) {
          console.error('userError (student):', userError);
          if (userError && userError.code === '23505') {
            setError('❌ البريد الإلكتروني أو اسم المستخدم مسجّل مسبقاً. جرّبي بيانات مختلفة.');
          } else {
            setError('❌ تعذّر إنشاء حساب الدخول (خطأ من قاعدة البيانات).');
            setGlobalError((userError && (userError.code + ': ' + userError.message)) || 'خطأ غير معروف من Supabase.');
          }
          setIsSubmitting(false);
          return;
        }

        const userId = userRow.user_id;

        // 3) إنشاء سجل الطالبة
        const { data: studentRow, error: studentError } = await supabase
          .from('students')
          .insert({
            full_name: fullName,
            user_id: userId,
            grade: Number(grade),
            class_section: className
          })
          .select('student_id')
          .single();

        if (studentError || !studentRow) {
          console.error('studentError:', studentError);
          setError('❌ تم إنشاء حساب الدخول، لكن تعذّر حفظ بيانات الطالبة.');
          if (studentError) {
            setGlobalError(studentError.code + ': ' + studentError.message);
          }
          setIsSubmitting(false);
          return;
        }

        // 4) ربط الطالبة بالفصل
        const { error: scError } = await supabase
          .from('student_classes')
          .insert({
            student_id: studentRow.student_id,
            class_id: classFound.class_id
          });

        if (scError) {
          console.error('student_classes error:', scError);
          setError('❌ تم إنشاء حساب الطالبة لكن تعذّر ربطها بالفصل.');
          setGlobalError(scError.code + ': ' + scError.message);
          setIsSubmitting(false);
          return;
        }

        // 5) اسم المعلمة للبريد
        let teacherNameForEmail = 'معلمتك';
        try {
          const { data: teacherData, error: teacherFetchError } = await supabase
            .from('teachers')
            .select('full_name')
            .eq('teacher_id', classFound.teacher_id)
            .single();

          if (!teacherFetchError && teacherData && teacherData.full_name) {
            teacherNameForEmail = teacherData.full_name;
          }
        } catch (fetchErr) {
          console.warn('fetch teacher name failed:', fetchErr);
        }

        // إرسال بريد ترحيبي
        await sendStudentWelcomeEmail({
          student_name: fullName,
          student_email: email,
          teacher_name: teacherNameForEmail,
          teacher_code: teacherCode,
          login_url: window.location.origin + '/student-login'
        });

        setSuccessData({
          title: 'تم إنشاء حساب الطالبة بنجاح 🎉',
          text: 'تم إنشاء حسابك وربطك بفصل معلمتك داخل المنصة.',
          extra: 'يمكنك الآن تسجيل الدخول والمشاركة في التحديات والألعاب التعليمية. تم إرسال رسالة ترحيبية إلى بريدك.'
        });
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Unexpected error in register:', err);
      setError('❌ حدث خطأ غير متوقع أثناء عملية التسجيل.');
      setGlobalError(err?.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sideContent = getSideContent();

  return (
    <div className="auth-wrapper">
      <div className="auth-card row g-0">
        {/* اللوحة الجانبية */}
        <div className="col-lg-5 auth-side d-flex flex-column justify-content-between">
          <div>
            <div className="side-tag">
              <span>{sideContent.tag.icon}</span>
              <span>{sideContent.tag.text}</span>
            </div>
            <h2 className="side-title">{sideContent.title}</h2>
            <p className="side-sub">{sideContent.subtitle}</p>

            <ul className="side-list">
              {sideContent.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <p className="side-footer-note mb-0">{sideContent.footer}</p>
        </div>

        {/* نموذج التسجيل */}
        <div className="col-lg-7 auth-form-wrapper">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Logo variant="default" size="small" showText={true} />

            <div className="role-toggle-group">
              <button
                type="button"
                className={`role-toggle ${currentRole === 'teacher' ? 'active' : ''}`}
                onClick={() => handleRoleChange('teacher')}
              >
                معلمة
              </button>
              <button
                type="button"
                className={`role-toggle ${currentRole === 'student' ? 'active' : ''}`}
                onClick={() => handleRoleChange('student')}
              >
                طالبة
              </button>
            </div>
          </div>

          <div 
            id="roleHint" 
            className="text-muted mb-3" 
            dangerouslySetInnerHTML={{ __html: getRoleHint() }}
          />

          {/* صندوق الأخطاء */}
          {error && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-2"
              role="alert"
              onClick={() => setError('')}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ fontSize: '1.1rem' }}>⚠️</span>
              <span style={{ fontSize: '0.87rem' }}>{error}</span>
            </div>
          )}

          {globalError && (
            <div className="text-danger mb-2" style={{ fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
              {globalError}
            </div>
          )}

          {/* كارت النموذج */}
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              {/* بيانات أساسية مشتركة */}
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="fullName" className="form-label">الاسم الثلاثي</label>
                  <input
                    type="text"
                    id="fullName"
                    className="form-control"
                    placeholder="مثال: سلمى أحمد العسيري"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label">رقم الجوال (اختياري)</label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    placeholder="05XXXXXXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="username" className="form-label">اسم المستخدم</label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    placeholder="اكتبي اسم المستخدم للدخول للمنصة"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">كلمة المرور</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="6 أحرف/أرقام على الأقل"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    placeholder="أعيدي كتابة كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* قسم المعلمة */}
              {currentRole === 'teacher' && (
                <div className="mt-4">
                  <hr className="mt-3 mb-3" />
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>
                    بيانات المعلمة
                  </h6>

                  <div className="mb-3">
                    <label htmlFor="schoolName" className="form-label">اسم المدرسة</label>
                    <input
                      type="text"
                      id="schoolName"
                      className="form-control"
                      placeholder="مثال: الابتدائية الخامسة - جدة"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="alert alert-info d-flex justify-content-between align-items-center py-2 px-3 mt-3">
                    <div style={{ fontSize: '0.84rem' }}>
                      سيتم إنشاء <strong>كود فصل خاص</strong> يمكنك مشاركته مع طالباتك بعد التسجيل.
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 mt-2">
                    <span style={{ fontSize: '0.85rem' }}>كود الفصل (بعد التسجيل):</span>
                    <span
                      id="generatedCode"
                      className="fw-bold text-primary"
                      style={{ fontSize: '0.95rem', fontFamily: 'Tajawal, monospace', letterSpacing: '0.16em' }}
                    >
                      {generatedCode}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm copy-code-btn"
                      onClick={copyTeacherCode}
                    >
                      نسخ الكود
                    </button>
                  </div>
                </div>
              )}

              {/* قسم الطالبة */}
              {currentRole === 'student' && (
                <div className="mt-4">
                  <hr className="mt-3 mb-3" />
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>
                    بيانات الطالبة
                  </h6>

                  <div className="row g-3">
                    <div className="col-md-4 col-6">
                      <label htmlFor="grade" className="form-label">الصف الدراسي</label>
                      <select
                        id="grade"
                        className="form-select"
                        value={formData.grade}
                        onChange={handleInputChange}
                      >
                        <option value="">اختاري الصف</option>
                        <option value="1">الأول</option>
                        <option value="2">الثاني</option>
                        <option value="3">الثالث</option>
                        <option value="4">الرابع</option>
                        <option value="5">الخامس</option>
                        <option value="6">السادس</option>
                      </select>
                    </div>

                    <div className="col-md-8 col-6">
                      <label htmlFor="className" className="form-label">الفصل (مثال: خامس-1)</label>
                      <input
                        type="text"
                        id="className"
                        className="form-control"
                        placeholder="مثال: خامس-1"
                        value={formData.className}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="teacherCode" className="form-label">كود المعلمة للانضمام للفصل</label>
                      <input
                        type="text"
                        id="teacherCode"
                        className="form-control"
                        placeholder="اكتبي الكود الذي أعطتكِ إياه معلمتك"
                        value={formData.teacherCode}
                        onChange={handleInputChange}
                      />
                      <div className="form-text" style={{ fontSize: '0.8rem' }}>
                        احصلي على هذا الكود من معلمتك، ثم اكتبيه هنا للانضمام إلى فصلها داخل المنصة.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* شروط الاستخدام */}
              <div className="form-check mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="acceptPolicy"
                  checked={formData.acceptPolicy}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="acceptPolicy" style={{ fontSize: '0.84rem' }}>
                  أوافق على <a href="#" className="link-primary">شروط الاستخدام</a> و
                  <a href="#" className="link-primary">سياسة الخصوصية</a>.
                </label>
              </div>

              {/* زر الإرسال */}
              <div className="d-grid mt-4">
                <button
                  type="submit"
                  className="btn btn-main btn-lg d-flex justify-content-center align-items-center gap-2"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting 
                      ? 'جاري التسجيل...' 
                      : currentRole === 'teacher' 
                        ? 'إنشاء حساب معلمة الآن' 
                        : 'إنشاء حساب الطالبة الآن'}
                  </span>
                </button>
              </div>

              <div className="mt-3 text-center" style={{ fontSize: '0.82rem', color: 'var(--color-primary)' }}>
                لديكِ حساب مسبقاً؟
                <a href="/login" className="link-primary"> انتقلي إلى تسجيل الدخول</a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* مودال النجاح */}
      {showSuccessModal && (
        <div className="success-modal" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-badge">🎉</div>
            <h5 className="fw-bold mb-2">{successData.title}</h5>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{successData.text}</p>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-primary)' }}>{successData.extra}</p>

            <div className="success-modal-actions">
              <button 
                type="button" 
                className="btn btn-main btn-sm"
                onClick={() => setShowSuccessModal(false)}
              >
                حسناً، فهمت
              </button>
              <button 
                type="button" 
                className="btn btn-outline-main btn-sm"
                onClick={() => setShowSuccessModal(false)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
