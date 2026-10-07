"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Bell,
  FileDown,
  Zap,
  Menu,
  X,
  Moon,
  Sun,
  Shield,
  Activity,
  Cpu,
} from "lucide-react";

interface TopbarProps {
  onOpenSimulation: () => void;
  onOpenReport: () => void;
  unreadCount: number;
  onNavigateAlerts: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSimulation,
  onOpenReport,
  unreadCount,
  onNavigateAlerts,
  searchQuery,
  setSearchQuery,
  onToggleSidebar,
  isDarkMode,
  onToggleTheme,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="topbar">
      {/* Mobile hamburger */}
      <button
        className="hamburger-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <Menu size={16} />
      </button>

      {/* Global Search Input */}
      <div className="global-search" role="search">
        <Search size={14} className="text-brand-subtle shrink-0" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search transactions, wallets, devices, cases…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search"
        />
        <kbd className="hidden sm:flex items-center text-[10px] text-brand-subtle bg-brand-surface border border-brand-border px-1.5 py-0.5 rounded font-mono leading-none select-none shrink-0">
          ⌘K
        </kbd>
      </div>

      {/* Operational Indicators & Actions */}
      <div className="top-actions">
        {/* Real-time Telemetry Status Badges */}
        <div className="telemetry-badge hidden md:flex" title="Risk Engine Pipeline Latency">
          <span className="status-dot animate-pulse" />
          <span className="font-mono text-emerald-400 font-semibold">&lt; 2ms</span>
          <span className="text-brand-subtle">&bull; DC1-Dhaka</span>
        </div>

        {/* Simulate Attack — Primary Testing CTA */}
        <button
          onClick={onOpenSimulation}
          className="btn btn-primary text-xs"
          aria-label="Open attack simulation workbench"
        >
          <Zap size={13} className="shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Simulate Scenario</span>
          <span className="sm:hidden">Sim</span>
        </button>

        {/* Audit Report Export */}
        <button
          onClick={onOpenReport}
          className="btn btn-secondary text-xs hidden lg:inline-flex"
          aria-label="Export audit report"
        >
          <FileDown size={13} aria-hidden="true" />
          <span>Audit Report</span>
        </button>

        {/* Time range selector */}
        <div className="telemetry-badge hidden xl:flex cursor-pointer" aria-label="Current time range">
          <span>Live &middot; 24h</span>
          <ChevronDown size={12} className="text-brand-subtle shrink-0" aria-hidden="true" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="icon-btn"
          title={isDarkMode ? "Switch to Light Console" : "Switch to Dark Console"}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
        </button>

        {/* Help / Platform Info */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="icon-btn"
          title="About upay Sentinel"
          aria-label="Help and about"
          aria-expanded={showHelp}
        >
          <HelpCircle size={15} />
        </button>

        {/* Alerts Bell */}
        <button
          onClick={onNavigateAlerts}
          className={`icon-btn ${unreadCount > 0 ? "has-alert" : ""}`}
          title={`${unreadCount} Unread Alerts`}
          aria-label={`${unreadCount} unread alerts`}
        >
          <Bell size={15} />
        </button>

        {/* User Identity Avatar */}
        <div
          className="w-8 h-8 rounded bg-brand-elevated text-upay-DEFAULT border border-brand-borderStrong font-mono font-bold text-xs flex items-center justify-center shrink-0 select-none cursor-pointer"
          title="Arman Hossen — Senior Fraud Analyst (Lead)"
          aria-label="User menu"
          role="button"
          tabIndex={0}
        >
          AH
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="About upay Sentinel"
          onClick={(e) => e.target === e.currentTarget && setShowHelp(false)}
        >
          <div className="bg-brand-surface rounded-lg max-w-md w-full p-6 shadow-modal border border-brand-border">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-brand-elevated text-upay-gold flex items-center justify-center shrink-0 border border-brand-borderStrong">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-text leading-tight flex items-center gap-1.5">
                    <span className="text-upay-gold">upay</span> Sentinel
                  </h3>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    DIU CPC &times; upay AI Hackathon 2026 &middot; Track 01: Trust &amp; Risk Intelligence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-brand-muted hover:bg-brand-elevated hover:text-brand-text transition-colors"
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 space-y-3 text-xs text-brand-muted leading-relaxed">
              <p>
                <b className="text-brand-text">upay Sentinel</b> is an enterprise-grade Trust &amp; Risk Intelligence platform designed for Bangladesh&apos;s Mobile Financial Services (MFS) ecosystem.
              </p>
              <div className="p-3.5 bg-brand-elevated rounded border border-brand-border space-y-2 text-brand-text">
                <div className="font-bold text-upay-gold text-[10px] uppercase tracking-wider font-mono">
                  Operational Risk Lifecycle
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div><b className="text-brand-text">1. What happened?</b> Real-time deterministic rules + TensorFlow neural network scoring.</div>
                  <div><b className="text-brand-text">2. Why is it risky?</b> Topological money-mule clustering, velocity burst, and behavioral anomaly detection.</div>
                  <div><b className="text-brand-text">3. What to do next?</b> Gemini Copilot synthesis with analyst human-in-the-loop oversight.</div>
                </div>
              </div>
              <p className="text-[11px] text-brand-subtle">
                Use <b className="text-upay-gold">&ldquo;Simulate Scenario&rdquo;</b> to test attack vectors including Account Takeover, Money Mule Layering, SIM Swap Drain, and Smurfing bursts.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="btn btn-primary text-xs"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
