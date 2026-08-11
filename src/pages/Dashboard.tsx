import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoleName } from '../utils/role';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Calendar, Bell, ChevronRight, Users, FileText,
  CheckCircle2, ArrowRight, CalendarCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { attendanceService } from '../api/attendanceService';
import { leaveService, type LeaveRequest } from '../api/leaveService';
import { notificationService } from '../api/notificationService';

const unwrap = <T,>(res: any): T[] => (Array.isArray(res) ? res : res?.data ?? []);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleName = getRoleName(user) ?? 'employee';
  const isAdmin = roleName === 'admin';
  const isManager = roleName === 'manager';

  const [status, setStatus] = useState<any>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Each card degrades on its own; one failing endpoint must not blank
    // the whole dashboard.
    Promise.allSettled([
      attendanceService.checkStatus(),
      leaveService.getLeaves(),
      notificationService.getNotifications(),
    ])
      .then(([s, l, n]) => {
        if (s.status === 'fulfilled') setStatus(s.value);
        if (l.status === 'fulfilled') setLeaves(unwrap<LeaveRequest>(l.value));
        if (n.status === 'fulfilled') {
          setUnread(unwrap<any>(n.value).filter((x) => !x.read_at).length);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = leaves.filter((l) => l.status === 'pending');
  const upcoming = leaves
    .filter((l) => l.status !== 'rejected' && new Date(l.end_date) >= new Date())
    .sort((a, b) => +new Date(a.start_date) - +new Date(b.start_date))
    .slice(0, 3);

  const checkedIn = !!status?.is_checked_in;

  const stats = [
    {
      label: 'Today',
      value: loading ? '—' : checkedIn ? 'Checked in' : 'Not checked in',
      hint: status?.check_in_time ? format(new Date(status.check_in_time), 'HH:mm') : 'Tap to log your hours',
      icon: checkedIn ? CheckCircle2 : Clock,
      tone: checkedIn ? 'var(--hue-2)' : 'var(--hue-3)',
      to: '/attendance',
    },
    {
      label: 'Pending leave',
      value: loading ? '—' : String(pending.length),
      hint: pending.length === 1 ? 'request awaiting review' : 'requests awaiting review',
      icon: Calendar,
      tone: 'var(--hue-1)',
      to: '/leaves',
    },
    {
      label: 'Notifications',
      value: loading ? '—' : String(unread),
      hint: unread ? 'unread' : 'all caught up',
      icon: Bell,
      tone: 'var(--hue-5)',
      to: '/notifications',
    },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => (
          <button key={stat.label} className="glass-card stat-card" onClick={() => navigate(stat.to)}>
            <div className="stat-icon" style={{ background: `color-mix(in srgb, ${stat.tone} 14%, transparent)`, color: stat.tone }}>
              <stat.icon size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-hint">{stat.hint}</span>
            </div>
            <ChevronRight size={18} className="stat-chevron" />
          </button>
        ))}
      </section>

      <section className="action-center">
        <div className="glass card action-card primary-card">
          <div className="action-head">
            <div className="action-icon"><Clock size={20} /></div>
            <div>
              <h3>{checkedIn ? 'You are checked in' : 'Ready to start?'}</h3>
              <p>
                {checkedIn
                  ? 'Remember to check out at the end of your day.'
                  : 'Log your attendance with your secure PIN.'}
              </p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/attendance')}>
            <span>{checkedIn ? 'Check out' : 'Check in'}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="glass card action-card">
          <h3>Upcoming leave</h3>
          {upcoming.length ? (
            <div className="mini-list">
              {upcoming.map((l) => (
                <div key={l.id} className="mini-row">
                  <CalendarCheck size={16} className="text-muted" />
                  <span className="mini-date">
                    {format(new Date(l.start_date), 'MMM d')} – {format(new Date(l.end_date), 'MMM d')}
                  </span>
                  <span className={`status-tag ${l.status}`}>{l.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-note">{loading ? 'Loading…' : 'No upcoming leave booked.'}</p>
          )}
          <button className="btn-text" onClick={() => navigate('/leaves')}>View all leave</button>
        </div>

        {(isAdmin || isManager) && (
          <div className="glass card action-card">
            <h3>{isAdmin ? 'Administration' : 'Team'}</h3>
            <p className="muted-note">
              {isAdmin
                ? 'Manage people, departments and system settings.'
                : 'Review attendance across your department.'}
            </p>
            <div className="quick-links">
              {isAdmin && (
                <button className="quick-link" onClick={() => navigate('/admin/users')}>
                  <Users size={16} /> Users
                </button>
              )}
              <button className="quick-link" onClick={() => navigate('/admin/reports')}>
                <FileText size={16} /> Reports
              </button>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.15rem 1.25rem;
          text-align: left;
          cursor: pointer;
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
        .stat-label { font-size: 0.78rem; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .stat-value { font-size: 1.2rem; font-weight: 650; color: var(--text); line-height: 1.3; }
        .stat-hint { font-size: 0.8rem; color: var(--text-muted); }
        .stat-chevron { color: var(--text-subtle); flex-shrink: 0; }

        .action-center {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          align-items: start;
        }

        .action-card { display: flex; flex-direction: column; gap: 1rem; }
        .action-card h3 { margin: 0; }

        .primary-card {
          background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 65%, var(--hue-5)));
          border: none;
          color: #fff;
        }
        .primary-card h3, .primary-card p { color: #fff; }
        .primary-card p { opacity: 0.9; font-size: 0.9rem; }
        .primary-card .btn-primary {
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
          backdrop-filter: blur(4px);
          align-self: flex-start;
        }
        .primary-card .btn-primary:hover:not(:disabled) { background: rgba(255, 255, 255, 0.28); }

        .action-head { display: flex; gap: 0.9rem; align-items: flex-start; }
        .action-icon {
          width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
          background: rgba(255, 255, 255, 0.2);
          display: flex; align-items: center; justify-content: center;
        }

        .muted-note { color: var(--text-muted); font-size: 0.9rem; margin: 0; }

        .mini-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .mini-row {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 0.75rem;
          background: var(--surface-2);
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
        }
        .mini-date { flex: 1; font-weight: 500; }

        .quick-links { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .quick-link {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 0.85rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-size: 0.86rem;
          font-weight: 500;
        }
        .quick-link:hover { background: var(--primary-soft); color: var(--primary); border-color: transparent; }

        .action-card .btn-text { align-self: flex-start; padding-left: 0; }
      `}</style>
    </div>
  );
};

export default Dashboard;
