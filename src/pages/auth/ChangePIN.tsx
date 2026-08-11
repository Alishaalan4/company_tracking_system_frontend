import React, { useState } from 'react';
import { authService } from '../../api/authService';
import { Hash } from 'lucide-react';

const ChangePIN: React.FC = () => {
  const [form, setForm] = useState({ current_pin: '', pin: '', pin_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin !== form.pin_confirmation) {
      setMessage({ type: 'error', text: 'PINs do not match' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await authService.changePin(form);
      setMessage({ type: 'success', text: 'Attendance PIN updated successfully!' });
      setForm({ current_pin: '', pin: '', pin_confirmation: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update PIN' });
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setForm({ ...form, [field]: val });
  };

  const renderDots = (value: string, maxLen: number = 6) =>
    Array.from({ length: maxLen }).map((_, i) => (
      <div key={i} className={`pin-dot ${i < value.length ? 'filled' : ''}`} />
    ));

  return (
    <div className="change-pin-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Change Attendance PIN</h1>
          <p>Update your PIN used for check-in and check-out.</p>
        </div>
      </header>

      <div className="form-container">
        <div className="glass card form-card">
          <div className="form-icon">
            <Hash size={28} />
          </div>
          <h3>Update PIN</h3>
          <p className="form-subtitle">Your PIN is used to verify attendance at check-in terminals.</p>

          {message && <div className={`status-message ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit}>
            <div className="pin-field">
              <label>Current PIN</label>
              <div className="pin-input-wrap">
                <input
                  type="password"
                  inputMode="numeric"
                  value={form.current_pin}
                  onChange={handlePinInput('current_pin')}
                  maxLength={6}
                  required
                  placeholder="Enter current PIN"
                  className="pin-real-input"
                />
                <div className="pin-dots">{renderDots(form.current_pin)}</div>
              </div>
            </div>

            <div className="pin-field">
              <label>New PIN</label>
              <div className="pin-input-wrap">
                <input
                  type="password"
                  inputMode="numeric"
                  value={form.pin}
                  onChange={handlePinInput('pin')}
                  maxLength={6}
                  required
                  placeholder="Enter new PIN"
                  className="pin-real-input"
                />
                <div className="pin-dots">{renderDots(form.pin)}</div>
              </div>
            </div>

            <div className="pin-field">
              <label>Confirm New PIN</label>
              <div className="pin-input-wrap">
                <input
                  type="password"
                  inputMode="numeric"
                  value={form.pin_confirmation}
                  onChange={handlePinInput('pin_confirmation')}
                  maxLength={6}
                  required
                  placeholder="Repeat new PIN"
                  className="pin-real-input"
                />
                <div className="pin-dots">{renderDots(form.pin_confirmation)}</div>
              </div>
            </div>

            <button type="submit" className="btn-primary full-btn" disabled={loading} id="change-pin-btn">
              {loading ? 'Updating...' : 'Update PIN'}
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
        .form-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(16,185,129,0.12); color: var(--accent); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .form-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .form-subtitle { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; }
        .status-message { padding: 0.9rem 1.25rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-message.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .pin-field { margin-bottom: 1.5rem; }
        .pin-field label { display: block; margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--text-muted); }
        .pin-input-wrap { position: relative; }
        .pin-real-input { opacity: 0; position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 2; cursor: text; border: none; background: transparent; }
        .pin-dots { display: flex; gap: 0.75rem; padding: 1rem; background: rgba(15,23,42,0.6); border: 1px solid var(--border-color); border-radius: 10px; height: 56px; align-items: center; }
        .pin-dot { width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: all 0.15s ease; }
        .pin-dot.filled { background: var(--accent); transform: scale(1.15); box-shadow: 0 0 8px rgba(16,185,129,0.4); }
        .pin-input-wrap:focus-within .pin-dots { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(16,185,129,0.15); }
        .full-btn { width: 100%; justify-content: center; }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; }
      `}</style>
    </div>
  );
};

export default ChangePIN;
