import api from './axios';

export interface ReportSummary {
  total_employees: number;
  present_today: number;
  on_leave_today: number;
  absent_today: number;
  /** Running totals across all records, also used by the PDF export. */
  total_late: number;
  total_absent: number;
  total_early: number;
}

export interface DailyReport {
  date: string;
  records: {
    user_id: number;
    user_name: string;
    department: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    duration: number | null;
  }[];
}

export interface MonthlyReport {
  month: number;
  year: number;
  records: {
    user_id: number;
    user_name: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    leave_days: number;
    late_days: number;
  }[];
}

export const reportService = {
  getSummary: async () => {
    const response = await api.get('/reports/summary');
    return response.data;
  },

  getDailyReport: async (date?: string) => {
    const response = await api.get('/reports/daily', { params: { date } });
    return response.data;
  },

  getMonthlyReport: async (month?: number, year?: number) => {
    const response = await api.get('/reports/monthly', { params: { month, year } });
    return response.data;
  },

  exportPdf: async (params?: { date?: string; month?: number; year?: number }) => {
    const response = await api.get('/reports/export/pdf', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  exportExcel: async (params?: { date?: string; month?: number; year?: number }) => {
    const response = await api.get('/reports/export/excel', {
      params,
      responseType: 'blob',
    });
    return response;
  },
};
