import React, { useState, useEffect } from 'react';
import { auditLogService, type AuditLog } from '../../api/auditLogService';
import { ShieldCheck, RefreshCw, Search } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getAuditLogs();
      setLogs(res.data || res);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load audit logs' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(
    (l) =>
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.model?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (!action) return '#94a3b8';
    const a = action.toLowerCase();
    if (a.includes('create') || a.includes('store')) return '#10b981';
    if (a.includes('update') || a.includes('edit')) return '#818cf8';
    if (a.includes('delete') || a.includes('destroy')) return '#ef4444';
    if (a.includes('login')) return '#f59e0b';
    return '#94a3b8';
  };

  const getActionBg = (action: string) => {
    const color = getActionColor(action);
    return `${color}18`;
  };

  return (
    <div className="audit-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Audit Logs</h1>
          <p>Track all system activities and user actions.</p>
        </div>
      </header>

      {message && <div className={`status-message error mb-4`}>{message.text}</div>}

      <div className="glass card table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by user, action or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="audit-search"
            />
          </div>
          <button className="btn-icon" onClick={fetchLogs} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner-sm" />
            <span>Loading audit logs...</span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Model</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className="log-time">
                          {format(new Date(log.created_at), 'MMM d, HH:mm')}
                        </span>
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">
                            {(log.user_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span>{log.user_name || `User #${log.user_id}`}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="action-badge"
                          style={{
                            color: getActionColor(log.action),
                            background: getActionBg(log.action),
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="model-tag">{log.model}</span>
                        {log.model_id && (
                          <span className="model-id">#{log.model_id}</span>
                        )}
                      </td>
                      <td>
                        <span className="ip-address">{log.ip_address || '—'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      <ShieldCheck size={32} />
                      <p>{search ? 'No logs match your search' : 'No audit logs yet'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .mb-4 { margin-bottom: 1.5rem; }
        .table-card { padding: 0; overflow: hidden; }
        .table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); gap: 1rem; }
        .search-box { display: flex; align-items: center; gap: 0.75rem; background: rgba(15,23,42,0.5); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.6rem 1rem; flex: 1; max-width: 420px; color: var(--text-muted); }
        .search-box input { background: transparent; border: none; outline: none; color: var(--text-main); width: 100%; padding: 0; box-shadow: none; }
        .btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.6rem; color: var(--text-muted); display: flex; align-items: center; }
        .btn-icon:hover { color: var(--text-main); }
        .table-loading { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; color: var(--text-muted); }
        .spinner-sm { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .data-table thead tr { border-bottom: 1px solid var(--border-color); }
        .data-table th { text-align: left; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
        .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
        .data-table tbody tr:hover { background: rgba(255,255,255,0.02); }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .log-time { font-size: 0.85rem; color: var(--text-muted); font-variant-numeric: tabular-nums; }
        .user-cell { display: flex; align-items: center; gap: 0.75rem; }
        .user-avatar-sm { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg, var(--primary), #8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
        .action-badge { padding: 0.25rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
        .model-tag { font-size: 0.85rem; color: var(--text-muted); }
        .model-id { margin-left: 0.4rem; font-size: 0.75rem; opacity: 0.6; }
        .ip-address { font-size: 0.82rem; font-family: monospace; color: var(--text-muted); }
        .empty-row { text-align: center; padding: 4rem; color: var(--text-muted); }
        .empty-row p { margin-top: 0.75rem; }
        .status-message { padding: 1rem 1.5rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
};

export default AuditLogsPage;
