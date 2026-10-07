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
  const itemsPerPage = 8;

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
          <div className="eyebrow">REAL-TIME INGESTION ENGINE</div>
          <h1 className="page-title">Transaction Monitor</h1>
          <p className="page-subtitle">
            Observe real-time MFS flows, evaluate XGBoost risk scores, and investigate suspicious activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live Streaming Toggle */}
          <button
            onClick={onToggleStreaming}
            className={`btn text-xs flex items-center gap-1.5 ${
              isStreaming ? "btn-secondary text-upay-dark" : "btn-secondary text-muted"
            }`}
          >
            {isStreaming ? (
              <>
                <Pause size={14} className="text-risk-high" />
                <span>Pause Live Stream</span>
              </>
            ) : (
              <>
                <Play size={14} className="text-upay-DEFAULT" />
                <span>Resume Live Stream</span>
              </>
            )}
          </button>

          {/* Attack Injector shortcut */}
          <button
            onClick={onOpenSimulation}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <Zap size={14} />
            <span>Inject Test Transaction</span>
          </button>

          {/* Live Indicator */}
          <div className="live-label">
            <span className="pulse" />
            <span>{isStreaming ? "STREAMING LIVE" : "STREAM PAUSED"}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-12 gap-2 text-xs">
        {/* Search */}
        <div className="col-span-3 field">
          <Search size={14} className="text-subtle shrink-0" />
          <input
            type="text"
            placeholder="Search txn, user, device..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="outline-none bg-transparent w-full text-xs"
          />
        </div>

        {/* Risk Filter */}
        <div className="col-span-2">
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
        <div className="col-span-2">
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
        <div className="col-span-2">
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

        {/* Device Filter */}
        <div className="col-span-2">
          <select
            value={selectedDevice}
            onChange={(e) => {
              setSelectedDevice(e.target.value);
              setCurrentPage(1);
            }}
            className="field w-full outline-none cursor-pointer"
          >
            <option value="All">All Devices</option>
            <option value="New Device">New Hardware</option>
            <option value="Known Device">Trusted Hardware</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        <div className="col-span-1">
          <button
            onClick={() => {
              setSearch("");
              setSelectedRisk("All");
              setSelectedType("All");
              setSelectedLocation("All");
              setSelectedDevice("All");
              setCurrentPage(1);
            }}
            className="filter-button w-full justify-center text-xs hover:bg-appBg"
            title="Reset Filters"
          >
            <Filter size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-base table-card">
        {/* Table Meta bar */}
        <div className="table-meta">
          <div className="flex items-center gap-2">
            <b className="text-ink text-sm">Live Transactions</b>
            <span className="text-subtle text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-upay-DEFAULT" />
              Real-time Ingestion Stream
            </span>
          </div>
          <span className="text-xs text-subtle font-medium">
            Showing {filtered.length} matching transactions
          </span>
        </div>

        {/* Table Content */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Risk</th>
                <th>Transaction ID</th>
                <th>Sender (Customer)</th>
                <th>Amount (BDT)</th>
                <th>Time</th>
                <th>Hardware / Device</th>
                <th>Location</th>
                <th>Recipient</th>
                <th>Score</th>
                <th>Decision Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-subtle">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                paginated.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className="hover:bg-appBg transition-colors cursor-pointer"
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
                    <td className="mono font-semibold text-ink">{txn.id}</td>
                    <td className="link font-mono">{txn.customer}</td>
                    <td className="amount font-bold text-ink">
                      ৳{txn.amount.toLocaleString()}
                    </td>
                    <td className="text-muted">{txn.time}</td>
                    <td>
                      <span
                        className={
                          txn.isNewDevice
                            ? "text-risk-critical font-bold bg-risk-criticalSoft px-2 py-0.5 rounded text-[11px]"
                            : "text-muted font-mono text-[11px]"
                        }
                      >
                        {txn.device}
                      </span>
                    </td>
                    <td className="text-ink">{txn.location}</td>
                    <td className="link font-mono">{txn.recipient}</td>
                    <td>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          txn.riskLevel === "Critical"
                            ? "bg-risk-criticalSoft text-risk-critical"
                            : txn.riskLevel === "High"
                            ? "bg-risk-highSoft text-risk-high"
                            : txn.riskLevel === "Medium"
                            ? "bg-risk-mediumSoft text-risk-medium"
                            : "bg-risk-lowSoft text-risk-low"
                        }`}
                      >
                        {txn.riskScore}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-medium ${
                          txn.status === "Investigating"
                            ? "bg-risk-criticalSoft text-risk-critical"
                            : txn.status === "Flagged"
                            ? "bg-risk-highSoft text-risk-high"
                            : "bg-risk-lowSoft text-risk-low"
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
                        className="text-subtle hover:text-upay-dark p-1"
                        title="View Details"
                      >
                        <MoreVertical size={16} />
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
            Page {currentPage} of {totalPages} ({filtered.length} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary text-xs px-2 py-1 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-7 h-7 rounded-md text-xs font-semibold ${
                  currentPage === num
                    ? "bg-upay-DEFAULT text-white"
                    : "bg-surface text-ink hover:bg-appBg border border-line"
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
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
