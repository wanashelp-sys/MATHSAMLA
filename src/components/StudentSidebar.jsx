import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StudentSidebar.css';

const StudentSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <aside className="student-sidebar" aria-label="Student sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-top">
          <div className="brand-pill">
            <span className="brand-icon">🏠</span>
            <span className="brand-text">نظرة عامة</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/student/chapters" className="sidebar-item">
            <span className="item-icon">📘</span>
            <span className="item-text">دروسي</span>
          </Link>

          <button className="sidebar-item button-like" onClick={() => navigate('/play') }>
            <span className="item-icon">🛡️</span>
            <span className="item-text">لعب جماعي</span>
          </button>

          <button className="sidebar-item" onClick={handleLogout}>
            <span className="item-icon">🚪</span>
            <span className="item-text">تسجيل الخروج</span>
          </button>
        </nav>

        <div className="sidebar-decor" aria-hidden>
          <div className="decor-circle" />
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
