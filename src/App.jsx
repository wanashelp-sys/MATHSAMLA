// File: src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PWAInstallBanner from './components/PWAInstallBanner';

// Lazy load pages for better performance (code splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentLessonsPage = lazy(() => import('./pages/StudentLessonsPage'));

// Loading component
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '1.2rem',
      color: '#926A2B'
    }}>
      <div>جاري التحميل...</div>
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/lessons" element={<StudentLessonsPage />} />
          </Routes>
        </Suspense>
      </Router>
      <PWAInstallBanner />
    </>
  );
}

export default App;
