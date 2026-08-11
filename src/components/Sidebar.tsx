import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  Bell, 
  Settings, 
  Users, 
  Building2, 
  FileText, 
  ShieldCheck,
  LogOut,
  ClipboardList,
  CalendarOff,
  KeyRound,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleName } from '../utils/role';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const isAdmin = getRoleName(user) === 'admin';
  const isManager = getRoleName(user) === 'manager';

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/attendance', icon: Clock, label: 'Attendance' },
    { to: '/leaves', icon: Calendar, label: 'My Leaves' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const adminItems = [
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/leave-types', icon: ClipboardList, label: 'Leave Types' },
    { to: '/admin/non-working-days', icon: CalendarOff, label: 'Non-Working Days' },
    { to: '/admin/reports', icon: FileText, label: 'Reports' },
    { to: '/admin/audit-logs', icon: ShieldCheck, label: 'Audit Logs' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  // Managers get reports only; the rest of /admin is admin-gated server-side.
  const managerItems = [
    { to: '/admin/reports', icon: FileText, label: 'Reports' },
  ];

  const accountItems = [
    { to: '/change-password', icon: KeyRound, label: 'Change Password' },
    { to: '/change-pin', icon: Lock, label: 'Change PIN' },
  ];

  return (
    <aside className="sidebar glass">
      <div className="logo-container">
        <div className="logo-icon" style={{ 
          width: '32px', 
          height: '32px', 
          background: 'var(--primary)', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <ShieldCheck size={20} />
        </div>
        <span>TrackIt</span>
      </div>

      <nav className="nav-menu">
        <p className="nav-section-label">General</p>
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {(isAdmin || isManager) && (
          <>
            <div className="nav-divider"></div>
            <p className="nav-section-label">Administration</p>
            {(isAdmin ? adminItems : managerItems).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        <div className="nav-divider"></div>
        <p className="nav-section-label">Account</p>
        {accountItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="nav-link logout-btn">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .nav-menu {
          flex: 1;
          overflow-y: auto;
          margin: 0 -0.5rem;
          padding: 0 0.5rem;
        }

        .nav-section-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin: 1.5rem 1rem 0.75rem;
          font-weight: 600;
        }

        .nav-divider {
          height: 1px;
          background: var(--border-color);
          margin: 1.5rem 1rem;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .logout-btn {
          width: 100%;
          color: var(--danger) !important;
          margin-bottom: 0;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }

        .logo-container {
          margin-bottom: 2.5rem;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
