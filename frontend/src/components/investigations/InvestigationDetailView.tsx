"use client";

import React, { useState } from "react";
import { InvestigationCase, NavigationPage, Transaction } from "@/types";
import { evidenceTimelineINV1042 } from "@/lib/data";
import { SentinelAssistant } from "./SentinelAssistant";
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
  const [activeTab, setActiveTab] = useState<string>("overview");

  const caseId = caseData?.id || "INV-1042";
  const customer = caseData?.customer || "U-1042";
  const riskScore = caseData?.riskScore || 94;
  const exposure = caseData?.exposure || 184000;

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="case-breadcrumb">
        <span onClick={() => onNavigate("investigations")}>Investigations</span>
        <ChevronRight size={13} />
        <b>{caseId}</b>
      </div>

      {/* Case Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">CASE DOSSIER</div>
          <h1 className="page-title">Investigation {caseId}</h1>
          <p className="page-subtitle">
            Created today at 02:18 AM · Last updated 2 minutes ago by Arman Hossen
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="badge badge-critical text-xs px-2.5 py-1">CRITICAL</span>
          <span className="case-status text-xs">
            <i />
            <span>Under Active Investigation</span>
          </span>
        </div>
      </div>

      {/* Top 5-Item KPI Exposure Grid */}
      <div className="card-base case-summary">
        <div>
          <div className="summary-icon">
            <Users size={18} />
          </div>
          <span>Customer Wallet</span>
          <b
            onClick={() => onNavigate("customers")}
            className="text-emerald-800 hover:underline cursor-pointer"
          >
            {customer}
          </b>
        </div>

        <div>
          <div className="summary-icon si1">
            <ShieldAlert size={18} />
          </div>
          <span>Risk Score</span>
          <b className="text-rose-600">{riskScore} / 100</b>
        </div>

        <div>
          <div className="summary-icon">
            <Activity size={18} />
          </div>
          <span>Transactions</span>
          <b className="text-ink">27</b>
        </div>

        <div>
          <div className="summary-icon">
            <Share2 size={18} />
          </div>
          <span>Network Connections</span>
          <b
            onClick={() => onNavigate("network")}
            className="text-emerald-800 hover:underline cursor-pointer"
          >
            12 Entities
          </b>
        </div>

        <div>
          <div className="summary-icon">
            <DollarSign size={18} />
          </div>
          <span>Potential Exposure</span>
          <b className="text-ink">৳{exposure.toLocaleString()}</b>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs case-tabs">
        {[
          { id: "overview", label: "Overview & Evidence" },
          { id: "transactions", label: "Linked Transactions (27)" },
          { id: "network", label: "Cluster Graph" },
          { id: "audit", label: "Audit Log & SAR" },
        ].map((tab) => (
          <div
            key={tab.id}
            onClick={() => {
              if (tab.id === "network") onNavigate("network");
              else if (tab.id === "transactions") onNavigate("transactions");
              else setActiveTab(tab.id);
            }}
            className={activeTab === tab.id ? "active" : ""}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Main Workspace Layout (Left: Evidence & Timeline, Right: Sentinel AI Assistant) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column (Evidence and Timeline) */}
        <div className="col-span-7 space-y-4">
          {/* AI Investigation Summary Card */}
          <div className="card-base case-overview p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="text-sm font-bold text-ink">
                AI Automated Investigation Summary
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                <Sparkles size={11} /> AI GENERATED
              </span>
            </div>

            <p className="text-xs text-ink leading-relaxed mt-3">
              Customer <b>{customer}</b> performed an unusually large transfer of{" "}
              <b>৳48,500</b> from newly registered device <b>DEV-8821</b> at 02:13 AM.
              The recipient <b>U-8831</b> is topologically connected to previously flagged
              transaction <b>Cluster #17</b>. Multi-vector behavioral and network signals indicate
              high probability of account takeover and illicit money-mule layering.
            </p>

            <div className="summary-sources mt-3 pt-3 border-t border-line">
              <span>Grounded in telemetry:</span>
              <b>27 historical transactions</b>
              <b>3 distinct devices</b>
              <b>12 graph relationships</b>
            </div>
          </div>

          {/* Chronological Evidence Timeline Card */}
          <div className="card-base timeline-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h2 className="text-sm font-bold text-ink">Evidence Timeline</h2>
                <p className="text-xs text-subtle">
                  Chronological progression of risk markers
                </p>
              </div>
              <span className="text-[11px] font-mono text-subtle">
                UTC+6 / Dhaka Time
              </span>
            </div>

            <div className="evidence-timeline mt-4 space-y-2">
              {evidenceTimelineINV1042.map((ev, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-2 rounded-lg ${
                    ev.isCritical ? "bg-rose-50/70 border border-rose-100" : ""
                  }`}
                >
                  <span className="text-[11px] text-subtle font-mono w-16 shrink-0 pt-0.5">
                    {ev.time}
                  </span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                      ev.isCritical ? "bg-rose-600 ring-2 ring-rose-200" : "bg-emerald-500"
                    }`}
                  />
                  <div className="text-xs flex-1">
                    <b className={ev.isCritical ? "text-rose-900" : "text-ink"}>
                      {ev.title}
                    </b>
                    <p className="text-muted mt-0.5">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="card-base ai-recommend p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="eyebrow text-emerald-800">RECOMMENDED INTERVENTION</div>
                <h4 className="text-xs font-bold text-ink">
                  Manual Verification & Recipient Settlement Hold
                </h4>
                <p className="text-xs text-muted">
                  Verify customer identity via outbound biometric challenge and freeze recipient
                  wallet U-8831.
                </p>
              </div>
            </div>
            <span className="confidence-pill text-xs font-bold shrink-0">
              93% Confidence
            </span>
          </div>
        </div>

        {/* Right Column: Sentinel AI Investigation Assistant */}
        <div className="col-span-5">
          <SentinelAssistant
            caseId={caseId}
            customer={customer}
            onNotify={onNotify}
          />
        </div>
      </div>

      {/* Persistent Bottom Action Bar */}
      <div className="action-bar select-none">
        <div className="flex items-center gap-2 text-xs text-muted">
          <ShieldAlert size={16} className="text-amber-600" />
          <span>
            <b>Human Oversight Required:</b> High-impact account sanctions require analyst confirmation.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNotify("Case marked as False Positive. Ingested into negative training set.")}
            className="btn btn-secondary text-xs"
          >
            Mark False Positive
          </button>
          <button
            onClick={() => onNotify("Biometric step-up challenge sent to customer U-1042 registered phone.")}
            className="btn btn-secondary text-xs"
          >
            Request Verification
          </button>
          <button
            onClick={() => onNotify("Case escalated to Senior Risk Committee & Legal.")}
            className="btn btn-danger text-xs flex items-center gap-1.5"
          >
            <AlertTriangle size={14} />
            <span>Escalate Case</span>
          </button>
          <button
            onClick={() => onNotify(`Investigation ${caseId} marked as RESOLVED. Audit report logged.`)}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <CheckCircle2 size={14} />
            <span>Close Case</span>
          </button>
        </div>
      </div>
    </div>
  );
};
