// مكون الشعار الموحد لمنصة سلمى التعليمية
import React from 'react';

function Logo({ variant = 'default', showText = true, size = 'medium' }) {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  };

  const variantClasses = {
    default: 'logo-default',
    light: 'logo-light',
    dark: 'logo-dark',
    gradient: 'logo-gradient'
  };

  return (
    <div className={`unified-logo ${sizeClasses[size]} ${variantClasses[variant]}`}>
      <div className="logo-icon">
        <img src="/logo.png" alt="شعار منصة سلمى التعليمية" />
      </div>
      {showText && (
        <div className="logo-text">
          <span className="logo-title">منصة سلمى التعليمية</span>
          <span className="logo-subtitle">تعلّم الرياضيات باللعب</span>
        </div>
      )}
    </div>
  );
}

export default Logo;
