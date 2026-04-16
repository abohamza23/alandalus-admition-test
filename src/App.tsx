import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import AcademicScores from './pages/AcademicScores';
import InterviewScores from './pages/InterviewScores';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            
            {/* Forms and Data Entry */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'registrar', 'data_entry']} />}>
              <Route path="/students/new" element={<StudentForm />} />
              <Route path="/students/:id/edit" element={<StudentForm />} />
              <Route path="/academic-scores" element={<AcademicScores />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin', 'registrar', 'coordinator']} />}>
              <Route path="/interview-scores" element={<InterviewScores />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin', 'registrar', 'coordinator', 'academic_deputy']} />}>
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Helper component for nested routes in layout
import { Outlet } from 'react-router-dom';
