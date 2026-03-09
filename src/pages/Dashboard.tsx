import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Clock, Calendar, Bell, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Today Status', value: 'Not Checked-In', icon: Clock, color: 'var(--primary)' },
    { label: 'Leave Balance', value: '12 Days', icon: Calendar, color: 'var(--accent)' },
    { label: 'Notifications', value: '3 New', icon: Bell, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}</h1>
          <p>Here's what's happening with your workspace today.</p>
        </div>
        <button onClick={logout} className="btn-logout glass-card">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </header>

      <section className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="action-center">
        <div className="glass-card action-card">
          <h3>Quick Check-In</h3>
          <p>Ready to start your work day? Submit your status now.</p>
          <button className="btn-primary">Check-In Now</button>
        </div>
        
        <div className="glass-card action-card">
          <h3>Upcoming Leaves</h3>
          <div className="leave-item">
            <span className="leave-date">March 15 - 17</span>
            <span className="leave-status">Pending</span>
            <ChevronRight size={16} />
          </div>
          <button className="text-btn">View All Leaves</button>
        </div>
      </section>

      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          margin-bottom: 0.25rem;
        }

        .dashboard-header p {
          color: var(--text-muted);
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 1rem;
          color: var(--danger);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .stat-icon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .action-center {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .action-card {
          padding: 2rem;
        }

        .action-card h3 {
          margin-bottom: 1rem;
          font-size: 1.15rem;
        }

        .action-card p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .leave-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .text-btn {
          background: transparent;
          color: var(--primary);
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.5rem 0;
        }

        @media (max-width: 1024px) {
          .action-center {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
