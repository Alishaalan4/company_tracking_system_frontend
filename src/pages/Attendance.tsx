import React, { useState, useEffect } from 'react';
import { attendanceService, type AttendanceRecord } from '../api/attendanceService';
import { Clock, CheckCircle2, AlertCircle, History } from 'lucide-react';
import { format } from 'date-fns';

const Attendance: React.FC = () => {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await attendanceService.checkStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status');
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await attendanceService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  const handleAction = async (action: 'in' | 'out') => {
    if (pin.length !== 4) {
      setMessage({ type: 'error', text: 'Please enter a 4-digit PIN' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (action === 'in') {
        await attendanceService.checkIn(pin);
        setMessage({ type: 'success', text: 'Successfully checked in!' });
      } else {
        await attendanceService.checkOut(pin);
        setMessage({ type: 'success', text: 'Successfully checked out!' });
      }
      setPin('');
      fetchStatus();
      fetchHistory();
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || `Failed to check ${action}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const clearPin = () => setPin('');

  return (
    <div className="attendance-page animate-fade-in">
      <header className="page-header">
        <h1>Attendance Tracking</h1>
        <p>Log your working hours using your secure PIN.</p>
      </header>

      <div className="attendance-grid">
        <section className="check-section">
          <div className="glass card attendance-card">
            <div className="current-status">
              <div className={`status-badge ${status?.is_checked_in ? 'active' : 'inactive'}`}>
                {status?.is_checked_in ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                <span>{status?.is_checked_in ? 'Currently Working' : 'Not Checked In'}</span>
              </div>
              <div className="clock-display">
                {format(new Date(), 'HH:mm')}
                <span className="seconds">:{format(new Date(), 'ss')}</span>
              </div>
              <p className="date-display">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>

            <div className="pin-pad-container">
              <div className="pin-display">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`} />
                ))}
              </div>

              <div className="pin-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button key={num} onClick={() => handlePinInput(num.toString())} className="pin-btn">
                    {num}
                  </button>
                ))}
                <button onClick={clearPin} className="pin-btn clear">C</button>
                <button onClick={() => handlePinInput('0')} className="pin-btn">0</button>
                <button 
                  onClick={() => status?.is_checked_in ? handleAction('out') : handleAction('in')} 
                  className={`pin-btn action ${status?.is_checked_in ? 'out' : 'in'}`}
                  disabled={loading || pin.length !== 4}
                >
                  GO
                </button>
              </div>
            </div>

            {message && (
              <div className={`status-message ${message.type}`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        </section>

        <section className="history-section">
          <div className="glass card history-card">
            <div className="card-header">
              <History size={20} />
              <h3>Recent History</h3>
            </div>
            <div className="history-list">
              {history.length > 0 ? history.map((record) => (
                <div key={record.id} className="history-item">
                  <div className="record-date">
                    <span className="day">{format(new Date(record.date), 'dd')}</span>
                    <span className="month">{format(new Date(record.date), 'MMM')}</span>
                  </div>
                  <div className="record-details">
                    <div className="times">
                      <span className="check-in">IN: {record.check_in.split(' ')[1]}</span>
                      <span className="check-out">OUT: {record.check_out ? record.check_out.split(' ')[1] : '--:--'}</span>
                    </div>
                    {record.duration && (
                      <span className="duration">{Math.floor(record.duration / 60)}h {record.duration % 60}m</span>
                    )}
                  </div>
                  <div className="record-status">
                    <span className={`badge ${record.status.toLowerCase()}`}>{record.status}</span>
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <Clock size={48} />
                  <p>No attendance records found for this month.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .attendance-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .attendance-card {
          padding: 2.5rem;
          text-align: center;
        }

        .current-status {
          margin-bottom: 2rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-badge.inactive {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .clock-display {
          font-size: 3.5rem;
          font-weight: 700;
          letter-spacing: -1px;
          line-height: 1;
        }

        .clock-display .seconds {
          font-size: 1.5rem;
          color: var(--text-muted);
          font-weight: 400;
        }

        .date-display {
          color: var(--text-muted);
          margin-top: 0.5rem;
        }

        .pin-pad-container {
          max-width: 280px;
          margin: 0 auto;
        }

        .pin-display {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .pin-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .pin-dot.filled {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 10px var(--primary);
        }

        .pin-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .pin-btn {
          height: 60px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pin-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .pin-btn.action {
          border: none;
        }

        .pin-btn.action.in { background: var(--accent); }
        .pin-btn.action.out { background: var(--danger); }
        .pin-btn.action:disabled { opacity: 0.5; cursor: not-allowed; }

        .pin-btn.clear { color: var(--text-muted); }

        .status-message {
          margin-top: 2rem;
          padding: 1rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
        }

        .status-message.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-message.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .history-card {
          height: 100%;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .history-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .record-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-right: 1rem;
          border-right: 1px solid var(--border-color);
          min-width: 50px;
        }

        .record-date .day { font-size: 1.25rem; font-weight: 700; line-height: 1; }
        .record-date .month { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }

        .record-details {
          flex: 1;
          padding: 0 1rem;
        }

        .times {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .check-in { color: #10b981; }
        .check-out { color: var(--text-muted); }

        .badge {
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.ontime { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .badge.late { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-muted);
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .attendance-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Attendance;
