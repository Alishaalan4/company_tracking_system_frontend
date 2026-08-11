import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import { KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [form, setForm] = useState({
    email: emailParam,
    password: '',
    password_confirmation: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await authService.resetPassword({ token, ...form });
      setMessage({ type: 'success', text: 'Password reset! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Invalid or expired reset link',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-pw-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
        </div>
      </header>

      <div className="form-container">
        <div className="glass card form-card">
          <div className="form-icon">
            <KeyRound size={28} />
          </div>
          <h3>New Password</h3>
          <p className="form-subtitle">Choose a strong, unique password for your account.</p>

          {!token && (
            <div className="status-message error">
              Invalid reset link. Please request a new one.{' '}
              <Link to="/forgot-password" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Try again
              </Link>
            </div>
          )}

          {message && <div className={`status-message ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="input-group">
              <label>New Password</label>
              <div className="pw-input-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <div className="pw-input-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>

            <div className="pw-rules">
              <ul>
                <li className={form.password.length >= 8 ? 'met' : ''}><CheckCircle2 size={13} /> 8+ characters</li>
                <li className={form.password === form.password_confirmation && form.password.length > 0 ? 'met' : ''}><CheckCircle2 size={13} /> Passwords match</li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn-primary full-btn"
              disabled={loading || !token}
              id="reset-password-btn"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .page-header { margin-bottom: 2rem; }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .form-container { max-width: 480px; }
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
        .pw-rules { background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.75rem 1.25rem; margin-bottom: 1.75rem; }
        .pw-rules ul { list-style: none; display: flex; gap: 1.5rem; }
        .pw-rules li { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--text-muted); }
        .pw-rules li.met { color: var(--accent); }
        .full-btn { width: 100%; justify-content: center; }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; }
      `}</style>
    </div>
  );
};

export default ResetPassword;
