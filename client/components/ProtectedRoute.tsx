import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  let authData;

  try {
    authData = useAuth();
  } catch (error) {
    console.error("ProtectedRoute: AuthProvider context not found:", error);
    // Fallback: redirect to login if no auth context
    window.location.href = "/login";
    return (
      <div className="min-h-screen bg-gradient-cyberpunk flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-white text-lg">
            Authentication system error. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  const { isAuthenticated, isAdmin, isLoading } = authData;

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (adminOnly && !isAdmin) {
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isAdmin, adminOnly, isLoading]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-cyberpunk flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

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
