import React, { useState, useEffect } from 'react';
import { reportService } from '../../api/reportService';
import {
  BarChart2, Users, UserCheck, UserX, Clock,
  FileText, Download, RefreshCw, Calendar
} from 'lucide-react';
import { format } from 'date-fns';

type ReportTab = 'summary' | 'daily' | 'monthly';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [summary, setSummary] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'summary') fetchSummary();
    else if (activeTab === 'daily') fetchDaily();
    else if (activeTab === 'monthly') fetchMonthly();
  }, [activeTab]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await reportService.getSummary();
      setSummary(res.data || res);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load summary' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await reportService.getDailyReport(selectedDate);
      setDailyData(res.data || res);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load daily report' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    setLoading(true);
    try {
      const res = await reportService.getMonthlyReport(selectedMonth, selectedYear);
      setMonthlyData(res.data || res);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load monthly report' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    setExporting(type);
    try {
      const params =
        activeTab === 'daily'
          ? { date: selectedDate }
          : activeTab === 'monthly'
          ? { month: selectedMonth, year: selectedYear }
          : undefined;

      const response = type === 'pdf'
        ? await reportService.exportPdf(params)
        : await reportService.exportExcel(params);

      const ext = type === 'pdf' ? 'pdf' : 'xlsx';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${activeTab}.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: `Failed to export ${type.toUpperCase()}` });
    } finally {
      setExporting(null);
    }
  };

  const summaryCards = summary
    ? [
        {
          label: 'Total Employees',
          value: summary.total_employees ?? '—',
          icon: Users,
          color: 'var(--primary)',
        },
        {
          label: 'Present Today',
          value: summary.present_today ?? '—',
          icon: UserCheck,
          color: 'var(--accent)',
        },
        {
          label: 'On Leave',
          value: summary.on_leave_today ?? '—',
          icon: Calendar,
          color: '#f59e0b',
        },
        {
          label: 'Absent',
          value: summary.absent_today ?? '—',
          icon: UserX,
          color: 'var(--danger)',
        },
      ]
    : [];

  return (
    <div className="reports-page animate-fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>Reports</h1>
          <p>Attendance and workforce analytics.</p>
        </div>
        <div className="export-btns">
          <button
            className="btn-export pdf"
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            id="export-pdf-btn"
          >
            <Download size={16} />
            <span>{exporting === 'pdf' ? 'Exporting...' : 'PDF'}</span>
          </button>
          <button
            className="btn-export excel"
            onClick={() => handleExport('excel')}
            disabled={!!exporting}
            id="export-excel-btn"
          >
            <Download size={16} />
            <span>{exporting === 'excel' ? 'Exporting...' : 'Excel'}</span>
          </button>
        </div>
      </header>

      {message && <div className="status-message error mb-4">{message.text}</div>}

      {/* Tabs */}
      <div className="tabs">
        {(['summary', 'daily', 'monthly'] as ReportTab[]).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
          >
            {tab === 'summary' && <BarChart2 size={16} />}
            {tab === 'daily' && <Clock size={16} />}
            {tab === 'monthly' && <Calendar size={16} />}
            <span style={{ textTransform: 'capitalize' }}>{tab}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="report-loading">
          <div className="spinner-sm" />
          <span>Loading report...</span>
        </div>
      ) : (
        <>
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div>
              <div className="summary-grid">
                {summaryCards.map((c, i) => (
                  <div key={i} className="glass-card summary-card">
                    <div className="s-icon" style={{ background: `${c.color}18`, color: c.color }}>
                      <c.icon size={24} />
                    </div>
                    <div className="s-info">
                      <span className="s-label">{c.label}</span>
                      <span className="s-value">{c.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              {!summary && (
                <div className="empty-state">
                  <BarChart2 size={40} />
                  <p>No summary data available</p>
                </div>
              )}
            </div>
          )}

          {/* Daily Tab */}
          {activeTab === 'daily' && (
            <div>
              <div className="report-controls glass card">
                <div className="input-group" style={{ marginBottom: 0, flex: 1, maxWidth: 300 }}>
                  <label>Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <button className="btn-icon" onClick={fetchDaily} title="Fetch report">
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="glass card table-card">
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData?.records?.length > 0 ? (
                        dailyData.records.map((r: any) => (
                          <tr key={r.user_id}>
                            <td>{r.user_name}</td>
                            <td><span className="text-muted">{r.department || '—'}</span></td>
                            <td>{r.check_in ? format(new Date(r.check_in), 'hh:mm a') : '—'}</td>
                            <td>{r.check_out ? format(new Date(r.check_out), 'hh:mm a') : '—'}</td>
                            <td>{r.duration ? `${Math.floor(r.duration / 60)}h ${r.duration % 60}m` : '—'}</td>
                            <td>
                              <span className={`status-badge ${r.status?.toLowerCase()}`}>
                                {r.status || '—'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="empty-row">
                            <FileText size={32} />
                            <p>No records for this date</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Tab */}
          {activeTab === 'monthly' && (
            <div>
              <div className="report-controls glass card">
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {format(new Date(2000, i, 1), 'MMMM')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Year</label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    min={2020}
                    max={2099}
                    style={{ maxWidth: 120 }}
                  />
                </div>
                <button className="btn-icon" onClick={fetchMonthly} title="Fetch report">
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="glass card table-card">
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Total Days</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>On Leave</th>
                        <th>Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData?.records?.length > 0 ? (
                        monthlyData.records.map((r: any) => {
                          const pct = r.total_days > 0
                            ? Math.round((r.present_days / r.total_days) * 100)
                            : 0;
                          return (
                            <tr key={r.user_id}>
                              <td>{r.user_name}</td>
                              <td>{r.total_days}</td>
                              <td><span style={{ color: 'var(--accent)' }}>{r.present_days}</span></td>
                              <td><span style={{ color: 'var(--danger)' }}>{r.absent_days}</span></td>
                              <td><span style={{ color: '#f59e0b' }}>{r.leave_days}</span></td>
                              <td>
                                <div className="pct-cell">
                                  <div className="pct-bar">
                                    <div
                                      className="pct-fill"
                                      style={{
                                        width: `${pct}%`,
                                        background: pct >= 80 ? 'var(--accent)' : pct >= 50 ? '#f59e0b' : 'var(--danger)',
                                      }}
                                    />
                                  </div>
                                  <span>{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="empty-row">
                            <FileText size={32} />
                            <p>No records for this period</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header-content h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .header-content p { color: var(--text-muted); }
        .export-btns { display: flex; gap: 0.75rem; }
        .btn-export { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 500; font-size: 0.9rem; }
        .btn-export.pdf { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .btn-export.excel { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .btn-export:hover { filter: brightness(1.2); }
        .btn-export:disabled { opacity: 0.6; cursor: not-allowed; }
        .mb-4 { margin-bottom: 1.5rem; }
        .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.75rem; }
        .tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); color: var(--text-muted); transition: all 0.2s ease; }
        .tab-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-main); }
        .tab-btn.active { background: rgba(99,102,241,0.15); border-color: var(--primary); color: var(--primary); }
        .report-loading { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 6rem; color: var(--text-muted); }
        .spinner-sm { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
        .summary-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; }
        .s-icon { width: 54px; height: 54px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .s-info { display: flex; flex-direction: column; }
        .s-label { font-size: 0.85rem; color: var(--text-muted); }
        .s-value { font-size: 1.75rem; font-weight: 700; }
        .report-controls { display: flex; align-items: flex-end; gap: 1rem; padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
        .btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.6rem; color: var(--text-muted); display: flex; align-items: center; }
        .btn-icon:hover { color: var(--text-main); }
        .table-card { padding: 0; overflow: hidden; }
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .data-table thead tr { border-bottom: 1px solid var(--border-color); }
        .data-table th { text-align: left; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
        .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table tbody tr:hover { background: rgba(255,255,255,0.02); }
        .text-muted { color: var(--text-muted); }
        .status-badge { padding: 0.25rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
        .status-badge.present { background: rgba(16,185,129,0.1); color: #10b981; }
        .status-badge.absent { background: rgba(239,68,68,0.1); color: #ef4444; }
        .status-badge.late { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .status-badge.on-leave { background: rgba(99,102,241,0.1); color: #818cf8; }
        .pct-cell { display: flex; align-items: center; gap: 0.75rem; }
        .pct-bar { flex: 1; max-width: 100px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
        .pct-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
        .empty-row { text-align: center; padding: 4rem; color: var(--text-muted); }
        .empty-row p { margin-top: 0.75rem; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 6rem; color: var(--text-muted); }
        select { width: 100%; background: rgba(15,23,42,0.6); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.75rem 1rem; color: white; font-family: inherit; }
        .status-message { padding: 1rem 1.5rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .status-message.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
};

export default ReportsPage;
