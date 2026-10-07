import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Briefcase } from "lucide-react";
import { UserRole } from "@/types";

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("investigator");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setLocalError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLocalError(null);
      setIsSubmitting(true);
      await registerWithEmail(email, password, fullName, role);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setLocalError(err.message || "Failed to register account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C15] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Shield className="w-7 h-7 text-amber-400" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
          Investigator Registration
        </h2>
        <p className="mt-1 text-center text-xs tracking-wider uppercase text-amber-400 font-semibold">
          upay Sentinel Access Control
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#0F172A]/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800/80">
          {localError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">{localError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Mahmud"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@upay.com.bd"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Operational Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="h-4 w-4" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-colors"
                >
                  <option value="investigator">Fraud Investigator (Default)</option>
                  <option value="analyst">Risk & Intelligence Analyst</option>
                  <option value="admin">Operations Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin mr-2">⟳</span>
              ) : (
                <>
                  <span>Create Account & Enter Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have credentials?{" "}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
