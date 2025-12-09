// File: src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentLessonsPage from './components/pages/StudentLessonsPage';
import StudentChaptersPage from './pages/StudentChaptersPage';
import StudentLessonPage from './pages/StudentLessonPage';
import PWAInstallBanner from './components/PWAInstallBanner';
import Layout from './pages/Layout';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* auth routes: placed outside the app Layout so sidebar is hidden here */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* main app routes using shared Layout (shows StudentSidebar) */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/student/lessons" element={<StudentLessonsPage />} />
            <Route path="/student/lessons/:id" element={<StudentLessonPage />} />
            <Route path="/student/chapters" element={<StudentChaptersPage />} />
          </Route>
        </Routes>
      </Router>
      <PWAInstallBanner />
    </>
  );
}

export default App;
