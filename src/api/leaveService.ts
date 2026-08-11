import api from './axios';

export interface LeaveType {
  id: number;
  name: string;
  /** Days permitted per year; null means uncapped. Column is `annual_limit`. */
  annual_limit: number | null;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  /** Present for admins/managers reviewing other people's requests. */
  user_name?: string;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  /** Inclusive day count, computed server-side. */
  days: number | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  leave_type?: LeaveType;
  created_at?: string;
}

export const leaveService = {
  getLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },

  submitLeave: async (data: { leave_type_id: number; start_date: string; end_date: string; reason: string }) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  getLeaveTypes: async () => {
    const response = await api.get('/leave-types');
    return response.data;
  },

  // Admin: update leave status (approved / rejected)
  updateLeave: async (id: number, data: { status: 'approved' | 'rejected' }) => {
    const response = await api.put(`/leaves/${id}`, data);
    return response.data;
  },

  // Admin: delete leave
  deleteLeave: async (id: number) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },

  // Admin: get all leaves (via leave-requests alias)
  getAllLeaves: async () => {
    const response = await api.get('/leave-requests');
    return response.data;
  },

  // Admin: create leave type
  createLeaveType: async (data: { name: string; annual_limit: number | null }) => {
    const response = await api.post('/leave-types', data);
    return response.data;
  },

  // Admin: update leave type
  updateLeaveType: async (id: number, data: { name: string; annual_limit: number | null }) => {
    const response = await api.put(`/leave-types/${id}`, data);
    return response.data;
  },

  // Admin: delete leave type
  deleteLeaveType: async (id: number) => {
    const response = await api.delete(`/leave-types/${id}`);
    return response.data;
  },
};
