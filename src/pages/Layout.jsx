import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

export default function Layout() {
  return (
    <>
      <StudentSidebar />
      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>
    </>
  );
}
