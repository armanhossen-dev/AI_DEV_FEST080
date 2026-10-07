import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { ShieldAlert } from "lucide-react";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-slate-300">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-amber-500/20 blur-md -z-10 animate-ping" />
        </div>
        <p className="text-sm font-medium text-slate-400">Verifying Sentinel Security Session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
