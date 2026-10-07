"use client";

import React, { useState } from "react";
import { InvestigationCase, NavigationPage, Transaction } from "@/types";
import { evidenceTimelineINV1042 } from "@/lib/data";
import { SentinelAssistant } from "./SentinelAssistant";
import { useSentinel } from "@/context/SentinelContext";
import {
  ChevronRight,
  ShieldAlert,
  Users,
  Activity,
  Share2,
  DollarSign,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  History,
  Lock,
  PauseCircle,
  KeyRound,
} from "lucide-react";

interface InvestigationDetailViewProps {
  caseData?: InvestigationCase;
  onNavigate: (page: NavigationPage) => void;
  onNotify: (msg: string) => void;
}

export const InvestigationDetailView: React.FC<InvestigationDetailViewProps> = ({
  caseData,
  onNavigate,
  onNotify,
}) => {
  const { executeAnalystAction, auditEvents } = useSentinel();
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "audit">("overview");

  const activeCase = caseData || {
    id: "INV-1042",
    riskLevel: "Critical",
    customer: "U-1042",
    amount: 48500,
    reason: "Mule network & Account Takeover",
    analyst: "Arman Hossen",
    status: "Investigating",
    updated: "2 min ago",
    createdTime: "Today at 02:18 AM",
    exposure: 184000,
    transactionsCount: 27,
    networkConnections: 12,
    riskScore: 94,
    summary:
      "Customer U-1042 performed an unusually large transfer of ৳48,500 from a newly registered device DEV-8821 at 02:13 AM. The recipient U-8831 is connected to previously flagged transaction cluster #17.",
    recommendation:
      "Freeze pending outgoing transfers to U-8831, initiate immediate biometric/OTP step-up verification on U-1042 primary device.",
    confidence: 96,
  };

  const caseId = activeCase.id;
  const customer = activeCase.customer;
  const riskScore = activeCase.riskScore;
  const exposure = activeCase.exposure || activeCase.amount * 1.5;

  // Filter audit events relevant to this case
  const caseAuditEvents = auditEvents.filter(
    (e) => e.relatedId === caseId || e.relatedId?.includes(customer) || e.details.includes(customer)
  );

  const handleAction = (
    action: "HOLD" | "STEP_UP" | "RELEASE" | "ESCALATE" | "MARK_SAFE",
    label: string
  ) => {
    executeAnalystAction(caseId, action);
    onNotify(`Action executed: ${label}. Immutable audit record logged.`);
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="case-breadcrumb">
        <span onClick={() => onNavigate("investigations")} className="cursor-pointer hover:underline text-brand-muted hover:text-brand-text">
          Investigations
        </span>
        <ChevronRight size={12} className="text-brand-subtle" />
        <b className="text-brand-text font-mono">{caseId}</b>
      </div>

      {/* Case Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-brand-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            CASE DOSSIER &bull; AUDIT VERIFIED
          </div>
          <h1 className="page-title text-brand-text">Investigation {caseId}</h1>
          <p className="page-subtitle text-brand-muted">
            Opened {activeCase.createdTime} &middot; Last updated {activeCase.updated} by {activeCase.analyst}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`badge text-xs px-2.5 py-0.5 ${
              activeCase.riskLevel === "Critical"
                ? "badge-critical"
                : activeCase.riskLevel === "High"
                ? "badge-high"
                : "badge-medium"
            }`}
          >
            {activeCase.riskLevel.toUpperCase()} PRIORITY
          </span>
          <span className="case-status text-xs">
            <i className={activeCase.status === "Resolved" ? "bg-emerald-400" : "bg-amber-400"} />
            <span className="font-mono text-xs">Status: {activeCase.status}</span>
          </span>
        </div>
      </div>

      {/* Top 5-Item KPI Exposure Grid */}
      <div className="card-base case-summary border border-brand-border">
        <div>
          <div className="summary-icon">
            <Users size={16} />
          </div>
          <span>Customer Wallet</span>
          <b
            onClick={() => onNavigate("customers")}
            className="text-sky-400 hover:underline cursor-pointer font-mono text-sm"
          >
            {customer}
          </b>
        </div>

        <div>
          <div className="summary-icon text-rose-500">
            <ShieldAlert size={16} />
          </div>
          <span>Calculated Risk</span>
          <b className="text-rose-400 font-mono text-sm">{riskScore} / 100</b>
        </div>

        <div>
          <div className="summary-icon text-amber-500">
            <Activity size={16} />
          </div>
          <span>Transaction Count</span>
          <b className="text-brand-text font-mono text-sm">{activeCase.transactionsCount} Txns</b>
        </div>

        <div>
          <div className="summary-icon text-sky-400">
            <Share2 size={16} />
          </div>
          <span>Syndicate Ties</span>
          <b
            onClick={() => onNavigate("network")}
            className="text-sky-400 hover:underline cursor-pointer font-mono text-sm"
          >
            {activeCase.networkConnections} Nodes
          </b>
        </div>

        <div>
          <div className="summary-icon text-emerald-400">
            <DollarSign size={16} />
          </div>
          <span>Capital Exposure</span>
          <b className="text-brand-text font-mono text-sm">৳{exposure.toLocaleString()}</b>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-1 border-b border-brand-border pb-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            activeTab === "overview"
              ? "bg-brand-elevated text-brand-text border border-brand-border"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          Evidence Overview
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            activeTab === "timeline"
              ? "bg-brand-elevated text-brand-text border border-brand-border"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          Incident Telemetry Timeline
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "audit"
              ? "bg-brand-elevated text-brand-text border border-brand-border"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          <History size={12} />
          <span>Audit Trail ({caseAuditEvents.length})</span>
        </button>
      </div>

      {/* Main 2-Column Workstation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column: Dossier Details / Timeline / Audit Tab */}
        <div className="lg:col-span-7 space-y-3.5">
          {activeTab === "overview" && (
            <>
              {/* Executive Summary Card */}
              <div className="card-base p-4 space-y-2 border border-brand-border">
                <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                  <div className="eyebrow text-brand-subtle">EXECUTIVE INCIDENT SUMMARY</div>
                  <span className="text-[11px] text-brand-subtle font-mono">Reason: {activeCase.reason}</span>
                </div>
                <p className="text-xs text-brand-text leading-relaxed">{activeCase.summary}</p>
              </div>

              {/* Multi-Signal Breakdown Card */}
              <div className="card-base p-4 space-y-2.5 border border-brand-border">
                <div className="eyebrow text-brand-subtle pb-2 border-b border-brand-border">
                  STRUCTURED RISK EVIDENCE SIGNALS
                </div>
                <div className="space-y-2">
                  {[
                    {
                      signal: "Transaction Amount Velocity Spike",
                      desc: "Amount is 4.8× above customer 30-day baseline median of ৳6,800.",
                      score: 92,
                    },
                    {
                      signal: "Hardware Fingerprint Mismatch",
                      desc: "Device DEV-8821 first observed 12 minutes prior to transfer with zero wallet pairing history.",
                      score: 78,
                    },
                    {
                      signal: "Topological Mule Cluster Proximity",
                      desc: "Beneficiary wallet U-8831 is an intermediary conduit linked to Mule Syndicate Cluster #17.",
                      score: 91,
                    },
                    {
                      signal: "Nocturnal Dormant Hours Execution",
                      desc: "Executed at 02:13 AM. User has zero historic transactions between 11:30 PM and 7:00 AM.",
                      score: 74,
                    },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border border-brand-border bg-brand-elevated flex items-start justify-between gap-3"
                    >
                      <div>
                        <b className="text-xs text-brand-text block">{s.signal}</b>
                        <p className="text-[11px] text-brand-muted mt-0.5 leading-snug">{s.desc}</p>
                      </div>
                      <span className="badge badge-critical text-[9.5px] shrink-0 font-mono">
                        {s.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "timeline" && (
            <div className="card-base p-4 border border-brand-border">
              <div className="eyebrow text-brand-subtle pb-2.5 border-b border-brand-border">
                CHRONOLOGICAL INCIDENT TELEMETRY
              </div>
              <div className="space-y-3 mt-3">
                {evidenceTimelineINV1042.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2.5 relative pb-2">
                    <span className="text-[10px] text-brand-subtle font-mono w-14 shrink-0 pt-0.5">
                      {ev.time}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        ev.isCritical ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                    <div className="text-xs flex-1">
                      <b className={ev.isCritical ? "text-rose-400 font-semibold" : "text-brand-text"}>
                        {ev.title}
                      </b>
                      <p className="text-brand-muted text-[11px] mt-0.5">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="card-base p-4 space-y-2.5 border border-brand-border">
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <div>
                  <div className="eyebrow text-brand-subtle">IMMUTABLE SESSION AUDIT TRAIL</div>
                  <h3 className="text-xs font-bold text-brand-text uppercase tracking-wide">Human Decision &amp; Action Log</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Tamper-Evident Session Log
                </span>
              </div>

              {caseAuditEvents.length === 0 ? (
                <p className="text-xs text-brand-subtle py-8 text-center">
                  No analyst interventions recorded yet for this case. Use the action bar below to log verified decisions.
                </p>
              ) : (
                <div className="divide-y divide-brand-border">
                  {caseAuditEvents.map((event) => (
                    <div key={event.id} className="py-2 space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-brand-text font-mono">{event.actor}</span>
                        <span className="text-brand-subtle font-mono text-[9.5px]">{event.timestamp}</span>
                      </div>
                      <p className="text-xs text-brand-muted leading-snug">{event.details}</p>
                      <span className="text-[9.5px] font-mono text-brand-subtle block">
                        ID: {event.id} &middot; Type: {event.eventType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Recommended Intervention Banner */}
          <div className="card-base p-3.5 flex items-center justify-between gap-3 border border-brand-border bg-brand-elevated">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-brand-surface text-upay-gold border border-brand-border flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="eyebrow text-upay-gold text-[9.5px]">RECOMMENDED INTERVENTION</div>
                <h4 className="text-xs font-bold text-brand-text">
                  Settlement Quarantine &amp; Biometric Challenge
                </h4>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  {activeCase.recommendation}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-brand-surface text-brand-text text-[10px] font-bold font-mono shrink-0 border border-brand-border">
              {activeCase.confidence}% Confidence
            </span>
          </div>
        </div>

        {/* Right Column: Sentinel Copilot Assistant */}
        <div className="lg:col-span-5">
          <SentinelAssistant
            caseId={caseId}
            customer={customer}
            onNotify={onNotify}
          />
        </div>
      </div>

      {/* Persistent Bottom Action Bar with Human Oversight Safeguards */}
      <div className="action-bar select-none fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-md border-t border-brand-border px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <ShieldAlert size={15} className="text-upay-gold shrink-0" />
          <span>
            <b className="text-brand-text">Human-in-the-Loop Safeguard:</b> High-impact account sanctions require verified analyst confirmation.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction("MARK_SAFE", "Case dismissed as benign / false positive")}
            className="btn btn-secondary text-xs"
          >
            Mark False Positive
          </button>
          <button
            onClick={() => handleAction("STEP_UP", "Biometric step-up challenge dispatched to customer")}
            className="btn btn-secondary text-xs flex items-center gap-1"
          >
            <KeyRound size={12} />
            <span>Request Biometric 2FA</span>
          </button>
          <button
            onClick={() => handleAction("HOLD", "Outgoing settlement hold placed on recipient")}
            className="btn text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 flex items-center gap-1"
          >
            <PauseCircle size={13} />
            <span>Hold Settlement</span>
          </button>
          <button
            onClick={() => handleAction("ESCALATE", "Escalated to AML & Regulatory Committee")}
            className="btn btn-danger text-xs flex items-center gap-1"
          >
            <AlertTriangle size={13} />
            <span>Escalate Case</span>
          </button>
          <button
            onClick={() => handleAction("RELEASE", "Case finalized and resolved")}
            className="btn btn-primary text-xs flex items-center gap-1"
          >
            <CheckCircle2 size={13} />
            <span>Close Case</span>
          </button>
        </div>
      </div>
    </div>
  );
};
