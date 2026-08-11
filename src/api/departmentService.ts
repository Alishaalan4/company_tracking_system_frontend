import api from './axios';

export interface Department {
  id: number;
  name: string;
  /** "HH:MM:SS" working window used to derive late / early-leave flags. */
  work_start: string;
  work_end: string;
  /** Grace period in minutes before a check-in counts as late. */
  late_after: number;
  /** Minutes before work_end that a check-out counts as leaving early. */
  early_leave_before: number;
}

export type DepartmentPayload = Omit<Department, 'id'>;

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  getDepartment: async (id: number) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data: DepartmentPayload) => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  updateDepartment: async (id: number, data: DepartmentPayload) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: number) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};
