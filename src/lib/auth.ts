import { User } from '../types';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

export const getAuthUser = (): Partial<User> | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const setAuthUser = (user: Partial<User>) => localStorage.setItem('user', JSON.stringify(user));
export const removeAuthUser = () => localStorage.removeItem('user');

export const logout = () => {
  removeAuthToken();
  removeAuthUser();
  window.location.href = '/login';
};
