import React, { useState, useEffect } from 'react';
import { notificationService, type Notification } from '../api/notificationService';
import { Bell, Check, Clock, Info, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const responseData = await notificationService.getNotifications();
      const notifs = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="notifications-page animate-fade-in">
      <header className="page-header">
        <h1>Notifications</h1>
        <p>Stay updated with your latest alerts and activities.</p>
      </header>

      <div className="notifications-container glass card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((n) => (
              <div key={n.id} className={`notification-item ${n.read_at ? 'read' : 'unread'}`}>
                <div className="notif-icon">
                  <Bell size={20} />
                </div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4>{n.data.title}</h4>
                    <span className="notif-time">
                      <Clock size={12} />
                      {format(new Date(n.created_at), 'MMM d, p')}
                    </span>
                  </div>
                  <p className="notif-message">{n.data.message}</p>
                  {!n.read_at && (
                    <button onClick={() => markRead(n.id)} className="btn-mark-read">
                      <Check size={14} />
                      Mark as read
                    </button>
                  )}
                </div>
                {n.read_at && (
                  <div className="notif-status">
                    <CheckCircle2 size={16} className="text-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Info size={48} />
            <p>You're all caught up! No new notifications.</p>
          </div>
        )}
      </div>

      <style>{`
        .notifications-container {
          max-width: 800px;
          margin-top: 2rem;
          padding: 0;
          overflow: hidden;
        }

        .loading-state, .empty-state {
          padding: 4rem;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .notification-item {
          display: flex;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          gap: 1.5rem;
          transition: background 0.2s ease;
          position: relative;
        }

        .notification-item:hover {
          background: var(--surface-2);
        }

        .notification-item.unread::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--primary);
        }

        .notif-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notif-content {
          flex: 1;
        }

        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .notif-header h4 {
          font-size: 1rem;
          margin: 0;
        }

        .notif-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .notif-message {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .btn-mark-read {
          background: var(--surface-2);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-mark-read:hover {
          background: var(--surface-3);
          border-color: var(--border-strong);
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid var(--primary-ring);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Notifications;
