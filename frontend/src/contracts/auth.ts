export type UserRole = 'HR' | 'SUPERVISOR' | 'ADMIN';

export interface LoginRequest {
  username: string;
  password: string;
}