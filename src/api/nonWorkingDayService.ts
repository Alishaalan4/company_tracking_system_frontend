import api from './axios';

export interface NonWorkingDay {
  id: number;
  name: string;
  date: string;
  is_recurring: boolean;
}

export const nonWorkingDayService = {
  getNonWorkingDays: async () => {
    const response = await api.get('/non-working-days');
    return response.data;
  },

  createNonWorkingDay: async (data: { name: string; date: string; is_recurring?: boolean }) => {
    const response = await api.post('/non-working-days', data);
    return response.data;
  },

  updateNonWorkingDay: async (id: number, data: { name: string; date: string; is_recurring?: boolean }) => {
    const response = await api.put(`/non-working-days/${id}`, data);
    return response.data;
  },

  deleteNonWorkingDay: async (id: number) => {
    const response = await api.delete(`/non-working-days/${id}`);
    return response.data;
  },
};
