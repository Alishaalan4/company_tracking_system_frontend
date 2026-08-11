import api from './axios';

export interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    title: string;
    action_url?: string;
  };
  read_at: string | null;
  created_at: string;
}

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  }
};
