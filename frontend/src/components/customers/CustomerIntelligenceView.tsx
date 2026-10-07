"use client";

import React from "react";
import { NavigationPage } from "@/types";
import { customerU1042 } from "@/lib/data";
import {
  User,
  ShieldAlert,
  Smartphone,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  ArrowRight,
} from "lucide-react";

interface CustomerIntelligenceViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenCase: (caseId: string) => void;
}

export const CustomerIntelligenceView: React.FC<CustomerIntelligenceViewProps> = ({
  onNavigate,
  onOpenCase,
}) => {
  const customer = customerU1042;

  // 30 days transaction volume bars
  const volumeData = [
    22, 30, 18, 38, 45, 25, 32, 28, 48, 35, 20, 24, 30, 40, 27, 31, 42, 22, 34,
    38, 29, 45, 32, 21, 28, 40, 35, 88, 54, 96,
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-brand-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            CUSTOMER 360 &bull; LONGITUDINAL BEHAVIORAL PROFILING
          </div>
          <h1 className="page-title text-brand-text">Customer Risk Dossier</h1>
          <p className="page-subtitle text-brand-muted">
            90-day behavioral baselines, deviation anomalies, and hardware pairing history for wallet {customer.id}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="badge badge-high text-xs px-2.5 py-0.5">HIGH RISK PROFILE</span>
          <button
            onClick={() => onNavigate("investigation")}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <span>Open Case INV-1042</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Profile Card */}
        <div className="lg:col-span-5 card-base p-4 flex items-center gap-3.5 border border-brand-border bg-brand-surface">
          <div className="w-11 h-11 rounded bg-brand-elevated text-upay-gold border border-brand-border flex items-center justify-center font-bold text-lg shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="eyebrow text-brand-subtle text-[9.5px]">VERIFIED MFS ACCOUNT</div>
            <h2 className="text-base font-bold text-brand-text truncate">{customer.name}</h2>
            <div className="text-xs text-brand-muted mt-0.5 font-mono">
              <span>{customer.id}</span> &middot; <span>{customer.phone}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="badge badge-low text-[9px] flex items-center gap-1">
                <CheckCircle2 size={10} /> KYC Verified
              </span>
              <span className="text-[10.5px] text-brand-subtle">Since March 2022</span>
            </div>
          </div>

          <div className="pl-3.5 border-l border-brand-border text-center shrink-0">
            <span className="text-[9.5px] text-brand-subtle uppercase font-mono font-semibold">
              Risk Score
            </span>
            <b className="text-xl text-rose-400 block mt-0.5 font-mono">{customer.riskScore}</b>
            <span className="text-[9.5px] text-brand-subtle font-mono">/ 100</span>
          </div>
        </div>

        {/* 5 Stats Grid */}
        <div className="lg:col-span-7 card-base p-3 grid grid-cols-5 divide-x divide-brand-border text-center border border-brand-border bg-brand-surface">
          <div className="px-2">
            <span className="text-[10.5px] text-brand-muted font-medium block">Account Age</span>
            <b className="text-xs font-bold text-brand-text block mt-1 font-mono">{customer.accountAge}</b>
          </div>
          <div className="px-2">
            <span className="text-[10.5px] text-brand-muted font-medium block">30d Volume</span>
            <b className="text-xs font-bold text-brand-text block mt-1 font-mono">৳1.42M</b>
          </div>
          <div className="px-2">
            <span className="text-[10.5px] text-brand-muted font-medium block">Avg Transfer</span>
            <b className="text-xs font-bold text-brand-text block mt-1 font-mono">৳6,800</b>
          </div>
          <div className="px-2">
            <span className="text-[10.5px] text-brand-muted font-medium block">Known Devices</span>
            <b className="text-xs font-bold text-brand-text block mt-1 font-mono">2 Devices</b>
          </div>
          <div className="px-2">
            <span className="text-[10.5px] text-brand-muted font-medium block">Known Hubs</span>
            <b className="text-xs font-bold text-brand-text block mt-1 font-mono">3 Locations</b>
          </div>
        </div>
      </div>

      {/* Baseline vs Deviations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Behavioral Baseline (90 days) */}
        <div className="lg:col-span-6 card-base p-4 border border-brand-border bg-brand-surface">
          <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
            <div>
              <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                Behavioral Baseline (90 Days)
              </h2>
              <p className="text-[11px] text-brand-muted">
                Trained distribution profile across habit vectors
              </p>
            </div>
            <span className="text-[9.5px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-semibold">
              90-DAY WINDOW
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            <div className="p-2.5 bg-brand-elevated rounded border border-brand-border">
              <span className="text-brand-subtle text-xs flex items-center gap-1.5">
                <CreditCard size={13} className="text-upay-gold" />
                Average Transaction
              </span>
              <b className="text-sm font-bold text-brand-text mt-1 block font-mono">৳6,800 BDT</b>
              <span className="text-[10px] text-brand-subtle font-mono">Std dev &plusmn;৳2,100</span>
            </div>

            <div className="p-2.5 bg-brand-elevated rounded border border-brand-border">
              <span className="text-brand-subtle text-xs flex items-center gap-1.5">
                <Clock size={13} className="text-upay-gold" />
                Active Hours
              </span>
              <b className="text-sm font-bold text-brand-text mt-1 block font-mono">
                10:00 AM – 09:00 PM
              </b>
              <span className="text-[10px] text-brand-subtle font-mono">0% historic activity past 11 PM</span>
            </div>

            <div className="p-2.5 bg-brand-elevated rounded border border-brand-border">
              <span className="text-brand-subtle text-xs flex items-center gap-1.5">
                <Smartphone size={13} className="text-upay-gold" />
                Trusted Hardware
              </span>
              <b className="text-sm font-bold text-brand-text mt-1 block font-mono">
                DEV-2211 (iPhone)
              </b>
              <span className="text-[10px] text-brand-subtle font-mono">Paired since Nov 2023</span>
            </div>

            <div className="p-2.5 bg-brand-elevated rounded border border-brand-border">
              <span className="text-brand-subtle text-xs flex items-center gap-1.5">
                <MapPin size={13} className="text-upay-gold" />
                Primary Location
              </span>
              <b className="text-sm font-bold text-brand-text mt-1 block">Gulshan, Dhaka</b>
              <span className="text-[10px] text-brand-subtle font-mono">Base cell tower ID #4092</span>
            </div>
          </div>
        </div>

        {/* Right: Recent Deviations */}
        <div className="lg:col-span-6 card-base p-4 border border-brand-border bg-brand-surface">
          <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
            <div>
              <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                Recent Behavioral Departures
              </h2>
              <p className="text-[11px] text-brand-muted">
                Statistically significant deviations detected by Isolation Forest
              </p>
            </div>
            <span className="badge badge-high text-[9.5px]">3 ANOMALIES</span>
          </div>

          <div className="divide-y divide-brand-border mt-1">
            {customer.recentDeviations.map((dev, i) => (
              <div key={i} className="py-2.5 flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                    dev.severity === "Critical"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                  }`}
                >
                  !
                </div>
                <div className="flex-1 text-xs">
                  <b className="text-brand-text block">{dev.title}</b>
                  <p className="text-brand-muted text-[11.5px]">{dev.value}</p>
                  <span className="text-[10px] text-brand-subtle font-mono">
                    {dev.timestamp}
                  </span>
                </div>
                <span
                  className={`badge ${
                    dev.severity === "Critical" ? "badge-critical" : "badge-high"
                  }`}
                >
                  {dev.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 30-Day Transaction Volume Timeline */}
      <div className="card-base p-4 border border-brand-border bg-brand-surface">
        <div className="flex items-center justify-between pb-2 border-b border-brand-border">
          <div>
            <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
              30-Day Transaction Volume Timeline
            </h2>
            <p className="text-[11px] text-brand-muted">
              Daily transaction volume highlighting recent anomalous surge on Day 28–30
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-brand-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal Daily Volume
            </span>
            <span className="flex items-center gap-1.5 text-brand-muted">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Flagged Anomaly Surge
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-32 flex items-end gap-1 pt-4">
          {volumeData.map((h, i) => {
            const isFlagged = i >= 27;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-brand-elevated border border-brand-border text-brand-text text-[9.5px] py-0.5 px-1.5 rounded pointer-events-none transition-opacity font-mono z-10 whitespace-nowrap shadow-md">
                  Day {i + 1}: ৳{(h * 500).toLocaleString()}
                </div>
                <div
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t-xs transition-all ${
                    isFlagged
                      ? "bg-rose-500/80 hover:bg-rose-500"
                      : "bg-emerald-500/60 hover:bg-emerald-500/80"
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[9.5px] text-brand-subtle font-mono pt-2 border-t border-brand-border">
          <span>Day 1 (30 days ago)</span>
          <span>Day 10</span>
          <span>Day 20</span>
          <span className="text-rose-400 font-bold">Day 28–30 (Current Anomaly)</span>
        </div>
      </div>
    </div>
  );
};
