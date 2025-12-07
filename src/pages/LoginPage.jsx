import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { supabase } from '../utils/supabaseClient';

function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // التحقق من وجود جلسة نشطة عند تحميل الصفحة
  useEffect(() => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
      if (currentUser.role === 'student') {
        navigate('/dashboard');
      } else if (currentUser.role === 'teacher') {
        navigate('/teacher-dashboard');
      }
    }
  }, [navigate]);

  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setFormData({ username: '', password: '' });
  }, []);

  const showError = useCallback((message) => {
    setError(message);
    setSuccess('');
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccess(message);
    setError('');
  }, []);

  const handleLogin = async (e, role) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { username, password } = formData;

    if (!username || !password) {
      showError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      // البحث عن المستخدم
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (userError || !user) {
        showError('اسم المستخدم أو كلمة المرور غير صحيحة');
        setIsLoading(false);
        return;
      }

      // التحقق من كلمة المرور
      if (user.password_hash !== password) {
        showError('اسم المستخدم أو كلمة المرور غير صحيحة');
        setIsLoading(false);
        return;
      }

      // التحقق من نوع الحساب
      if (user.role !== role) {
        showError(`هذا الحساب لا يمكنه تسجيل الدخول ك${role === 'student' ? 'طالبة' : 'معلمة'}`);
        setIsLoading(false);
        return;
      }

      if (role === 'student') {
        // جلب بيانات الطالبة
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (studentError || !student) {
          showError('تم العثور على المستخدم، لكن لم يتم العثور على بيانات الطالبة المرتبطة به');
          setIsLoading(false);
          return;
        }

        // حفظ بيانات الجلسة
        const currentUser = {
          userId: user.user_id,
          role: 'student',
          studentId: student.student_id,
          fullName: student.full_name
        };

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

        showSuccess('تم تسجيل الدخول بنجاح! جاري التحويل...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);

      } else if (role === 'teacher') {
        // جلب بيانات المعلمة
        const { data: teacher, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (teacherError || !teacher) {
          showError('تم العثور على المستخدم، لكن لم يتم العثور على بيانات المعلمة المرتبطة به');
          setIsLoading(false);
          return;
        }

        // حفظ بيانات الجلسة
        const currentUser = {
          userId: user.user_id,
          role: 'teacher',
          teacherId: teacher.teacher_id,
          fullName: teacher.full_name
        };

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

        showSuccess('تم تسجيل الدخول بنجاح! جاري التحويل...');
        setTimeout(() => {
          navigate('/teacher-dashboard');
        }, 1000);
      }

    } catch (err) {
      console.error('Login error:', err);
      showError('حدث خطأ في الاتصال. حاولي مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="decorative-bg"></div>

      <div className="login-container">
        <div className="login-card">
          
          {/* Header */}
          <div className="login-header">
            <Logo variant="gradient" size="medium" showText={true} />
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => switchTab('student')}
            >
              <span className="tab-icon">👩‍🎓</span>
              طالبة
            </button>
            <button
              className={`tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
              onClick={() => switchTab('teacher')}
            >
              <span className="tab-icon">👩‍🏫</span>
              معلمة
            </button>
          </div>

          {/* Body */}
          <div className="login-body">
            
            {/* Error Message */}
            {error && (
              <div className="error-message show">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="success-message show">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Student Tab */}
            {activeTab === 'student' && (
              <div className="tab-content active">
                <form onSubmit={(e) => handleLogin(e, 'student')}>
                  <div className="form-group">
                    <label className="form-label">اسم المستخدم</label>
                    <input
                      type="text"
                      className="form-input"
                      id="username"
                      name="username"
                      placeholder="أدخلي اسم المستخدم"
                      value={formData.username}
                      onChange={handleInputChange}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">كلمة المرور</label>
                    <input
                      type="password"
                      className="form-input"
                      id="password"
                      name="password"
                      placeholder="أدخلي كلمة المرور"
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className={`submit-btn ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    <span className="btn-text">
                      {isLoading ? 'جاري التحقق...' : 'دخول 🚀'}
                    </span>
                    {isLoading && <span className="spinner"></span>}
                  </button>
                </form>
                <p className="help-text">
                  ليس لديكِ حساب؟ <a href="/register" className="help-link">سجّلي من هنا</a>
                </p>
              </div>
            )}

            {/* Teacher Tab */}
            {activeTab === 'teacher' && (
              <div className="tab-content active">
                <form onSubmit={(e) => handleLogin(e, 'teacher')}>
                  <div className="form-group">
                    <label className="form-label">اسم المستخدم</label>
                    <input
                      type="text"
                      className="form-input"
                      id="username"
                      name="username"
                      placeholder="أدخلي اسم المستخدم"
                      value={formData.username}
                      onChange={handleInputChange}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">كلمة المرور</label>
                    <input
                      type="password"
                      className="form-input"
                      id="password"
                      name="password"
                      placeholder="أدخلي كلمة المرور"
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className={`submit-btn ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    <span className="btn-text">
                      {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                    </span>
                    {isLoading && <span className="spinner"></span>}
                  </button>
                </form>
                <p className="help-text">
                  ليس لديكِ حساب؟ <a href="/register" className="help-link">سجّلي من هنا</a>
                </p>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="login-footer">
            جميع الحقوق محفوظة لمنصة سلمى التعليمية © 2025
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
