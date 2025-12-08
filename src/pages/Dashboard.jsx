import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard button that opens the Student Lessons page.
 * - If the target origin equals current origin, we use React Router's navigate to go to /student/lessons
 * - Otherwise we set window.location.href to the full URL (or open in new tab if desired)
 * - The button validates localStorage.currentUser to ensure role === 'student' and studentId exists; otherwise redirects to /login
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const LESSONS_URL = 'http://localhost:5173/student/lessons';

  const handleGoLessons = (openInNewTab = false) => {
    try {
      const raw = localStorage.getItem('currentUser');
      const currentUser = raw ? JSON.parse(raw) : null;
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        // Not a student or missing info -> send to login within this app
        navigate('/login');
        return;
      }
    } catch (e) {
      // If parsing fails, fallthrough to navigation logic
    }

    try {
      const targetOrigin = new URL(LESSONS_URL).origin;
      const currentOrigin = window.location.origin;

      if (openInNewTab) {
        window.open(LESSONS_URL, '_blank', 'noopener');
        return;
      }

      if (currentOrigin === targetOrigin) {
        // same origin -> use react-router navigation
        navigate('/student/lessons');
        return;
      }

      // different origin -> full redirect
      window.location.href = LESSONS_URL;
    } catch (err) {
      // fallback
      window.location.href = LESSONS_URL;
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Other dashboard content can remain here */}

      <div style={{ maxWidth: 760, marginTop: 12 }}>
        <button
          onClick={() => handleGoLessons(false)}
          aria-label="صفحة التعلّم (دروسي)"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg,#69c0ff,#60a5fa)',
            border: 'none',
            color: '#fff',
            padding: '14px 18px',
            borderRadius: 28,
            boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          <span>صفحة التعلّم (دروسي)</span>
          <span
            style={{
              display: 'inline-block',
              width: 22,
              height: 22,
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            ↗
          </span>
        </button>
      </div>
    </div>
  );
}
