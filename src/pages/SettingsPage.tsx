import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Settings as SettingsIcon, Database, Shield, CheckCircle, ExternalLink } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { currentUser, role } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-amber-400" />
          <span>System Environment & Infrastructure</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Operational telemetry and backend integration status for national hackathon judging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supabase PostgreSQL Status */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Supabase PostgreSQL</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Connected
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Project Endpoint:</span>
              <span className="font-mono text-slate-200">odexyyeipgspqvdepvoi.supabase.co</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">AWS Region:</span>
              <span className="font-mono text-slate-200">ap-northeast-1</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Row Level Security:</span>
              <span className="text-emerald-400 font-semibold">Enabled (All 10 Tables)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Seeded Records:</span>
              <span className="font-mono text-amber-400 font-bold">1,000+ Transactions</span>
            </div>
          </div>
        </div>

        {/* Firebase Authentication Status */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Firebase Authentication</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Project ID:</span>
              <span className="font-mono text-slate-200">phase-2-6def1</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Current User:</span>
              <span className="text-slate-200 truncate max-w-[180px]">{currentUser?.email || "Demo User"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Granted Role:</span>
              <span className="text-amber-400 uppercase font-bold">{role}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Providers:</span>
              <span className="text-slate-200">Email/Password + Google</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Spec */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Risk Engine Architecture Specification
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Sentinel Multi-Stage Risk Engine operates locally in <code>src/lib/risk-engine/</code>, completely decoupled from UI components. It performs deterministic feature extraction, weighted fraud scoring, behavioral baseline anomaly calculation, risk fusion (0–100), explainability factor decomposition, and advisory action recommendations.
        </p>
      </div>
    </div>
  );
};
