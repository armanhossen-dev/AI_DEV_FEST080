"use client";

import React, { useState } from "react";
import { InvestigationCase, RiskLevel } from "@/types";
import { investigationCases } from "@/lib/data";
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
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredCases = investigationCases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      (c.customer || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.reason || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.analyst || "").toLowerCase().includes(search.toLowerCase());

    if (activeTab === "critical") return matchesSearch && c.riskLevel === "Critical";
    if (activeTab === "high") return matchesSearch && c.riskLevel === "High";
    if (activeTab === "assigned") return matchesSearch && (c.analyst || "").includes("Arman");
    if (activeTab === "resolved") return matchesSearch && c.status === "Resolved";
    return matchesSearch;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">CASE MANAGEMENT & COMPLIANCE AUDIT</div>
          <h1 className="page-title">Fraud Investigations</h1>
          <p className="page-subtitle">
            Triage suspicious cases, review AI evidence packages, and execute regulatory enforcement actions.
          </p>
        </div>
        <button
          onClick={onNewCaseModal}
          className="btn btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>+ New Investigation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { id: "all", label: "All Cases (47)" },
          { id: "critical", label: "Critical Priority (8)" },
          { id: "high", label: "High Risk (16)" },
          { id: "assigned", label: "Assigned to Me (12)" },
          { id: "resolved", label: "Resolved Cases" },
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
            <Search size={14} className="text-subtle shrink-0" />
            <input
              type="text"
              placeholder="Search case ID, customer, reason, or analyst..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-subtle font-medium">
              Showing {filteredCases.length} open cases
            </div>
          </div>
        </div>

        {/* Case Table */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Risk Priority</th>
                <th>Subject Customer</th>
                <th>Disputed Amount</th>
                <th>Primary Risk Vector</th>
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
                  className="hover:bg-appBg transition-colors cursor-pointer"
                >
                  <td className="mono font-bold text-upay-dark flex items-center gap-1.5">
                    <Briefcase size={14} className="text-upay-DEFAULT" />
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
                  <td className="font-mono text-ink font-semibold">{c.customer || "N/A"}</td>
                  <td className="amount font-bold text-ink">
                    ৳{(c.amount ?? 0).toLocaleString()}
                  </td>
                  <td className="text-ink max-w-xs truncate">{c.reason || "General review"}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="analyst-avatar text-upay-dark bg-upay-soft">
                        {c.analyst ? c.analyst[0] : "A"}
                      </span>
                      <span className="text-xs text-ink">{c.analyst || "Unassigned"}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status text-xs font-semibold ${
                        c.status === "Investigating"
                          ? "text-risk-critical bg-risk-criticalSoft"
                          : "text-risk-high bg-risk-highSoft"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="text-subtle text-xs">{c.updated}</td>
                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c);
                      }}
                      className="btn btn-ghost text-xs p-1 px-2"
                    >
                      <span>Workspace</span>
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
