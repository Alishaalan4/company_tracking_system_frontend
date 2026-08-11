import api from './axios';

export interface AppSettings {
  company_name: string;
  working_hours_start: string;
  working_hours_end: string;
  late_threshold_minutes: number;
  timezone: string;
  allow_remote_work: boolean;
}

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (data: Partial<AppSettings>) => {
    const response = await api.post('/settings', data);
    return response.data;
  },
};
