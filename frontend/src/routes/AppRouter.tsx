import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { RoleGuard } from '../components/common/RoleGuard';
import { Spinner } from '../components/ui/Spinner';

// ── Lazily-loaded pages (each becomes its own chunk → smaller initial bundle) ──
const LandingPage         = lazy(() => import('../pages/Landing/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage           = lazy(() => import('../pages/Auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage        = lazy(() => import('../pages/Auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage       = lazy(() => import('../pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SkillInventoryPage  = lazy(() => import('../pages/Skills/SkillInventoryPage').then(m => ({ default: m.SkillInventoryPage })));
const AssessmentPage      = lazy(() => import('../pages/Assessment/AssessmentPage').then(m => ({ default: m.AssessmentPage })));
const RecommendationsPage = lazy(() => import('../pages/Recommendations/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })));
const MentorDirectoryPage = lazy(() => import('../pages/Mentorship/MentorDirectoryPage').then(m => ({ default: m.MentorDirectoryPage })));
const MyRequestsPage      = lazy(() => import('../pages/Mentorship/MyRequestsPage').then(m => ({ default: m.MyRequestsPage })));
const SafetyReportPage    = lazy(() => import('../pages/Safety/SafetyReportPage').then(m => ({ default: m.SafetyReportPage })));
const MyReportsPage       = lazy(() => import('../pages/Safety/MyReportsPage').then(m => ({ default: m.MyReportsPage })));
const ProfilePage         = lazy(() => import('../pages/Profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminDashboardPage  = lazy(() => import('../pages/Admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

/** Minimal full-screen loading shell shown during chunk fetches */
const PageLoader: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <Spinner size="lg" color="var(--color-primary-500)" />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Group */}
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"              element={<DashboardPage />} />
              <Route path="/skills"                 element={<SkillInventoryPage />} />
              <Route path="/assessment"             element={<AssessmentPage />} />
              <Route path="/recommendations"        element={<RecommendationsPage />} />
              <Route path="/mentorship/directory"   element={<MentorDirectoryPage />} />
              <Route path="/mentorship/requests"    element={<MyRequestsPage />} />
              <Route path="/safety/report"          element={<SafetyReportPage />} />
              <Route path="/safety/my-reports"      element={<MyReportsPage />} />
              <Route path="/profile"                element={<ProfilePage />} />

              {/* Admin-only Routes */}
              <Route element={<RoleGuard allowedRoles={['admin']} />}>
                <Route path="/admin"         element={<AdminDashboardPage />} />
                <Route path="/admin/safety"  element={<AdminDashboardPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
