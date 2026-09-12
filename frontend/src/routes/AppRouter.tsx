import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { RoleGuard } from '../components/common/RoleGuard';

// Pages
import { LandingPage } from '../pages/Landing/LandingPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { SkillInventoryPage } from '../pages/Skills/SkillInventoryPage';
import { AssessmentPage } from '../pages/Assessment/AssessmentPage';
import { RecommendationsPage } from '../pages/Recommendations/RecommendationsPage';
import { MentorDirectoryPage } from '../pages/Mentorship/MentorDirectoryPage';
import { MyRequestsPage } from '../pages/Mentorship/MyRequestsPage';
import { SafetyReportPage } from '../pages/Safety/SafetyReportPage';
import { MyReportsPage } from '../pages/Safety/MyReportsPage';
import { ProfilePage } from '../pages/Profile/ProfilePage';
import { AdminDashboardPage } from '../pages/Admin/AdminDashboardPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Group */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/skills" element={<SkillInventoryPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/mentorship/directory" element={<MentorDirectoryPage />} />
            <Route path="/mentorship/requests" element={<MyRequestsPage />} />
            <Route path="/safety/report" element={<SafetyReportPage />} />
            <Route path="/safety/my-reports" element={<MyReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin-only Routes */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/safety" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
