import React, { useState, useEffect } from 'react';
import { departmentService, type Department, type DepartmentPayload } from '../../api/departmentService';
import { Building2, Plus, Pencil, Trash2, RefreshCw, X, CheckCircle2 } from 'lucide-react';

const emptyForm: DepartmentPayload = {
  name: '',
  work_start: '09:00',
  work_end: '17:00',
  late_after: 15,
  early_leave_before: 15,
};

/** The API returns "HH:MM:SS"; <input type="time"> wants "HH:MM". */
const toTimeInput = (value: string) => (value ? value.slice(0, 5) : '');

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await departmentService.getDepartments();
      setDepartments(res.data || res);
    } catch {
      showMsg('error', 'Failed to load departments');
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

  const openEdit = (d: Department) => {
    setEditing(d);
    setFormData({
      name: d.name,
      work_start: toTimeInput(d.work_start),
      work_end: toTimeInput(d.work_end),
      late_after: d.late_after,
      early_leave_before: d.early_leave_before,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editing) {
        await departmentService.updateDepartment(editing.id, formData);
        showMsg('success', 'Department updated');
      } else {
        await departmentService.createDepartment(formData);
        showMsg('success', 'Department created');
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
      await departmentService.deleteDepartment(id);
      showMsg('success', 'Department deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch {
      showMsg('error', 'Failed to delete department');
    }
  };

  return (
    <div className="dept-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Departments</h1>
          <p>Manage company departments and organizational units.</p>
        </div>
        <button className="btn-primary" onClick={openCreate} id="create-dept-btn">
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </header>

      {message && <div className={`status-message ${message.type} mb-4`}>{message.text}</div>}

      <div className="glass card table-card">
        <div className="table-toolbar">
          <h3 style={{ fontWeight: 600 }}>All Departments ({departments.length})</h3>
          <button className="btn-icon" onClick={fetchData} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner-sm" />
            <span>Loading departments...</span>
          </div>
        ) : (
          <div className="dept-grid">
            {departments.length > 0 ? (
              departments.map((d) => (
                <div key={d.id} className="dept-card glass-card">
                  <div className="dept-icon">
                    <Building2 size={22} />
                  </div>
                  <div className="dept-info">
                    <h4>{d.name}</h4>
                    <p>{toTimeInput(d.work_start)} - {toTimeInput(d.work_end)}</p>
                  </div>
                  <div className="dept-actions">
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
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <Building2 size={40} />
                <p>No departments yet. Create your first one.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Department' : 'New Department'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Engineering"
                  required
                />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Work Start</label>
                  <input
                    type="time"
                    value={formData.work_start}
                    onChange={(e) => setFormData({ ...formData, work_start: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Work End</label>
                  <input
                    type="time"
                    value={formData.work_end}
                    onChange={(e) => setFormData({ ...formData, work_end: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Late After (minutes)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.late_after}
                    onChange={(e) => setFormData({ ...formData, late_after: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Early Leave Before (minutes)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.early_leave_before}
                    onChange={(e) => setFormData({ ...formData, early_leave_before: Number(e.target.value) })}
                    required
                  />
                </div>
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
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; }
        .mb-4 { margin-bottom: 1.5rem; }
        .table-card { padding: 0; overflow: hidden; }
        .table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
        .btn-icon { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 0.6rem; color: var(--text-muted); display: flex; align-items: center; }
        .btn-icon:hover { color: var(--text); }
        .table-loading { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; color: var(--text-muted); }
        .spinner-sm { width: 22px; height: 22px; border: 3px solid var(--primary-ring); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; padding: 1.5rem; }
        .dept-card { padding: 1.5rem; display: flex; align-items: flex-start; gap: 1rem; transition: all 0.2s ease; }
        .dept-card:hover { transform: translateY(-2px); }
        .dept-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--primary-soft); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dept-info { flex: 1; }
        .dept-info h4 { font-size: 1rem; margin-bottom: 0.25rem; }
        .dept-info p { font-size: 0.85rem; color: var(--text-muted); }
        .dept-actions { display: flex; gap: 0.5rem; }
        .icon-btn { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 0.45rem; color: var(--text-muted); display: flex; align-items: center; transition: all 0.2s ease; }
        .icon-btn:hover { background: var(--surface-3); color: var(--text); }
        .icon-btn.edit:hover { color: var(--primary); border-color: var(--primary); }
        .icon-btn.danger:hover { color: var(--danger); border-color: var(--danger); }
        .delete-confirm { display: flex; align-items: center; gap: 0.4rem; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--text-muted); text-align: center; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { width: 100%; max-width: 480px; padding: 2rem; animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; }
        .modal-header h3 { font-size: 1.25rem; }
        .modal-form .input-group { margin-bottom: 1.25rem; }
        textarea { width: 100%; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 0.75rem 1rem; color: var(--text); font-family: inherit; height: 90px; resize: vertical; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .btn-text { background: transparent; color: var(--text-muted); padding: 0.75rem 1.5rem; border-radius: 10px; }
        .btn-text:hover { color: var(--text); background: var(--surface-2); }
        .status-message { padding: 1rem 1.5rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.success { background: var(--success-soft); color: var(--success); border: 1px solid var(--success-soft); }
        .status-message.error { background: var(--danger-soft); color: var(--danger); border: 1px solid var(--danger-soft); }
      `}</style>
    </div>
  );
};

export default DepartmentsPage;
