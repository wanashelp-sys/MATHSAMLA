// مكون PWA Install Banner - لتثبيت التطبيق على الأجهزة
import { useState, useEffect } from 'react';

function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // الاستماع لحدث beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      // منع عرض المتصفح الافتراضي للتثبيت
      e.preventDefault();
      // حفظ الحدث لاستخدامه لاحقاً
      setDeferredPrompt(e);
      // عرض البانر المخصص
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // التحقق إذا كان التطبيق مثبت بالفعل
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // عرض نافذة التثبيت
    deferredPrompt.prompt();

    // انتظار اختيار المستخدم
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ تم قبول تثبيت التطبيق');
    } else {
      console.log('❌ تم رفض تثبيت التطبيق');
    }

    // إعادة تعيين deferredPrompt
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // حفظ في localStorage أن المستخدم رفض التثبيت
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // عدم عرض البانر إذا رفض المستخدم سابقاً
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setShowBanner(false);
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`pwa-install-banner ${showBanner ? 'show' : ''}`}>
      <div className="pwa-install-content">
        <div className="pwa-install-title">📱 ثبّتي التطبيق على جهازك</div>
        <div className="pwa-install-description">
          للوصول السريع وتجربة أفضل، قومي بتثبيت منصة سلمى على شاشة جهازك الرئيسية
        </div>
      </div>
      <div className="pwa-install-buttons">
        <button 
          className="pwa-install-btn primary" 
          onClick={handleInstallClick}
        >
          تثبيت
        </button>
        <button 
          className="pwa-install-btn secondary" 
          onClick={handleDismiss}
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}

export default PWAInstallBanner;
