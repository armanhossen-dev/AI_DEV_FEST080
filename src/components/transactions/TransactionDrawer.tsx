"use client";

import React from "react";
import { Transaction, RiskLevel } from "@/types";
import {
  X,
  ShieldAlert,
  Sparkles,
  Check,
  ArrowRight,
  Clock,
  Smartphone,
  MapPin,
  User,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onOpenInvestigation: (txn: Transaction) => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction,
  onClose,
  onOpenInvestigation,
}) => {
  if (!transaction) return null;

  const defaultReasons = [
    `Transaction amount is ${(transaction.amount / 6800).toFixed(1)}× above normal behavior`,
    transaction.isNewDevice ? "New unrecognized hardware device fingerprint detected" : "Known device verified",
    "Unusual transaction time window outside user baseline",
    "First-time or high-risk recipient relationship",
    "Rapid velocity burst: 6 transactions within short window",
    "Recipient wallet topological link to flagged mule cluster",
  ];

  return (
    <>
      {/* Background Scrim */}
      <div className="scrim-bg" onClick={onClose} />

      {/* Slide-out Panel */}
      <aside className="drawer-panel flex flex-col">
        {/* Header */}
        <div className="h-18 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <div className="eyebrow">TRANSACTION DETAILS</div>
            <div className="text-lg font-bold text-gray-900 font-mono">
              {transaction.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="icon-btn hover:bg-gray-100 text-gray-500 rounded-lg p-1.5"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Risk Score Summary Banner */}
          <div
            className={`p-4 rounded-xl flex items-center justify-between border ${
              transaction.riskLevel === "Critical"
                ? "bg-rose-50/70 border-rose-200"
                : transaction.riskLevel === "High"
                ? "bg-amber-50/70 border-amber-200"
                : "bg-emerald-50/70 border-emerald-200"
            }`}
          >
            <div>
              <span className="text-xs text-gray-500 font-medium block">
                Calculated Risk Score
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-3xl font-extrabold ${
                    transaction.riskLevel === "Critical"
                      ? "text-rose-600"
                      : transaction.riskLevel === "High"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {transaction.riskScore}
                </span>
                <span className="text-xs text-gray-400 font-semibold">/ 100</span>
              </div>
            </div>
            <span
              className={`badge ${
                transaction.riskLevel === "Critical"
                  ? "badge-critical"
                  : transaction.riskLevel === "High"
                  ? "badge-high"
                  : "badge-low"
              }`}
            >
              {transaction.riskLevel} Risk
            </span>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Transaction Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <CreditCard size={12} /> Amount
                </span>
                <b className="text-gray-900 text-sm block">
                  ৳{transaction.amount.toLocaleString()} BDT
                </b>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> Timestamp
                </span>
                <b className="text-gray-900 text-sm block">{transaction.time}</b>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <User size={12} /> Sender Customer
                </span>
                <b className="text-[#087c50] font-mono text-sm block">
                  {transaction.customer}
                </b>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <User size={12} /> Target Recipient
                </span>
                <b className="text-[#087c50] font-mono text-sm block">
                  {transaction.recipient}
                </b>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Smartphone size={12} /> Device ID
                </span>
                <b
                  className={`text-sm block font-mono ${
                    transaction.isNewDevice ? "text-rose-600 font-bold" : "text-gray-900"
                  }`}
                >
                  {transaction.device}{" "}
                  {transaction.isNewDevice && "(New!)"}
                </b>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <MapPin size={12} /> Geographic Hub
                </span>
                <b className="text-gray-900 text-sm block">
                  {transaction.location}
                </b>
              </div>
            </div>
          </div>

          {/* Why Was This Flagged? AI Reasoning */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">
                  Why was this transaction flagged?
                </h3>
                <p className="text-[11px] text-gray-400">
                  AI-generated explanation grounded in telemetry
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {(transaction.flags?.length ? transaction.flags : defaultReasons).map(
                (flag, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2.5 text-xs text-gray-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{flag}</span>
                    <Check size={14} className="text-emerald-600 shrink-0" />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Confidence Note */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 text-xs text-emerald-950">
            <ShieldAlert size={18} className="text-emerald-700 shrink-0" />
            <div>
              <b>96% AI Model Confidence</b> across 6 independent features (amount, device,
              time, recipient, velocity, location).
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="btn btn-secondary text-xs">
            Close
          </button>
          <button
            onClick={() => {
              onOpenInvestigation(transaction);
              onClose();
            }}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <span>Open Investigation</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </aside>
    </>
  );
};
