import api from './axios';

/** Shape emitted by the backend AttendanceResource. */
export interface AttendanceRecord {
  id: number;
  user_id: number;
  user_name?: string;
  department?: string | null;
  date: string;
  /** ISO 8601, or null while the day has not been opened/closed. */
  check_in: string | null;
  check_out: string | null;
  /** Worked minutes, null until checked out. */
  duration: number | null;
  status: 'ontime' | 'late' | 'early' | 'absent' | 'pending';
  is_late: boolean;
  left_early: boolean;
  is_absent: boolean;
}

export const attendanceService = {
  checkIn: async (pin: string) => {
    const response = await api.post('/attendance/check-in', { pin });
    return response.data;
  },

  checkOut: async (pin: string) => {
    const response = await api.post('/attendance/check-out', { pin });
    return response.data;
  },

  checkStatus: async () => {
    const response = await api.get('/attendance/status');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/attendance/history');
    return response.data;
  }
};
