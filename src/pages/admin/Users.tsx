import React, { useState, useEffect } from 'react';
import { userService, type UserPayload } from '../../api/userService';
import { departmentService } from '../../api/departmentService';
import type { User, Department } from '../../types';
import {
  Users, Plus, Pencil, Trash2, RefreshCw, Search,
  CheckCircle2, XCircle, Shield, Mail, X
} from 'lucide-react';

const ROLES = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'manager' },
  { id: 3, name: 'employee' },
];

const emptyForm: UserPayload = {
  name: '',
  email: '',
  role_id: 3,
  department_id: null,
  password: '',
  pin: '',
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserPayload>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptRes] = await Promise.all([
        userService.getUsers(),
        departmentService.getDepartments(),
      ]);
      setUsers(usersRes.data || usersRes);
      setDepartments(deptRes.data || deptRes);
    } catch {
      showMsg('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role_id: u.role_id,
      department_id: u.department_id,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        showMsg('success', 'User updated successfully');
      } else {
        await userService.createUser(formData);
        showMsg('success', 'User created successfully');
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
      await userService.deleteUser(id);
      showMsg('success', 'User deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch {
      showMsg('error', 'Failed to delete user');
    }
  };

  const handleResend = async (id: number) => {
    try {
      await userService.resendCredentials(id);
      showMsg('success', 'Credentials sent successfully');
    } catch {
      showMsg('error', 'Failed to send credentials');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role?: { name: string }) => {
    const map: Record<string, string> = {
      admin: 'badge-admin',
      manager: 'badge-manager',
      employee: 'badge-employee',
    };
    return map[role?.name || 'employee'] || 'badge-employee';
  };

  return (
    <div className="users-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Users</h1>
          <p>Manage all system users and their roles.</p>
        </div>
        <button className="btn-primary" onClick={openCreate} id="create-user-btn">
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </header>

      {message && (
        <div className={`status-message ${message.type} mb-4`}>{message.text}</div>
      )}

      <div className="glass card table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="user-search"
            />
          </div>
          <button className="btn-icon" onClick={fetchData} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner-sm" />
            <span>Loading users...</span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted-sm">{u.email}</span>
                      </td>
                      <td>
                        <span className={`role-badge ${getRoleBadge(u.role)}`}>
                          <Shield size={12} />
                          {u.role?.name || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted-sm">
                          {u.department?.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </span>
                      </td>
                      <td>
                        {u.is_active ? (
                          <span className="status-pill active">
                            <CheckCircle2 size={13} /> Active
                          </span>
                        ) : (
                          <span className="status-pill inactive">
                            <XCircle size={13} /> Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="icon-btn edit"
                            onClick={() => openEdit(u)}
                            title="Edit user"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="icon-btn resend"
                            onClick={() => handleResend(u.id)}
                            title="Resend credentials"
                          >
                            <Mail size={15} />
                          </button>
                          {deleteConfirm === u.id ? (
                            <div className="delete-confirm">
                              <button className="icon-btn danger" onClick={() => handleDelete(u.id)}>
                                <CheckCircle2 size={15} />
                              </button>
                              <button className="icon-btn" onClick={() => setDeleteConfirm(null)}>
                                <X size={15} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="icon-btn danger"
                              onClick={() => setDeleteConfirm(u.id)}
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      <Users size={32} />
                      <p>No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Create User'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Role</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <select
                    value={formData.department_id ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">None</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {!editingUser && (
                <div className="form-row">
                  <div className="input-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Attendance PIN</label>
                    <input
                      type="text"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      placeholder="e.g. 1234"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn-text" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; }
        .mb-4 { margin-bottom: 1.5rem; }

        .table-card { padding: 0; overflow: hidden; }
        .table-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          gap: 1rem;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(15,23,42,0.5);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.6rem 1rem;
          flex: 1;
          max-width: 380px;
          color: var(--text-muted);
        }
        .search-box input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          width: 100%;
          padding: 0;
          box-shadow: none;
        }
        .btn-icon {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.6rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .btn-icon:hover { color: var(--text-main); background: rgba(255,255,255,0.08); }

        .table-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 4rem;
          color: var(--text-muted);
        }
        .spinner-sm {
          width: 22px; height: 22px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .table-wrapper { overflow-x: auto; }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .data-table thead tr {
          border-bottom: 1px solid var(--border-color);
        }
        .data-table th {
          text-align: left;
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .data-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .data-table tbody tr:hover { background: rgba(255,255,255,0.02); }
        .data-table tbody tr:last-child td { border-bottom: none; }

        .user-cell { display: flex; align-items: center; gap: 0.75rem; }
        .user-avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.85rem;
          flex-shrink: 0;
        }
        .text-muted-sm { color: var(--text-muted); font-size: 0.875rem; }

        .role-badge {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.25rem 0.7rem; border-radius: 6px;
          font-size: 0.75rem; font-weight: 600; text-transform: capitalize;
        }
        .badge-admin { background: rgba(239,68,68,0.12); color: #ef4444; }
        .badge-manager { background: rgba(99,102,241,0.12); color: #818cf8; }
        .badge-employee { background: rgba(16,185,129,0.12); color: #10b981; }

        .status-pill {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.25rem 0.7rem; border-radius: 6px;
          font-size: 0.75rem; font-weight: 600;
        }
        .status-pill.active { background: rgba(16,185,129,0.1); color: #10b981; }
        .status-pill.inactive { background: rgba(239,68,68,0.1); color: #ef4444; }

        .action-btns { display: flex; align-items: center; gap: 0.5rem; }
        .icon-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.45rem;
          color: var(--text-muted);
          display: flex; align-items: center;
          transition: all 0.2s ease;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.12); color: var(--text-main); }
        .icon-btn.edit:hover { color: var(--primary); border-color: var(--primary); }
        .icon-btn.danger:hover { color: var(--danger); border-color: var(--danger); }
        .icon-btn.resend:hover { color: var(--accent); border-color: var(--accent); }
        .delete-confirm { display: flex; align-items: center; gap: 0.4rem; }

        .empty-row { text-align: center; padding: 4rem; color: var(--text-muted); }
        .empty-row p { margin-top: 0.75rem; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .modal {
          width: 100%; max-width: 600px;
          padding: 2rem;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 2rem;
        }
        .modal-header h3 { font-size: 1.25rem; }
        .modal-form .form-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
          margin-bottom: 0;
        }
        .modal-form .input-group { margin-bottom: 1.25rem; }
        select {
          width: 100%;
          background: rgba(15,23,42,0.6);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: white;
          font-family: inherit;
        }
        .modal-footer {
          display: flex; justify-content: flex-end; gap: 1rem;
          margin-top: 1rem; padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        .btn-text {
          background: transparent; color: var(--text-muted);
          padding: 0.75rem 1.5rem; border-radius: 10px;
        }
        .btn-text:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }

        .status-message {
          padding: 1rem 1.5rem; border-radius: 10px;
          font-size: 0.9rem; margin-bottom: 1.5rem;
        }
        .status-message.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-message.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
};

export default UsersPage;
