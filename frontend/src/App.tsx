import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/auth';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { DashboardPage } from './pages/admin/DashboardPage';
import { SchoolsListPage } from './pages/admin/SchoolsListPage';
import { SchoolsCreatePage } from './pages/admin/SchoolsCreatePage';
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
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
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
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SchoolsListPage />} />
            <Route path="new" element={<SchoolsCreatePage />} />
            <Route path=":id" element={<SchoolsDetailsPage />} />
          </Route>

          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ApprovalsListPage />} />
            <Route path=":id" element={<ApprovalsDetailsPage />} />
          </Route>

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UsersListPage />} />
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
            <Route path=":id" element={<CoursesDetailsPage />} />
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
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AuditLogsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;