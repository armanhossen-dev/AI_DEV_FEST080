"use client";

import React, { useState } from "react";
import { InvestigationCase, RiskLevel } from "@/types";
import { useSentinel } from "@/context/SentinelContext";
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  ChevronRight,
  MoreVertical,
  Clock,
  User,
  ShieldAlert,
} from "lucide-react";

interface InvestigationsViewProps {
  onSelectCase: (caseItem: InvestigationCase) => void;
  onNewCaseModal: () => void;
}

export const InvestigationsView: React.FC<InvestigationsViewProps> = ({
  onSelectCase,
  onNewCaseModal,
}) => {
  const { cases } = useSentinel();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.toLowerCase().includes(search.toLowerCase()) ||
      c.reason.toLowerCase().includes(search.toLowerCase()) ||
      c.analyst.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "critical") return matchesSearch && c.riskLevel === "Critical";
    if (activeTab === "high") return matchesSearch && c.riskLevel === "High";
    if (activeTab === "assigned") return matchesSearch && c.analyst.includes("Arman");
    if (activeTab === "resolved") return matchesSearch && c.status === "Resolved";
    return matchesSearch;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-brand-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            CASE WORKSTATION &bull; REGULATORY COMPLIANCE AUDIT
          </div>
          <h1 className="page-title text-brand-text">Fraud Case Dossiers</h1>
          <p className="page-subtitle text-brand-muted">
            Triage flagged cases, inspect AI evidence packages, and execute verified sanctions with tamper-evident audit logging.
          </p>
        </div>
        <button
          onClick={onNewCaseModal}
          className="btn btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>+ New Investigation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { id: "all", label: `All Open Cases (${cases.length})` },
          { id: "critical", label: `Critical Priority (${cases.filter(c => c.riskLevel === "Critical").length})` },
          { id: "high", label: `High Risk (${cases.filter(c => c.riskLevel === "High").length})` },
          { id: "assigned", label: "Assigned to Me" },
          { id: "resolved", label: "Resolved / Safe" },
        ].map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "active" : ""}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card-base table-card">
        {/* Meta & Filters */}
        <div className="table-meta">
          <div className="field w-80">
            <Search size={13} className="text-brand-subtle shrink-0" />
            <input
              type="text"
              placeholder="Search case ID, wallet, reason, or analyst..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent w-full text-xs text-brand-text"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-brand-subtle font-mono">
              Showing {filteredCases.length} case records
            </div>
          </div>
        </div>

        {/* Case Table */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Case Identifier</th>
                <th>Priority</th>
                <th>Subject Customer</th>
                <th>Disputed Exposure</th>
                <th>Primary Threat Vector</th>
                <th>Assigned Lead</th>
                <th>Workflow Status</th>
                <th>Last Update</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="hover:bg-brand-elevated transition-colors cursor-pointer"
                >
                  <td className="mono font-bold text-brand-text flex items-center gap-1.5">
                    <Briefcase size={13} className="text-upay-gold" />
                    <span>{c.id}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.riskLevel === "Critical"
                          ? "badge-critical"
                          : c.riskLevel === "High"
                          ? "badge-high"
                          : "badge-medium"
                      }`}
                    >
                      {c.riskLevel}
                    </span>
                  </td>
                  <td className="link font-mono">{c.customer}</td>
                  <td className="amount font-bold text-brand-text font-mono">
                    ৳{(c.exposure || c.amount || 0).toLocaleString()}
                  </td>
                  <td className="text-brand-text font-medium text-xs">{c.reason}</td>
                  <td className="text-brand-muted text-xs">{c.analyst}</td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-semibold border ${
                        c.status === "Investigating"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : c.status === "Pending Review"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="text-brand-subtle text-xs font-mono">{c.updated}</td>
                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c);
                      }}
                      className="btn btn-ghost text-xs p-1"
                      title="Inspect Case Dossier"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
