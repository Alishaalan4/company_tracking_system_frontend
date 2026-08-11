import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { RoleName } from './types';
import { hasRole } from './utils/role';
import Sidebar from './components/Sidebar';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/auth/ChangePassword';
import ChangePIN from './pages/auth/ChangePIN';
import UsersPage from './pages/admin/Users';
import DepartmentsPage from './pages/admin/Departments';
import LeaveTypesPage from './pages/admin/LeaveTypes';
import NonWorkingDaysPage from './pages/admin/NonWorkingDays';
import ReportsPage from './pages/admin/Reports';
import AuditLogsPage from './pages/admin/AuditLogs';
import SettingsPage from './pages/admin/Settings';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <style>{`
      .loading-screen {
        height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a;
      }
      .spinner {
        width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// Restricts a route to the given roles. Mirrors the backend `role:` middleware —
// the server still enforces this, the guard just avoids rendering a page that
// would only 403.
const RoleRoute = ({ allow, children }: { allow: RoleName[]; children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!hasRole(user, allow)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/leaves" element={<Leaves />} />
                    <Route path="/notifications" element={<Notifications />} />

                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/change-pin" element={<ChangePIN />} />

                    <Route path="/admin/users" element={<RoleRoute allow={['admin']}><UsersPage /></RoleRoute>} />
                    <Route path="/admin/departments" element={<RoleRoute allow={['admin']}><DepartmentsPage /></RoleRoute>} />
                    <Route path="/admin/leave-types" element={<RoleRoute allow={['admin']}><LeaveTypesPage /></RoleRoute>} />
                    <Route path="/admin/non-working-days" element={<RoleRoute allow={['admin']}><NonWorkingDaysPage /></RoleRoute>} />
                    <Route path="/admin/audit-logs" element={<RoleRoute allow={['admin']}><AuditLogsPage /></RoleRoute>} />
                    <Route path="/admin/settings" element={<RoleRoute allow={['admin']}><SettingsPage /></RoleRoute>} />
                    {/* Reports are admin+manager on the backend (role:admin,manager) */}
                    <Route path="/admin/reports" element={<RoleRoute allow={['admin', 'manager']}><ReportsPage /></RoleRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
