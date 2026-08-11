import api from './axios';

export interface AttendanceRecord {
  id: number;
  user_id: number;
  check_in: string;
  check_out: string | null;
  date: string;
  status: string;
  duration: number | null;
  location_in: string | null;
  location_out: string | null;
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
