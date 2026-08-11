import api from './axios';

export interface Department {
  id: number;
  name: string;
  description?: string | null;
  manager_id?: number | null;
}

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  getDepartment: async (id: number) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data: { name: string; description?: string; manager_id?: number | null }) => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  updateDepartment: async (id: number, data: { name: string; description?: string; manager_id?: number | null }) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: number) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};
