import React, { useState, useEffect } from 'react';
import { leaveService, type LeaveType } from '../../api/leaveService';
import { ClipboardList, Plus, Pencil, Trash2, RefreshCw, X, CheckCircle2 } from 'lucide-react';

const emptyForm = { name: '', annual_limit: 0 };

const LeaveTypesPage: React.FC = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await leaveService.getLeaveTypes();
      setTypes(res.data || res);
    } catch {
      showMsg('error', 'Failed to load leave types');
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

  const openEdit = (t: LeaveType) => {
    setEditing(t);
    setFormData({ name: t.name, annual_limit: t.annual_limit ?? 0 });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // 0 means uncapped, which the backend stores as null.
      const payload = {
        name: formData.name,
        annual_limit: Number(formData.annual_limit) || null,
      };
      if (editing) {
        await leaveService.updateLeaveType(editing.id, payload);
        showMsg('success', 'Leave type updated');
      } else {
        await leaveService.createLeaveType(payload);
        showMsg('success', 'Leave type created');
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
      await leaveService.deleteLeaveType(id);
      showMsg('success', 'Leave type deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch {
      showMsg('error', 'Failed to delete leave type');
    }
  };

  const colors = [
    'rgba(99,102,241,0.12)', 'rgba(16,185,129,0.12)',
    'rgba(245,158,11,0.12)', 'rgba(239,68,68,0.12)',
    'rgba(139,92,246,0.12)', 'rgba(236,72,153,0.12)',
  ];
  const textColors = ['#818cf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="leave-types-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Leave Types</h1>
          <p>Configure the types of leave available to employees.</p>
        </div>
        <button className="btn-primary" onClick={openCreate} id="create-leave-type-btn">
          <Plus size={18} />
          <span>Add Leave Type</span>
        </button>
      </header>

      {message && <div className={`status-message ${message.type} mb-4`}>{message.text}</div>}

      <div className="glass card table-card">
        <div className="table-toolbar">
          <h3 style={{ fontWeight: 600 }}>Leave Types ({types.length})</h3>
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
          <div className="lt-grid">
            {types.length > 0 ? (
              types.map((t, i) => (
                <div key={t.id} className="lt-card glass-card">
                  <div className="lt-icon" style={{ background: colors[i % colors.length], color: textColors[i % textColors.length] }}>
                    <ClipboardList size={22} />
                  </div>
                  <div className="lt-info">
                    <h4>{t.name}</h4>
                    <span className="lt-days">{t.annual_limit ?? 'Unlimited'} days/year</span>
                  </div>
                  <div className="lt-actions">
                    <button className="icon-btn edit" onClick={() => openEdit(t)} title="Edit">
                      <Pencil size={15} />
                    </button>
                    {deleteConfirm === t.id ? (
                      <div className="delete-confirm">
                        <button className="icon-btn danger" onClick={() => handleDelete(t.id)}>
                          <CheckCircle2 size={15} />
                        </button>
                        <button className="icon-btn" onClick={() => setDeleteConfirm(null)}>
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <button className="icon-btn danger" onClick={() => setDeleteConfirm(t.id)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <ClipboardList size={40} />
                <p>No leave types defined yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Leave Type' : 'New Leave Type'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Annual Leave"
                  required
                />
              </div>
              <div className="input-group">
                <label>
                  Days Allowed Per Year{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(0 = unlimited)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.annual_limit}
                  onChange={(e) => setFormData({ ...formData, annual_limit: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
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
        .table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
        .btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.6rem; color: var(--text-muted); display: flex; align-items: center; }
        .btn-icon:hover { color: var(--text-main); }
        .table-loading { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; color: var(--text-muted); }
        .spinner-sm { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .lt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; padding: 1.5rem; }
        .lt-card { padding: 1.5rem; display: flex; align-items: flex-start; gap: 1rem; }
        .lt-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .lt-info { flex: 1; min-width: 0; }
        .lt-info h4 { font-size: 1rem; margin-bottom: 0.25rem; }
        .lt-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lt-days { font-size: 0.8rem; background: rgba(255,255,255,0.06); padding: 0.2rem 0.6rem; border-radius: 5px; }
        .lt-actions { display: flex; gap: 0.5rem; }
        .icon-btn { background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.45rem; color: var(--text-muted); display: flex; align-items: center; transition: all 0.2s ease; }
        .icon-btn:hover { background: rgba(255,255,255,0.12); color: var(--text-main); }
        .icon-btn.edit:hover { color: var(--primary); border-color: var(--primary); }
        .icon-btn.danger:hover { color: var(--danger); border-color: var(--danger); }
        .delete-confirm { display: flex; align-items: center; gap: 0.4rem; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--text-muted); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { width: 100%; max-width: 480px; padding: 2rem; animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; }
        .modal-header h3 { font-size: 1.25rem; }
        .modal-form .input-group { margin-bottom: 1.25rem; }
        textarea { width: 100%; background: rgba(15,23,42,0.6); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.75rem 1rem; color: white; font-family: inherit; height: 90px; resize: vertical; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
        .btn-text { background: transparent; color: var(--text-muted); padding: 0.75rem 1.5rem; border-radius: 10px; }
        .btn-text:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
        .status-message { padding: 1rem 1.5rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-message.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
};

export default LeaveTypesPage;
