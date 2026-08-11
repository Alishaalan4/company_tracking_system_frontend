import React, { useState, useEffect } from 'react';
import { leaveService, type LeaveRequest, type LeaveType } from '../api/leaveService';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, Info, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../utils/role';

const Leaves: React.FC = () => {
  const { user } = useAuth();
  // Admins and managers review other people's requests from this same page.
  const canReview = hasRole(user, ['admin', 'manager']);
  const isAdmin = hasRole(user, ['admin']);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [actingOn, setActingOn] = useState<number | null>(null);
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

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;

  const decide = async (id: number, status: 'approved' | 'rejected') => {
    setActingOn(id);
    setMessage(null);
    try {
      await leaveService.updateLeave(id, { status });
      setMessage({ type: 'success', text: `Request ${status}.` });
      fetchData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not update the request',
      });
    } finally {
      setActingOn(null);
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
              <h3>{canReview ? 'All Requests' : 'My Requests'}</h3>
              {canReview && pendingCount > 0 && (
                <span className="pending-pill">{pendingCount} pending</span>
              )}
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
                    {canReview && leave.user_name && (
                      <p className="leave-requester">
                        <UserIcon size={13} /> {leave.user_name}
                      </p>
                    )}
                    <p className="leave-dates">
                      {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                      <span className="duration-tag">{leave.days ?? '?'} days</span>
                    </p>
                    {leave.reason && <p className="leave-reason">{leave.reason}</p>}

                    {/* Only admins may change status: the backend restricts
                        PUT /leaves/{id} to role:admin. */}
                    {isAdmin && leave.status === 'pending' && (
                      <div className="review-actions">
                        <button
                          className="btn-approve"
                          disabled={actingOn === leave.id}
                          onClick={() => decide(leave.id, 'approved')}
                        >
                          <CheckCircle2 size={15} /> Approve
                        </button>
                        <button
                          className="btn-reject"
                          disabled={actingOn === leave.id}
                          onClick={() => decide(leave.id, 'rejected')}
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <Info size={40} />
                  <p>{canReview ? 'No leave requests yet.' : 'No leave requests submitted yet.'}</p>
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
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: var(--text);
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
        .list-card .card-header { padding: 1.5rem; border-bottom: 1px solid var(--border); }
        
        .leave-list-item {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s ease;
        }

        .leave-list-item:hover { background: var(--surface-2); }

        .leave-type-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--primary-soft);
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

        .status-tag.pending { background: var(--warning-soft); color: var(--warning); }
        .status-tag.approved { background: var(--success-soft); color: var(--success); }
        .status-tag.rejected { background: var(--danger-soft); color: var(--danger); }

        .leave-dates { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem; }
        .duration-tag { margin-left: 0.75rem; padding: 0.1rem 0.4rem; background: var(--border); border-radius: 4px; font-size: 0.75rem; }

        .leave-reason { font-size: 0.85rem; color: var(--text-muted); }

        .leave-requester {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.83rem; color: var(--text-muted); margin-bottom: 0.2rem;
        }

        .card-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }

        .pending-pill {
          background: var(--warning-soft); color: var(--warning);
          padding: 0.2rem 0.6rem; border-radius: 999px;
          font-size: 0.75rem; font-weight: 600;
        }

        .review-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }

        .btn-approve, .btn-reject {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.4rem 0.8rem; border-radius: var(--radius-sm);
          font-size: 0.83rem; font-weight: 600; border: 1px solid transparent;
        }
        .btn-approve { background: var(--success-soft); color: var(--success); }
        .btn-approve:hover:not(:disabled) { background: var(--success); color: #fff; }
        .btn-reject { background: var(--danger-soft); color: var(--danger); }
        .btn-reject:hover:not(:disabled) { background: var(--danger); color: #fff; }

        .balance-grid { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
        .balance-item { display: flex; flex-direction: column; gap: 0.5rem; }
        .balance-item .label { font-size: 0.85rem; color: var(--text-muted); }
        .balance-item .value { font-weight: 600; }

        .progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
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
