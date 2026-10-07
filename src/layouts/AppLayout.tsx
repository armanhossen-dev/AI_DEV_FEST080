import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import {
  Shield,
  LayoutDashboard,
  Layers,
  BellRing,
  FileSearch,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  CheckCircle,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { ScenarioRunnerModal } from "@/components/simulation/ScenarioRunnerModal";

export const AppLayout: React.FC = () => {
  const { profile, role, logout } = useAuth();
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/transactions", label: "Transactions", icon: Layers },
    { to: "/alerts", label: "Alert Center", icon: BellRing },
    { to: "/investigations", label: "Investigations", icon: FileSearch },
    { to: "/copilot", label: "Sentinel Copilot", icon: Sparkles },
    { to: "/analytics", label: "Risk Analytics", icon: BarChart3 },
    { to: "/settings", label: "System & DB", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-100 shadow-2xl shadow-amber-500/10 text-xs">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Top Demo Mode Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded font-black text-[10px] tracking-widest bg-amber-500 text-slate-950 uppercase">
            DEMO DATA
          </span>
          <span className="font-medium text-slate-300 hidden sm:inline">
            National Hackathon Evaluation Environment • Real Supabase PostgreSQL Connection
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-semibold text-[11px] transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch Attack Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Topbar */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>upay Sentinel</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  AI SOC
                </span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Trust & Risk Intelligence
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Decision Support Engine: <strong className="text-slate-200">Active</strong></span>
          </div>

          {/* User profile dropdown & logout */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">
                {profile?.full_name || "Lead Investigator"}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                {role}
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 border-r border-slate-800/80 bg-[#0B0F19]/50 shrink-0 p-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
            Command Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/5 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-6 mt-auto">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-300">
                <span>Decision Support</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Advisory
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                AI algorithms prioritize and explain risk factors. Human investigators retain final decision authority.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
            <div className="w-64 bg-[#0F172A] border-r border-slate-800 p-4 flex flex-col space-y-2">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-sm font-bold text-amber-400">upay Sentinel Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#080C15] p-4 sm:p-6 lg:p-8">
          <Outlet context={{ showToast: handleToast }} />
        </main>
      </div>

      {/* Live Attack Simulator Modal */}
      <ScenarioRunnerModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onSuccess={handleToast}
      />
    </div>
  );
};
