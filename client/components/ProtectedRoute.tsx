import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (adminOnly && !isAdmin) {
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isAdmin, adminOnly]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-cyberpunk flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-white text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-cyberpunk flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-white text-lg">Access denied. Admin only.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
