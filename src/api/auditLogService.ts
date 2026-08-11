import api from './axios';

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  model: string;
  model_id: number | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

export const auditLogService = {
  getAuditLogs: async (params?: { page?: number; per_page?: number; user_id?: number; action?: string }) => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },
};
