export type UserRole = 'HR' | 'SUPERVISOR' | 'ADMIN';

export interface JwtPayload {
  userId: number;
  role: UserRole;
}
