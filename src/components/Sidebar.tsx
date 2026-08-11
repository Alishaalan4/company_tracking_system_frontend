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
import ThemeToggle from './ThemeToggle';

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
        <div className="brand-mark">
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
        <ThemeToggle />
        <button onClick={logout} className="nav-link logout-btn">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .brand-mark {
          width: 34px;
          height: 34px;
          background: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--on-primary);
          flex-shrink: 0;
        }

        .nav-menu {
          flex: 1;
          overflow-y: auto;
          margin: 0 -0.25rem;
          padding: 0 0.25rem;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border);
        }

        .logout-btn {
          color: var(--danger) !important;
          margin-bottom: 0;
        }

        .logout-btn:hover {
          background: var(--danger-soft) !important;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
