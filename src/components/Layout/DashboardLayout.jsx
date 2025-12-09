import React from 'react'
import '../components/StudentSidebar.css'

export function DashboardLayout({ children }){
  return (
    <div className="layout-root">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="brand">
            <div className="brand-mark">س</div>
            <div className="brand-text">سلمى التعليمية</div>
          </div>

          <nav className="sidebar-nav" aria-label="الصفحات">
            <button className="sidebar-item active" aria-current="page">
              <span className="item-icon">🏠</span>
              <span className="item-label">لوحة القيادة</span>
            </button>
            <button className="sidebar-item">
              <span className="item-icon">📚</span>
              <span className="item-label">دروسي</span>
            </button>
            <button className="sidebar-item">
              <span className="item-icon">👩‍🎓</span>
              <span className="item-label">الطالبات</span>
            </button>
            <button className="sidebar-item">
              <span className="item-icon">⚙️</span>
              <span className="item-label">الإعدادات</span>
            </button>
          </nav>

          <div className="sidebar-decor">
            <div className="decor-circle" aria-hidden="true"></div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
