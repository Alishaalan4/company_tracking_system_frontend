import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-pw-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Forgot Password</h1>
          <p>We'll send you a link to reset your password.</p>
        </div>
      </header>

      <div className="form-container">
        <div className="glass card form-card">
          {sent ? (
            <div className="success-state">
              <div className="success-icon">
                <Send size={32} />
              </div>
              <h3>Email Sent!</h3>
              <p>
                If an account exists for <strong>{email}</strong>, you will receive a password
                reset link shortly. Check your inbox and spam folder.
              </p>
              <Link to="/login" className="btn-primary back-btn">
                <ArrowLeft size={18} />
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="form-icon">
                <Mail size={28} />
              </div>
              <h3>Reset Password</h3>
              <p className="form-subtitle">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && <div className="status-message error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    id="forgot-email"
                  />
                </div>
                <button type="submit" className="btn-primary full-btn" disabled={loading} id="send-reset-btn">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="back-link">
                <Link to="/login"><ArrowLeft size={15} /> Back to Login</Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .page-header { margin-bottom: 2rem; }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .form-container { max-width: 480px; }
        .form-card { padding: 2.5rem; }
        .form-icon { width: 56px; height: 56px; border-radius: 16px; background: var(--primary-soft); color: var(--primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .form-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .form-subtitle { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; }
        .status-message { padding: 0.9rem 1.25rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.error { background: var(--danger-soft); color: var(--danger); border: 1px solid var(--danger-soft); }
        .input-group { margin-bottom: 1.5rem; }
        .full-btn { width: 100%; justify-content: center; }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; }
        .back-link { margin-top: 1.5rem; text-align: center; }
        .back-link a { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--text-muted); font-size: 0.9rem; text-decoration: none; }
        .back-link a:hover { color: var(--primary); }
        .success-state { text-align: center; padding: 1rem 0; }
        .success-icon { width: 72px; height: 72px; border-radius: 20px; background: var(--success-soft); color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .success-state h3 { font-size: 1.5rem; margin-bottom: 1rem; }
        .success-state p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 2rem; }
        .back-btn { display: inline-flex; margin: 0 auto; padding: 0.75rem 1.75rem; }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
