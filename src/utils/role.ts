import type { RoleName, User } from '../types';

/**
 * The API stores role names capitalised ("Admin"), so never compare
 * `user.role.name` directly — normalise through here first.
 */
export const getRoleName = (user: User | null | undefined): RoleName | undefined => {
  const name = user?.role?.name?.toLowerCase();
  return name === 'admin' || name === 'manager' || name === 'employee' ? name : undefined;
};

export const hasRole = (user: User | null | undefined, allowed: RoleName[]): boolean => {
  const role = getRoleName(user);
  return !!role && allowed.includes(role);
};

export const isAdmin = (user: User | null | undefined) => getRoleName(user) === 'admin';
export const isManager = (user: User | null | undefined) => getRoleName(user) === 'manager';
