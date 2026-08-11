import React, { useState, useEffect } from 'react';
import { settingsService, type AppSettings } from '../../api/settingsService';
import { Settings, Save } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getSettings();
      setSettings(res.data || res);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof AppSettings, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="settings-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>System Settings</h1>
          <p>Configure working hours, company info, and attendance rules.</p>
        </div>
      </header>

      {message && <div className={`status-message ${message.type} mb-4`}>{message.text}</div>}

      {loading ? (
        <div className="settings-loading">
          <div className="spinner-sm" />
          <span>Loading settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="settings-grid">
            {/* Company Info */}
            <div className="glass card settings-card">
              <div className="settings-card-header">
                <div className="settings-icon">
                  <Settings size={20} />
                </div>
                <div>
                  <h3>Company Information</h3>
                  <p>Basic company details shown across the app</p>
                </div>
              </div>
              <div className="settings-body">
                <div className="input-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={settings.company_name || ''}
                    onChange={(e) => set('company_name', e.target.value)}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="input-group">
                  <label>Timezone</label>
                  <input
                    type="text"
                    value={settings.timezone || ''}
                    onChange={(e) => set('timezone', e.target.value)}
                    placeholder="e.g. UTC, America/New_York"
                  />
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="glass card settings-card">
              <div className="settings-card-header">
                <div className="settings-icon accent">
                  <Settings size={20} />
                </div>
                <div>
                  <h3>Working Hours</h3>
                  <p>Define the standard working schedule</p>
                </div>
              </div>
              <div className="settings-body">
                <div className="form-row">
                  <div className="input-group">
                    <label>Work Start Time</label>
                    <input
                      type="time"
                      value={settings.working_hours_start || ''}
                      onChange={(e) => set('working_hours_start', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Work End Time</label>
                    <input
                      type="time"
                      value={settings.working_hours_end || ''}
                      onChange={(e) => set('working_hours_end', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Late Threshold (minutes)</label>
                  <input
                    type="number"
                    min={0}
                    value={settings.late_threshold_minutes ?? ''}
                    onChange={(e) => set('late_threshold_minutes', Number(e.target.value))}
                    placeholder="e.g. 15"
                  />
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="glass card settings-card">
              <div className="settings-card-header">
                <div className="settings-icon warning">
                  <Settings size={20} />
                </div>
                <div>
                  <h3>Policies</h3>
                  <p>Attendance and work policies</p>
                </div>
              </div>
              <div className="settings-body">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.allow_remote_work ?? false}
                    onChange={(e) => set('allow_remote_work', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <div>
                    <span className="toggle-text">Allow Remote Work</span>
                    <p className="toggle-hint">Employees can check-in from outside the office</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="save-bar glass">
            <p>Changes will take effect immediately after saving.</p>
            <button type="submit" className="btn-primary" disabled={saving} id="save-settings-btn">
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}

      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .mb-4 { margin-bottom: 1.5rem; }
        .settings-loading { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 6rem; color: var(--text-muted); }
        .spinner-sm { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .settings-grid { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
        .settings-card { padding: 0; overflow: hidden; }
        .settings-card-header { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
        .settings-icon { width: 42px; height: 42px; border-radius: 10px; background: rgba(99,102,241,0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .settings-icon.accent { background: rgba(16,185,129,0.12); color: var(--accent); }
        .settings-icon.warning { background: rgba(245,158,11,0.12); color: #f59e0b; }
        .settings-card-header h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.2rem; }
        .settings-card-header p { font-size: 0.85rem; color: var(--text-muted); }
        .settings-body { padding: 1.5rem; }
        .settings-body .input-group { margin-bottom: 1.25rem; }
        .settings-body .input-group:last-child { margin-bottom: 0; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .toggle-label { display: flex; align-items: flex-start; gap: 1rem; cursor: pointer; }
        .toggle-label input[type="checkbox"] { display: none; }
        .toggle-switch { position: relative; width: 44px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 12px; flex-shrink: 0; margin-top: 2px; transition: background 0.2s; }
        .toggle-switch::after { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: white; top: 3px; left: 3px; transition: transform 0.2s; }
        .toggle-label input:checked + .toggle-switch { background: var(--primary); }
        .toggle-label input:checked + .toggle-switch::after { transform: translateX(20px); }
        .toggle-text { font-weight: 500; display: block; margin-bottom: 0.2rem; }
        .toggle-hint { font-size: 0.85rem; color: var(--text-muted); }
        .save-bar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.75rem; border-radius: 12px; }
        .save-bar p { font-size: 0.9rem; color: var(--text-muted); }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; }
        .status-message { padding: 1rem 1.5rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-message.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
};

export default SettingsPage;
