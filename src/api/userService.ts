import api from './axios';

export interface UserPayload {
  name: string;
  email: string;
  role_id: number;
  department_id: number | null;
  password?: string;
  pin?: string;
}

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: UserPayload) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<UserPayload>) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  resendCredentials: async (id: number) => {
    const response = await api.post(`/users/${id}/resend-credentials`);
    return response.data;
  },
};
