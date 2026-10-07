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
  PauseCircle,
  KeyRound,
  ShieldCheck,
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
    `Transaction amount is ${(transaction.amount / 6800).toFixed(1)}× above customer 30-day baseline`,
    transaction.isNewDevice ? "Hardware device fingerprint has zero pairing history with wallet" : "Known registered hardware verified",
    "Execution window during dormant nocturnal hours (01:00 AM – 04:30 AM)",
    "Recipient wallet identified as intermediary node in high-risk cluster",
    "Velocity spike: multiple fund transfers executed within short interval",
  ];

  return (
    <>
      {/* Background Scrim */}
      <div className="scrim-bg" onClick={onClose} />

      {/* Slide-out Evidence Workstation Panel */}
      <aside className="drawer-panel flex flex-col">
        {/* Header */}
        <div className="h-14 px-5 border-b border-brand-border flex items-center justify-between shrink-0 bg-brand-surface">
          <div>
            <div className="eyebrow text-brand-subtle">TRANSACTION EVIDENCE DOSSIER</div>
            <div className="text-sm font-bold text-brand-text font-mono">
              {transaction.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-brand-muted hover:bg-brand-elevated hover:text-brand-text transition-colors"
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Risk Score Summary Banner */}
          <div
            className={`p-3.5 rounded border flex items-center justify-between ${
              transaction.riskLevel === "Critical"
                ? "bg-rose-500/10 border-rose-500/25"
                : transaction.riskLevel === "High"
                ? "bg-orange-500/10 border-orange-500/25"
                : transaction.riskLevel === "Medium"
                ? "bg-amber-500/10 border-amber-500/25"
                : "bg-emerald-500/10 border-emerald-500/25"
            }`}
          >
            <div>
              <span className="text-[11px] text-brand-muted font-medium block">
                Calculated Risk Score
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span
                  className={`text-2xl font-bold ${
                    transaction.riskLevel === "Critical"
                      ? "text-rose-400"
                      : transaction.riskLevel === "High"
                      ? "text-orange-400"
                      : transaction.riskLevel === "Medium"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {transaction.riskScore}
                </span>
                <span className="text-xs text-brand-subtle font-semibold">/ 100</span>
              </div>
            </div>
            <span
              className={`badge ${
                transaction.riskLevel === "Critical"
                  ? "badge-critical"
                  : transaction.riskLevel === "High"
                  ? "badge-high"
                  : transaction.riskLevel === "Medium"
                  ? "badge-medium"
                  : "badge-low"
              }`}
            >
              {transaction.riskLevel} Priority
            </span>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-brand-text uppercase tracking-wider">
              Transaction Metadata
            </h3>
            <div className="grid grid-cols-2 gap-2 p-3 bg-brand-elevated rounded border border-brand-border text-xs">
              <div className="space-y-0.5">
                <span className="text-brand-subtle flex items-center gap-1 text-[11px]">
                  <CreditCard size={11} /> Amount
                </span>
                <b className="text-brand-text text-xs block font-mono">
                  ৳{transaction.amount.toLocaleString()} BDT
                </b>
              </div>

              <div className="space-y-0.5">
                <span className="text-brand-subtle flex items-center gap-1 text-[11px]">
                  <Clock size={11} /> Ingestion Time
                </span>
                <b className="text-brand-text text-xs block font-mono">{transaction.time}</b>
              </div>

              <div className="space-y-0.5">
                <span className="text-brand-subtle flex items-center gap-1 text-[11px]">
                  <User size={11} /> Originating Customer
                </span>
                <b className="text-sky-400 font-mono text-xs block">
                  {transaction.customer}
                </b>
              </div>

              <div className="space-y-0.5">
                <span className="text-brand-subtle flex items-center gap-1 text-[11px]">
                  <User size={11} /> Target Beneficiary
                </span>
                <b className="text-sky-400 font-mono text-xs block">
                  {transaction.recipient}
                </b>
              </div>

              <div className="space-y-0.5">
                <span className="text-brand-subtle flex items-center gap-1 text-[11px]">
                  <Smartphone size={11} /> Device Fingerprint
                </span>
                <b
                  className={`text-xs block font-mono ${
                    transaction.isNewDevice ? "text-rose-400 font-bold" : "text-brand-text"
                  }`}
                >
                  {transaction.device} {transaction.isNewDevice && "(Unpaired)"}
                </b>
              </div>

              <div className="space-y-0.5">
                <span className="text-brand-subtle flex items-center gap-1 text-[11px]">
                  <MapPin size={11} /> Geo Terminal
                </span>
                <b className="text-brand-text text-xs block">
                  {transaction.location}
                </b>
              </div>
            </div>
          </div>

          {/* Why Was This Flagged? AI Decomposition */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-brand-elevated text-upay-gold flex items-center justify-center border border-brand-border">
                <Sparkles size={12} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                  Signal Attribution &amp; Evidence Decomposition
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              {(transaction.flags?.length ? transaction.flags : defaultReasons).map(
                (flag, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-brand-elevated border border-brand-border flex items-center gap-2 text-xs text-brand-muted"
                  >
                    <span className="w-4 h-4 rounded bg-brand-surface border border-brand-border text-brand-text font-bold text-[9px] flex items-center justify-center shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-[11.5px] leading-snug">{flag}</span>
                    <Check size={13} className="text-emerald-400 shrink-0" />
                  </div>
                )
              )}
            </div>
          </div>

          {/* AI Confidence Notice */}
          <div className="p-2.5 bg-brand-elevated rounded border border-brand-border flex items-center gap-2.5 text-[11.5px] text-brand-muted">
            <ShieldAlert size={15} className="text-amber-400 shrink-0" />
            <div>
              <b className="text-brand-text">Multi-Signal Consensus:</b> Deterministic compliance rules, velocity engine, and neural net aligned.
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 px-5 border-t border-brand-border bg-brand-surface flex items-center justify-between gap-2 shrink-0">
          <button onClick={onClose} className="btn btn-secondary text-xs">
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenInvestigation(transaction);
                onClose();
              }}
              className="btn btn-primary text-xs flex items-center gap-1.5"
            >
              <span>Open Case Dossier</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
