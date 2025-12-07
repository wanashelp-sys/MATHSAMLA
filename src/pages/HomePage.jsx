// File: src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

function HomePage() {
  return (
    <div className="landing-container">
      <main className="main-card">
        
        {/* رأس الصفحة */}
        <header className="page-header">
          <div className="brand-section">
            <Logo variant="gradient" size="medium" showText={true} />
          </div>

          <nav className="nav-buttons">
            <Link to="/login" className="nav-link">تسجيل الدخول</Link>
            <Link to="/register" className="nav-link">التسجيل</Link>
          </nav>
        </header>

        {/* قسم البطل الرئيسي */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="tag-badge">
              <span>🧪 + 🎮</span>
              <span>اللعب، التجربة، ثم فهم الرياضيات بعمق</span>
            </div>

            <h2 className="hero-heading">
              مرحبًا بك في
              <span className="gradient-text"> منصة سلمى التعليمية </span>
              لتعلّم الرياضيات باللعب
            </h2>

            <p className="hero-description">
              تهدف هذه المنصّة إلى تقديم مادة الرياضيات بأسلوب تعليمي مختلف وجذاب، يعتمد على عرض المحتوى في جو من المرح واللعب والتعلّم، مع توفير نظام لتحليل النتائج وقياس مستوى التقدّم في المادة بأسلوب ممتع ومشوِّق يُسهم في تنمية الدافعية للتعلّم، ويراعي الفروق الفردية بين الطالبات وأنماط التعلّم المختلفة. 🌟📊
            </p>

          </div>

          {/* الجزء البصري المحسّن */}
          <div className="hero-visual">
            <div className="visual-card-wrapper">
              {/* البطاقة الرئيسية */}
              <div className="visual-main-card">
                {/* فقاعات متطايرة */}
                <div className="bubble bubble-1"></div>
                <div className="bubble bubble-2"></div>
                <div className="bubble bubble-3"></div>
                <div className="bubble bubble-4"></div>
                <div className="bubble bubble-5"></div>
                <div className="bubble bubble-6"></div>
                <div className="bubble bubble-7"></div>
                <div className="bubble bubble-8"></div>
                <div className="bubble bubble-9"></div>
                <div className="bubble bubble-10"></div>
                <div className="bubble bubble-11"></div>
                <div className="bubble bubble-12"></div>
                
                {/* الشعار المركزي الثابت */}
                <div className="visual-center-content">
                  <img src="/logo.png" alt="شعار منصة سلمى التعليمية" className="visual-logo-image" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* بطاقة المعلومات - بنر كامل العرض */}
        <section className="banner-section">
          <div className="info-badge-enhanced">
            <div className="badge-icon">✨</div>
            <div className="badge-content">
              <div className="badge-title">أكثر من مجرد تمارين</div>
              <div className="badge-text">تحديات • شخصيات • إنجازات</div>
            </div>
            <div className="badge-stats">
              <div className="stat-item">
                <span className="stat-icon">🎯</span>
                <span className="stat-number">+50</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🏆</span>
                <span className="stat-number">+20</span>
              </div>
            </div>
          </div>
        </section>

        {/* التذييل */}
        <footer className="page-footer">
          © 2025 منصة سلمى التعليمية لتعلّم الرياضيات باللعب | تطوير معلمة سلمى بكل حب 💜
        </footer>

      </main>
    </div>
  )
}

export default HomePage
