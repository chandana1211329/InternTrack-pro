import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Login from './pages/Login.tsx';
import InternDashboard from './pages/intern/Dashboard.tsx';
import InternAttendance from './pages/intern/Attendance.tsx';
import InternReports from './pages/intern/Reports.tsx';
import AdminDashboard from './pages/admin/Dashboard.tsx';
import AdminInterns from './pages/admin/Interns.tsx';
import Navbar from './components/Shared/Navbar.tsx';
import { UserRole } from './types.ts';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: UserRole }> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={user.role === UserRole.ADMIN ? "/admin" : "/intern"} replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          <Route path="/login" element={user ? <Navigate to={user.role === UserRole.ADMIN ? "/admin" : "/intern"} /> : <Login />} />
          
          {/* Intern Routes */}
          <Route path="/intern" element={<ProtectedRoute allowedRole={UserRole.INTERN}><InternDashboard /></ProtectedRoute>} />
          <Route path="/intern/attendance" element={<ProtectedRoute allowedRole={UserRole.INTERN}><InternAttendance /></ProtectedRoute>} />
          <Route path="/intern/reports" element={<ProtectedRoute allowedRole={UserRole.INTERN}><InternReports /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRole={UserRole.ADMIN}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/interns" element={<ProtectedRoute allowedRole={UserRole.ADMIN}><AdminInterns /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;