"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Bell,
  FileDown,
  Sparkles,
  Zap,
  Menu,
  X,
  Moon,
  Sun,
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
        <Menu size={18} />
      </button>

      {/* Search Input */}
      <div className="global-search" role="search">
        <Search size={15} aria-hidden="true" />
        <input
          type="text"
          placeholder="Search transactions, customers, cases…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search"
        />
        <kbd className="hidden sm:flex items-center text-[10px] text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-mono leading-none select-none flex-shrink-0">
          ⌘K
        </kbd>
      </div>

      {/* Action Controls */}
      <div className="top-actions">
        {/* Simulate Attack — primary CTA */}
        <button
          onClick={onOpenSimulation}
          className="btn btn-primary text-xs"
          aria-label="Open attack simulation"
        >
          <Zap size={13} className="animate-pulse" aria-hidden="true" />
          <span className="hidden sm:inline">Simulate Attack</span>
          <span className="sm:hidden">Sim</span>
        </button>

        {/* Audit Report */}
        <button
          onClick={onOpenReport}
          className="btn btn-secondary text-xs hidden sm:inline-flex"
          aria-label="Export audit report"
        >
          <FileDown size={13} aria-hidden="true" />
          <span>Audit Report</span>
        </button>

        {/* Date indicator */}
        <div className="date-control" aria-label="Current time range">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" aria-hidden="true" />
          <span>Live · 24h</span>
          <ChevronDown size={13} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="icon-btn"
          title="Toggle Dark Mode"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Help */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="icon-btn"
          title="About upay Sentinel"
          aria-label="Help and about"
          aria-expanded={showHelp}
        >
          <HelpCircle size={16} />
        </button>

        {/* Alerts Bell */}
        <button
          onClick={onNavigateAlerts}
          className={`icon-btn ${unreadCount > 0 ? "has-alert" : ""}`}
          title={`${unreadCount} Unread Alert${unreadCount !== 1 ? "s" : ""}`}
          aria-label={`${unreadCount} unread alerts`}
        >
          <Bell size={16} />
        </button>

        {/* User Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200 flex-shrink-0 select-none"
          title="Arman Hossen — Fraud Operations Analyst"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="About upay Sentinel"
          onClick={(e) => e.target === e.currentTarget && setShowHelp(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-gray-900 leading-tight">
                    upay Sentinel
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    DIU CPC × upay AI Hackathon 2026 · Track 01
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 space-y-3 text-[13px] text-gray-600 leading-relaxed">
              <p>
                <b className="text-gray-800">upay Sentinel</b> is an enterprise-grade AI Fraud
                &amp; Scam Intelligence platform built for Mobile Financial Services (MFS).
              </p>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2 text-emerald-950">
                <div className="font-semibold text-emerald-800 text-xs uppercase tracking-wide">
                  Hackathon Answers
                </div>
                <div className="text-xs space-y-1.5">
                  <div><b>1. What happened?</b> Real-time scoring &amp; event reconstruction.</div>
                  <div><b>2. Why is it risky?</b> Behavioral anomaly + mule graph analysis.</div>
                  <div><b>3. What to do next?</b> Gemini-powered actionable synthesis.</div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Tip: Click <b className="text-gray-600">&ldquo;Simulate Attack&rdquo;</b> to inject
                live mule network spikes and test AI detection in real time.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="btn btn-primary text-xs"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
