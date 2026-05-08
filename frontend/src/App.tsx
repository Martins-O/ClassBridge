import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/auth';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ComingSoonPage from './pages/ComingSoonPage';
import NotFoundPage from './pages/NotFoundPage';
import { ResetExpiredPasswordPage } from './pages/ResetExpiredPasswordPage';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';
import MentorInvitationPage from './pages/MentorInvitationPage';
import StudentInvitationPage from './pages/StudentInvitationPage';

import { DashboardPage } from './pages/admin/DashboardPage';
import { SchoolsListPage } from './pages/admin/SchoolsListPage';
import { SchoolsDetailsPage } from './pages/admin/SchoolsDetailsPage';
import { ApprovalsListPage } from './pages/admin/ApprovalsListPage';
import { ApprovalsDetailsPage } from './pages/admin/ApprovalsDetailsPage';
import { UsersListPage } from './pages/admin/UsersListPage';
import { UsersDetailsPage } from './pages/admin/UsersDetailsPage';
import { ClassesListPage } from './pages/admin/ClassesListPage';
import { ClassesDetailsPage } from './pages/admin/ClassesDetailsPage';
import { CoursesListPage } from './pages/admin/CoursesListPage';
import { CoursesDetailsPage } from './pages/admin/CoursesDetailsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { CreateUserPage } from './pages/admin/CreateUserPage';
import { CreateClassPage } from './pages/admin/CreateClassPage';
import { CreateCoursePage } from './pages/admin/CreateCoursePage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SystemStatusPage } from './pages/admin/SystemStatusPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SchoolReportsPage } from './pages/admin/SchoolReportsPage';
import { AssessmentsListPage } from './pages/admin/AssessmentsListPage';
import { CreateAssessmentPage } from './pages/admin/CreateAssessmentPage';
import { TranscriptsListPage } from './pages/admin/TranscriptsListPage';
import { GenerateTranscriptPage } from './pages/admin/GenerateTranscriptPage';
import { ProfilePage } from './pages/admin/ProfilePage';
import { EditProfilePage } from './pages/admin/EditProfilePage';
import { ImportExportPage } from './pages/admin/ImportExportPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { GradesListPage } from './pages/admin/GradesListPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SystemAdminRoute({ children }: { children: React.ReactNode }) {
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSystemAdmin()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function SchoolAdminRoute({ children }: { children: React.ReactNode }) {
  const isSchoolAdmin = useAuthStore((state) => state.isSchoolAdmin);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSchoolAdmin()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Landing Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            {/* Auth Routes - No Navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password-expired" element={<ResetExpiredPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/mentor-invitation/:token" element={<MentorInvitationPage />} />
            <Route path="/student-invitation/:token" element={<StudentInvitationPage />} />
            
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
              </Route>

              <Route
                path="/schools"
                element={
                  <ProtectedRoute>
                    <SystemAdminRoute>
                      <AdminLayout />
                    </SystemAdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<SchoolsListPage />} />
                <Route path=":id" element={<SchoolsDetailsPage />} />
              </Route>

              <Route
                path="/approvals"
                element={
                  <ProtectedRoute>
                    <SystemAdminRoute>
                      <AdminLayout />
                    </SystemAdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<ApprovalsListPage />} />
                <Route path=":id" element={<ApprovalsDetailsPage />} />
              </Route>

              {/* Protected Routes - School Admin */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    {/* Only admins can manage users */}
                    {(() => {
                      const isSystemAdmin = useAuthStore.getState().isSystemAdmin;
                      const isSchoolAdmin = useAuthStore.getState().isSchoolAdmin;
                      if (!isSystemAdmin() && !isSchoolAdmin()) return <Navigate to="/dashboard" replace />;
                      return <AdminLayout />;
                    })()}
                  </ProtectedRoute>
                }
              >
                <Route index element={<UsersListPage />} />
                <Route path="create" element={<CreateUserPage />} />
                <Route path=":id" element={<UsersDetailsPage />} />
              </Route>

              <Route
                path="/classes"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ClassesListPage />} />
                <Route path="create" element={<CreateClassPage />} />
                <Route path=":id" element={<ClassesDetailsPage />} />
              </Route>

              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CoursesListPage />} />
                <Route path="create" element={<CreateCoursePage />} />
                <Route path=":id" element={<CoursesDetailsPage />} />
              </Route>

              <Route
                path="/assessments"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AssessmentsListPage />} />
                <Route path="create" element={<CreateAssessmentPage />} />
                <Route path=":id" element={<ComingSoonPage />} />
              </Route>

              <Route
                path="/grades"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<GradesListPage />} />
              </Route>

              <Route
                path="/transcripts"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<TranscriptsListPage />} />
                <Route path="generate" element={<GenerateTranscriptPage />} />
                <Route path=":id" element={<ComingSoonPage />} />
              </Route>

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SettingsPage />} />
              </Route>

              <Route
                path="/import-export"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ImportExportPage />} />
              </Route>

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProfilePage />} />
                <Route path="edit" element={<EditProfilePage />} />
              </Route>

              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute>
                    <SystemAdminRoute>
                      <AdminLayout />
                    </SystemAdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<AuditLogsPage />} />
              </Route>

              <Route
                path="/system-status"
                element={
                  <ProtectedRoute>
                    <SystemAdminRoute>
                      <AdminLayout />
                    </SystemAdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<SystemStatusPage />} />
              </Route>

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <SystemAdminRoute>
                      <AdminLayout />
                    </SystemAdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<ReportsPage />} />
              </Route>

              <Route
                path="/school-reports"
                element={
                  <ProtectedRoute>
                    <SchoolAdminRoute>
                      <AdminLayout />
                    </SchoolAdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<SchoolReportsPage />} />
              </Route>

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AnalyticsPage />} />
              </Route>
            
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster position="top-right" expand={false} richColors />
    </QueryClientProvider>
  );
}

export default App;