import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '@/contracts/auth';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RequireAuth({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  // PREMIUM LOADING STATE
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground tracking-wide animate-pulse">
          Authenticating workspace...
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  // If user exists but lacks permission, push to unauthorized or their respective dashboard
  if (user.role !== role) {
    // Basic fallback: push them back to login if they try to access wrong routes
    return <Navigate to="/login" replace />; 
  }

  return <>{children}</>;
}