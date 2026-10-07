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
          <div className="eyebrow">CUSTOMER 360 & BEHAVIORAL PROFILING</div>
          <h1 className="page-title">Customer Intelligence</h1>
          <p className="page-subtitle">
            Longitudinal behavioral baselines, deviation anomalies, and risk profile for customer {customer.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge badge-high text-xs px-2.5 py-1">HIGH RISK PROFILE</span>
          <button
            onClick={() => onNavigate("investigation")}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <span>Open Case INV-1042</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="grid grid-cols-12 gap-4">
        {/* Profile Card */}
        <div className="col-span-5 card-base customer-profile p-5 flex items-center gap-4">
          <div className="customer-avatar text-xl font-bold">U</div>
          <div className="flex-1">
            <div className="eyebrow">VERIFIED MFS WALLET</div>
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            <div className="text-xs text-gray-500 mt-0.5">
              <span>{customer.id}</span> · <span>{customer.phone}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="badge badge-low text-[10px] flex items-center gap-1">
                <CheckCircle2 size={11} /> KYC Verified
              </span>
              <span className="text-[11px] text-gray-400">Since March 2022</span>
            </div>
          </div>

          <div className="risk-customer pl-4 border-l border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">
              Risk Score
            </span>
            <b className="text-2xl text-amber-600 block mt-0.5">{customer.riskScore}</b>
            <span className="text-[9.5px] text-gray-400">/ 100</span>
          </div>
        </div>

        {/* 5 Stats Grid */}
        <div className="col-span-7 card-base profile-stats p-4 grid grid-cols-5 divide-x divide-gray-100 text-center">
          <div className="px-2">
            <span className="text-[11px] text-gray-400 font-medium block">Account Age</span>
            <b className="text-sm font-bold text-gray-900 block mt-1">{customer.accountAge}</b>
          </div>
          <div className="px-2">
            <span className="text-[11px] text-gray-400 font-medium block">30d Volume</span>
            <b className="text-sm font-bold text-gray-900 block mt-1">৳1.42M</b>
          </div>
          <div className="px-2">
            <span className="text-[11px] text-gray-400 font-medium block">Avg Transfer</span>
            <b className="text-sm font-bold text-gray-900 block mt-1">৳6,800</b>
          </div>
          <div className="px-2">
            <span className="text-[11px] text-gray-400 font-medium block">Known Devices</span>
            <b className="text-sm font-bold text-gray-900 block mt-1">2 Devices</b>
          </div>
          <div className="px-2">
            <span className="text-[11px] text-gray-400 font-medium block">Known Hubs</span>
            <b className="text-sm font-bold text-gray-900 block mt-1">3 Locations</b>
          </div>
        </div>
      </div>

      {/* Baseline vs Deviations Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Behavioral Baseline (90 days) */}
        <div className="col-span-6 card-base p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Behavioral Baseline</h2>
              <p className="text-xs text-gray-500">
                Machine-learned habit profile over previous 90 days
              </p>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
              90-DAY WINDOW
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <CreditCard size={14} className="text-emerald-700" />
                Average Transaction
              </span>
              <b className="text-base font-bold text-gray-900 mt-1 block">৳6,800 BDT</b>
              <span className="text-[10px] text-gray-400">Std deviation ±৳2,100</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-700" />
                Active Hours
              </span>
              <b className="text-base font-bold text-gray-900 mt-1 block">
                10:00 AM – 09:00 PM
              </b>
              <span className="text-[10px] text-gray-400">0% historic activity past 11 PM</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <Smartphone size={14} className="text-emerald-700" />
                Trusted Hardware
              </span>
              <b className="text-base font-bold text-gray-900 mt-1 block">
                DEV-2211 (iPhone)
              </b>
              <span className="text-[10px] text-gray-400">Paired since Nov 2023</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-700" />
                Primary Location
              </span>
              <b className="text-base font-bold text-gray-900 mt-1 block">Gulshan, Dhaka</b>
              <span className="text-[10px] text-gray-400">Base cell tower ID #4092</span>
            </div>
          </div>
        </div>

        {/* Right: Recent Deviations */}
        <div className="col-span-6 card-base p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Recent Behavioral Deviations</h2>
              <p className="text-xs text-gray-500">
                Significant vector departures detected by Isolation Forest
              </p>
            </div>
            <span className="badge badge-high text-[10px]">3 ANOMALIES</span>
          </div>

          <div className="divide-y divide-gray-100 mt-2">
            {customer.recentDeviations.map((dev: any, i: number) => (
              <div key={i} className="py-3 flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    dev.severity === "Critical"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  !
                </div>
                <div className="flex-1 text-xs">
                  <b className="text-gray-900 block">{dev.title}</b>
                  <p className="text-gray-600">{dev.value}</p>
                  <span className="text-[10px] text-gray-400 font-mono">
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

      {/* 30-Day Transaction Timeline Chart */}
      <div className="card-base transaction-timeline p-5">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">30-Day Transaction Timeline</h2>
            <p className="text-xs text-gray-500">
              Daily transaction volume highlighting recent anomalous surge on Day 28–30
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#96d7ba]" /> Normal Daily Volume
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc3f4d]" /> Flagged Anomaly Surge
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bar-chart h-36 flex items-end gap-1.5 pt-4">
          {volumeData.map((h, i) => {
            const isFlagged = i >= 27;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none transition-opacity font-mono z-10 whitespace-nowrap">
                  Day {i + 1}: ৳{(h * 500).toLocaleString()}
                </div>
                <div
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t-xs transition-all ${
                    isFlagged
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-[#8bd4b5] hover:bg-[#68c69f]"
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-2 border-t border-gray-100">
          <span>Day 1 (30 days ago)</span>
          <span>Day 10</span>
          <span>Day 20</span>
          <span className="text-rose-600 font-bold">Day 28–30 (Current Anomaly)</span>
        </div>
      </div>
    </div>
  );
};
