import api from './axios';

export const authService = {
  changePassword: async (data: { current_password: string; password: string; password_confirmation: string }) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  changePin: async (data: { current_pin: string; pin: string; pin_confirmation: string }) => {
    const response = await api.post('/auth/change-pin', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: { token: string; email: string; password: string; password_confirmation: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  loginWithPin: async (email: string, pin: string) => {
    const response = await api.post('/auth/login/pin', { email, pin });
    return response.data;
  },
};
