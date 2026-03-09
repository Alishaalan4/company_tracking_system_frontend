export type RoleName = 'admin' | 'manager' | 'employee';

export interface Role {
  id: number;
  name: RoleName;
}

export interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  department_id: number | null;
  is_active: boolean;
  must_change_password: boolean;
  must_change_pin: boolean;
  role?: Role;
  department?: Department;
}
