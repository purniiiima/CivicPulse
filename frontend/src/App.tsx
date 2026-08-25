import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { ForceChangePasswordModal } from './components/auth/ForceChangePasswordModal';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { AccessDeniedPage } from './pages/auth/AccessDeniedPage';
import { SessionExpiredPage } from './pages/auth/SessionExpiredPage';

// Citizen Pages
import { LandingPage } from './pages/LandingPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { MyReportsPage } from './pages/MyReportsPage';
import { NearbyIssuesPage } from './pages/NearbyIssuesPage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { CitizenProfilePage } from './pages/CitizenProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

// Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerIssuesPage } from './pages/worker/WorkerIssuesPage';
import { WorkerProfilePage } from './pages/worker/WorkerProfilePage';

// Admin Pages (Organization Admin)
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { IssueManagementPage } from './pages/admin/IssueManagementPage';
import { AssignmentManagementPage } from './pages/admin/AssignmentManagementPage';
import { WorkersDirectoryPage } from './pages/admin/WorkersDirectoryPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { UsersManagementPage } from './pages/superadmin/UsersManagementPage';
import { OrganizationsManagementPage } from './pages/superadmin/OrganizationsManagementPage';
import { SuperAdminSettingsPage } from './pages/superadmin/SuperAdminSettingsPage';
import { SuperAdminProfilePage } from './pages/superadmin/SuperAdminProfilePage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLandingPage = location.pathname === '/';
  const isAuthPage = [
    '/login',
    '/signup',
    '/access-denied',
    '/session-expired',
  ].includes(location.pathname);

  if (isLandingPage || isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans antialiased text-[#243B53] w-full max-w-full overflow-x-hidden">
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 w-full max-w-full min-w-0">{children}</main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans antialiased text-[#243B53] w-full max-w-full overflow-x-hidden">
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex-1 flex w-full max-w-full min-w-0">
        {/* Persistent Sidebar on Desktop, Drawer on Mobile */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full max-w-full">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12 min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Toast Notification System */}
      <ToastContainer />

      {/* Required Password Change Modal */}
      <ForceChangePasswordModal />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppLayout>
            <Routes>
              {/* Public & Landing Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />
              <Route path="/session-expired" element={<SessionExpiredPage />} />

              {/* Citizen & Public Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/profile"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <CitizenProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <ReportIssuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <MyReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nearby"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <NearbyIssuesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/nearby-issues" element={<Navigate to="/nearby" replace />} />
              <Route
                path="/issues/:id"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <IssueDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/reports/:id"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <IssueDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/track/:id"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <IssueDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <CitizenProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'WORKER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Worker Routes */}
              <Route
                path="/worker"
                element={
                  <ProtectedRoute allowedRoles={['WORKER', 'SUPER_ADMIN']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/issues"
                element={
                  <ProtectedRoute allowedRoles={['WORKER', 'SUPER_ADMIN']}>
                    <WorkerIssuesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/profile"
                element={
                  <ProtectedRoute allowedRoles={['WORKER', 'SUPER_ADMIN']}>
                    <WorkerProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Organization Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/issues"
                element={
                  <ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <IssueManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments"
                element={
                  <ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <AssignmentManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/workers"
                element={
                  <ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <WorkersDirectoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'SUPER_ADMIN']}>
                    <AdminProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/users"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <UsersManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/organizations"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <OrganizationsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <SuperAdminSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/profile"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <SuperAdminProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

