import React, { useState, useEffect } from 'react';
import { nonWorkingDayService, type NonWorkingDay } from '../../api/nonWorkingDayService';
import { CalendarOff, Plus, Pencil, Trash2, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const emptyForm = { name: '', date: '', is_recurring: false };

const NonWorkingDaysPage: React.FC = () => {
  const [days, setDays] = useState<NonWorkingDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<NonWorkingDay | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await nonWorkingDayService.getNonWorkingDays();
      setDays(res.data || res);
    } catch {
      showMsg('error', 'Failed to load non-working days');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (d: NonWorkingDay) => {
    setEditing(d);
    setFormData({ name: d.name, date: d.date, is_recurring: d.is_recurring });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editing) {
        await nonWorkingDayService.updateNonWorkingDay(editing.id, formData);
        showMsg('success', 'Holiday updated');
      } else {
        await nonWorkingDayService.createNonWorkingDay(formData);
        showMsg('success', 'Holiday added');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showMsg('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await nonWorkingDayService.deleteNonWorkingDay(id);
      showMsg('success', 'Holiday removed');
      setDeleteConfirm(null);
      fetchData();
    } catch {
      showMsg('error', 'Failed to delete holiday');
    }
  };

  // Sort by date
  const sorted = [...days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="nwd-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Non-Working Days</h1>
          <p>Manage public holidays and company non-working days.</p>
        </div>
        <button className="btn-primary" onClick={openCreate} id="create-nwd-btn">
          <Plus size={18} />
          <span>Add Holiday</span>
        </button>
      </header>

      {message && <div className={`status-message ${message.type} mb-4`}>{message.text}</div>}

      <div className="glass card table-card">
        <div className="table-toolbar">
          <h3 style={{ fontWeight: 600 }}>Holidays & Non-Working Days</h3>
          <button className="btn-icon" onClick={fetchData} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner-sm" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Recurring</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length > 0 ? (
                  sorted.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="date-cell">
                          <div className="cal-icon">
                            <CalendarOff size={16} />
                          </div>
                          <span className="date-text">
                            {format(new Date(d.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 500 }}>{d.name}</span></td>
                      <td>
                        {d.is_recurring ? (
                          <span className="badge-recurring">Yearly</span>
                        ) : (
                          <span className="badge-once">One-time</span>
                        )}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="icon-btn edit" onClick={() => openEdit(d)} title="Edit">
                            <Pencil size={15} />
                          </button>
                          {deleteConfirm === d.id ? (
                            <div className="delete-confirm">
                              <button className="icon-btn danger" onClick={() => handleDelete(d.id)}>
                                <CheckCircle2 size={15} />
                              </button>
                              <button className="icon-btn" onClick={() => setDeleteConfirm(null)}>
                                <X size={15} />
                              </button>
                            </div>
                          ) : (
                            <button className="icon-btn danger" onClick={() => setDeleteConfirm(d.id)} title="Delete">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      <CalendarOff size={32} />
                      <p>No holidays defined yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Holiday' : 'Add Holiday'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Holiday Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. New Year's Day"
                  required
                />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="toggle-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  />
                  <span className="toggle-switch"></span>
                  <span>Recurring every year</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; }
        .mb-4 { margin-bottom: 1.5rem; }
        .table-card { padding: 0; overflow: hidden; }
        .table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
        .btn-icon { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 0.6rem; color: var(--text-muted); display: flex; align-items: center; }
        .table-loading { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; color: var(--text-muted); }
        .spinner-sm { width: 22px; height: 22px; border: 3px solid var(--primary-ring); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .data-table thead tr { border-bottom: 1px solid var(--border); }
        .data-table th { text-align: left; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
        .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .data-table tbody tr:hover { background: var(--surface-2); }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .date-cell { display: flex; align-items: center; gap: 0.75rem; }
        .cal-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--warning-soft); color: var(--warning); display: flex; align-items: center; justify-content: center; }
        .date-text { font-weight: 500; }
        .badge-recurring { background: var(--primary-soft); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
        .badge-once { background: var(--surface-2); color: var(--text-muted); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
        .action-btns { display: flex; align-items: center; gap: 0.5rem; }
        .icon-btn { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 0.45rem; color: var(--text-muted); display: flex; align-items: center; transition: all 0.2s ease; }
        .icon-btn:hover { background: var(--surface-3); color: var(--text); }
        .icon-btn.edit:hover { color: var(--primary); border-color: var(--primary); }
        .icon-btn.danger:hover { color: var(--danger); border-color: var(--danger); }
        .delete-confirm { display: flex; align-items: center; gap: 0.4rem; }
        .empty-row { text-align: center; padding: 4rem; color: var(--text-muted); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { width: 100%; max-width: 480px; padding: 2rem; animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; }
        .modal-header h3 { font-size: 1.25rem; }
        .modal-form .input-group { margin-bottom: 1.25rem; }
        .toggle-group { margin-bottom: 1.5rem; }
        .toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
        .toggle-label input[type="checkbox"] { display: none; }
        .toggle-switch { position: relative; width: 44px; height: 24px; background: var(--surface-3); border-radius: 12px; flex-shrink: 0; transition: background 0.2s; }
        .toggle-switch::after { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: var(--surface); top: 3px; left: 3px; transition: transform 0.2s; }
        .toggle-label input:checked + .toggle-switch { background: var(--primary); }
        .toggle-label input:checked + .toggle-switch::after { transform: translateX(20px); }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .btn-text { background: transparent; color: var(--text-muted); padding: 0.75rem 1.5rem; border-radius: 10px; }
        .status-message { padding: 1rem 1.5rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.success { background: var(--success-soft); color: var(--success); border: 1px solid var(--success-soft); }
        .status-message.error { background: var(--danger-soft); color: var(--danger); border: 1px solid var(--danger-soft); }
      `}</style>
    </div>
  );
};

export default NonWorkingDaysPage;
