import React, { useState, useEffect } from 'react';
import { leaveService, type LeaveRequest, type LeaveType } from '../api/leaveService';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, Info, ChevronRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesRes, typesRes] = await Promise.all([
        leaveService.getLeaves(),
        leaveService.getLeaveTypes()
      ]);
      setLeaves(Array.isArray(leavesRes) ? leavesRes : (leavesRes?.data || []));
      setTypes(Array.isArray(typesRes) ? typesRes : (typesRes?.data || []));
    } catch (err) {
      console.error('Failed to fetch leave data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await leaveService.submitLeave({
        ...formData,
        leave_type_id: Number(formData.leave_type_id)
      });
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' });
      setFormData({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to submit leave request' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={16} className="text-success" />;
      case 'rejected': return <XCircle size={16} className="text-danger" />;
      default: return <Clock size={16} className="text-warning" />;
    }
  };

  return (
    <div className="leaves-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Leave Management</h1>
          <p>Request time off and track your leave status.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} />
          <span>New Request</span>
        </button>
      </header>

      {showForm && (
        <section className="leave-form-section animate-slide-down">
          <div className="glass card form-card">
            <h3>Request Leave</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Leave Type</label>
                  <select 
                    value={formData.leave_type_id}
                    onChange={e => setFormData({...formData, leave_type_id: e.target.value})}
                    required
                  >
                    <option value="">Select a type</option>
                    {types.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group full-width">
                  <label>Reason</label>
                  <textarea 
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    placeholder="Enter reason for leave..."
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-text" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {message && (
        <div className={`status-message ${message.type} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="leaves-content">
        <section className="leaves-list-section">
          <div className="glass card list-card">
            <div className="card-header">
              <h3>My Requests</h3>
            </div>
            <div className="list-container">
              {leaves.length > 0 ? leaves.map((leave) => (
                <div key={leave.id} className="leave-list-item">
                  <div className="leave-type-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="leave-info">
                    <div className="title-row">
                      <h4>{leave.leave_type?.name || 'Leave Request'}</h4>
                      <span className={`status-tag ${leave.status}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status}
                      </span>
                    </div>
                    <p className="leave-dates">
                      {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                      <span className="duration-tag">
                        {differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1} days
                      </span>
                    </p>
                    <p className="leave-reason">{leave.reason}</p>
                  </div>
                  <div className="item-actions">
                    <ChevronRight size={20} className="text-muted" />
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <Info size={40} />
                  <p>You haven't submitted any leave requests yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="leave-summary-section">
          <div className="glass card info-card">
            <h3>Leave Balance</h3>
            <div className="balance-grid">
              {types.map(t => (
                <div key={t.id} className="balance-item">
                  <span className="label">{t.name}</span>
                  <span className="value">{t.annual_limit ?? 'Unlimited'} Days</span>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .leave-form-section {
          margin-bottom: 2rem;
        }

        .form-card { padding: 2rem; }
        .form-card h3 { margin-bottom: 1.5rem; }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .full-width { grid-column: span 3; }

        select, textarea {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: white;
          font-family: inherit;
        }

        textarea { height: 100px; resize: vertical; }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-text {
          background: transparent;
          color: var(--text-muted);
          padding: 0.75rem 1.5rem;
        }

        .leaves-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .list-card { padding: 0; overflow: hidden; }
        .list-card .card-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
        
        .leave-list-item {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          transition: background 0.2s ease;
        }

        .leave-list-item:hover { background: rgba(255, 255, 255, 0.02); }

        .leave-type-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1.5rem;
        }

        .leave-info { flex: 1; }
        .title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem; }
        .title-row h4 { font-size: 1.1rem; }

        .status-tag {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-tag.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-tag.approved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-tag.rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .leave-dates { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem; }
        .duration-tag { margin-left: 0.75rem; padding: 0.1rem 0.4rem; background: var(--border-color); border-radius: 4px; font-size: 0.75rem; }

        .leave-reason { font-size: 0.85rem; color: var(--text-muted); }

        .balance-grid { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
        .balance-item { display: flex; flex-direction: column; gap: 0.5rem; }
        .balance-item .label { font-size: 0.85rem; color: var(--text-muted); }
        .balance-item .value { font-weight: 600; }

        .progress-bar { height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; }
        .progress { height: 100%; background: var(--primary); }

        .mb-4 { margin-bottom: 1.5rem; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }

        @media (max-width: 1024px) {
          .leaves-content { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr 1fr; }
          .full-width { grid-column: span 2; }
        }
      `}</style>
    </div>
  );
};

export default Leaves;
