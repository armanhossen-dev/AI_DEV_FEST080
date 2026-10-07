"use client";

import React, { useState } from "react";
import { Transaction, RiskLevel, TransactionType } from "@/types";
import {
  Search,
  Filter,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  Shield,
  Zap,
} from "lucide-react";

interface TransactionMonitorViewProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenSimulation: () => void;
}

export const TransactionMonitorView: React.FC<TransactionMonitorViewProps> = ({
  transactions,
  onSelectTransaction,
  isStreaming,
  onToggleStreaming,
  onOpenSimulation,
}) => {
  const [search, setSearch] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [selectedDevice, setSelectedDevice] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.recipient.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.device.toLowerCase().includes(search.toLowerCase());

    const matchesRisk =
      selectedRisk === "All" || t.riskLevel.toLowerCase() === selectedRisk.toLowerCase();
    const matchesType = selectedType === "All" || t.type === selectedType;
    const matchesLocation =
      selectedLocation === "All" || t.location === selectedLocation;
    const matchesDevice =
      selectedDevice === "All" ||
      (selectedDevice === "New Device" ? t.isNewDevice : !t.isNewDevice);

    return (
      matchesSearch && matchesRisk && matchesType && matchesLocation && matchesDevice
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-brand-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            REAL-TIME INGESTION ENGINE &bull; TELEMETRY STREAM
          </div>
          <h1 className="page-title text-brand-text">Transaction Monitor</h1>
          <p className="page-subtitle text-brand-muted">
            Live digital financial stream inspection, composite multi-signal risk scores, and anomaly detection.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Live Streaming Toggle */}
          <button
            onClick={onToggleStreaming}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            {isStreaming ? (
              <>
                <Pause size={13} className="text-amber-400" />
                <span>Pause Live Stream</span>
              </>
            ) : (
              <>
                <Play size={13} className="text-emerald-400" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          {/* Attack Injector shortcut */}
          <button
            onClick={onOpenSimulation}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <Zap size={13} />
            <span>Inject Test Scenario</span>
          </button>

          {/* Live Indicator */}
          <div className="live-label">
            <span className={`pulse ${isStreaming ? "bg-emerald-400" : "bg-brand-subtle"}`} />
            <span>{isStreaming ? "STREAMING LIVE" : "STREAM PAUSED"}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 text-xs">
        {/* Search */}
        <div className="lg:col-span-4 field">
          <Search size={13} className="text-brand-subtle shrink-0" />
          <input
            type="text"
            placeholder="Search txn ID, wallet, hardware device..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="outline-none bg-transparent w-full text-xs text-brand-text"
          />
        </div>

        {/* Risk Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedRisk}
            onChange={(e) => {
              setSelectedRisk(e.target.value);
              setCurrentPage(1);
            }}
            className="field w-full outline-none cursor-pointer"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="field w-full outline-none cursor-pointer"
          >
            <option value="All">All Transaction Types</option>
            <option value="Wallet Transfer">Wallet Transfer</option>
            <option value="Cash Out">Cash Out</option>
            <option value="Merchant Pay">Merchant Pay</option>
            <option value="Add Money">Add Money</option>
            <option value="Mobile Recharge">Mobile Recharge</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setCurrentPage(1);
            }}
            className="field w-full outline-none cursor-pointer"
          >
            <option value="All">All Locations</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chattogram">Chattogram</option>
            <option value="Sylhet">Sylhet</option>
            <option value="Khulna">Khulna</option>
            <option value="Rajshahi">Rajshahi</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        <div className="lg:col-span-2">
          <button
            onClick={() => {
              setSearch("");
              setSelectedRisk("All");
              setSelectedType("All");
              setSelectedLocation("All");
              setSelectedDevice("All");
              setCurrentPage(1);
            }}
            className="filter-button w-full justify-center text-xs"
            title="Reset Filters"
          >
            <Filter size={12} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-base table-card">
        {/* Table Meta bar */}
        <div className="table-meta">
          <div className="flex items-center gap-2">
            <span className="text-brand-text font-bold text-xs uppercase tracking-wide">
              Live Ingestion Feed
            </span>
            <span className="text-brand-subtle text-xs flex items-center gap-1 font-mono">
              &bull; {filtered.length} matched
            </span>
          </div>
          <span className="text-[11px] text-brand-subtle font-mono">
            P99 Latency: 1.8ms &bull; Zero Buffer Lag
          </span>
        </div>

        {/* Table Content */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Risk Priority</th>
                <th>Transaction ID</th>
                <th>Sender (Customer)</th>
                <th>Target Recipient</th>
                <th>Amount (BDT)</th>
                <th>Channel / Type</th>
                <th>Timestamp</th>
                <th>Hardware Fingerprint</th>
                <th>Location</th>
                <th>Risk Score</th>
                <th>Decision Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-brand-subtle">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className="hover:bg-brand-elevated transition-colors cursor-pointer"
                  >
                    <td>
                      <span
                        className={`badge ${
                          txn.riskLevel === "Critical"
                            ? "badge-critical"
                            : txn.riskLevel === "High"
                            ? "badge-high"
                            : txn.riskLevel === "Medium"
                            ? "badge-medium"
                            : "badge-low"
                        }`}
                      >
                        {txn.riskLevel}
                      </span>
                    </td>
                    <td className="mono font-semibold text-brand-text">{txn.id}</td>
                    <td className="link font-mono">{txn.customer}</td>
                    <td className="link font-mono">{txn.recipient}</td>
                    <td className="amount font-bold text-brand-text font-mono">
                      ৳{txn.amount.toLocaleString()}
                    </td>
                    <td className="text-brand-muted text-xs">{txn.type}</td>
                    <td className="text-brand-subtle font-mono text-xs">{txn.time}</td>
                    <td>
                      <span
                        className={
                          txn.isNewDevice
                            ? "text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded text-[10.5px] border border-rose-500/20 font-mono"
                            : "text-brand-muted font-mono text-[11px]"
                        }
                      >
                        {txn.device} {txn.isNewDevice && "(New)"}
                      </span>
                    </td>
                    <td className="text-brand-muted">{txn.location}</td>
                    <td>
                      <div
                        className={`w-7 h-7 rounded border font-mono font-bold text-xs flex items-center justify-center ${
                          txn.riskLevel === "Critical"
                            ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                            : txn.riskLevel === "High"
                            ? "border-orange-500/30 text-orange-400 bg-orange-500/10"
                            : txn.riskLevel === "Medium"
                            ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                            : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        }`}
                      >
                        {txn.riskScore}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-semibold border ${
                          txn.status === "Investigating"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : txn.status === "Flagged"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(txn);
                        }}
                        className="text-brand-subtle hover:text-brand-text p-1 rounded hover:bg-brand-elevated"
                        title="Inspect Evidence"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination">
          <span>
            Page {currentPage} of {totalPages} ({filtered.length} total records)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary text-xs px-2 py-1 disabled:opacity-40"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-6 h-6 rounded text-xs font-semibold font-mono ${
                  currentPage === num
                    ? "bg-upay-gold text-slate-950 font-bold"
                    : "bg-brand-surface text-brand-text hover:bg-brand-elevated border border-brand-border"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn btn-secondary text-xs px-2 py-1 disabled:opacity-40"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
