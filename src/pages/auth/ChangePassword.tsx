import React, { useState } from 'react';
import { authService } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const ChangePassword: React.FC = () => {
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { user } = await authService.changePassword(form);
      // Clears must_change_password so the gate stops redirecting here.
      if (user) setUser(user);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, field, showKey, placeholder,
  }: {
    label: string;
    field: keyof typeof form;
    showKey: keyof typeof show;
    placeholder: string;
  }) => (
    <div className="input-group">
      <label>{label}</label>
      <div className="pw-input-wrap">
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
        >
          {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="change-pw-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Change Password</h1>
          <p>Update your account password for security.</p>
        </div>
      </header>

      <div className="form-container">
        <div className="glass card form-card">
          <div className="form-icon">
            <Lock size={28} />
          </div>
          <h3>Update Password</h3>
          <p className="form-subtitle">Choose a strong password that you haven't used before.</p>

          {message && <div className={`status-message ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit}>
            <Field label="Current Password" field="current_password" showKey="current" placeholder="Enter current password" />
            <Field label="New Password" field="password" showKey="new" placeholder="Enter new password" />
            <Field label="Confirm New Password" field="password_confirmation" showKey="confirm" placeholder="Repeat new password" />

            <div className="pw-rules">
              <p>Password requirements:</p>
              <ul>
                <li className={form.password.length >= 8 ? 'met' : ''}><CheckCircle2 size={13} /> At least 8 characters</li>
                <li className={/[A-Z]/.test(form.password) ? 'met' : ''}><CheckCircle2 size={13} /> At least one uppercase letter</li>
                <li className={/[0-9]/.test(form.password) ? 'met' : ''}><CheckCircle2 size={13} /> At least one number</li>
              </ul>
            </div>

            <button type="submit" className="btn-primary full-btn" disabled={loading} id="change-password-btn">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .page-header { margin-bottom: 2rem; }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .form-container { max-width: 520px; }
        .form-card { padding: 2.5rem; }
        .form-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(99,102,241,0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .form-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .form-subtitle { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; }
        .status-message { padding: 0.9rem 1.25rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-message.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .input-group { margin-bottom: 1.25rem; }
        .pw-input-wrap { position: relative; }
        .pw-input-wrap input { padding-right: 3rem; }
        .pw-toggle { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: transparent; color: var(--text-muted); padding: 0; }
        .pw-toggle:hover { color: var(--text-main); }
        .pw-rules { background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.75rem; }
        .pw-rules p { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .pw-rules ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
        .pw-rules li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); transition: color 0.2s; }
        .pw-rules li.met { color: var(--accent); }
        .full-btn { width: 100%; justify-content: center; }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; }
      `}</style>
    </div>
  );
};

export default ChangePassword;
