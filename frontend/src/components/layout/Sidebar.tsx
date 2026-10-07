"use client";

import React from "react";
import { NavigationPage } from "@/types";
import {
  ShieldCheck,
  LayoutGrid,
  Activity,
  ShieldAlert,
  Share2,
  Briefcase,
  Users,
  Bell,
  BarChart3,
  Settings,
  X,
  Moon,
  Sun,
  HelpCircle,
  Cpu,
} from "lucide-react";

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  unreadAlertsCount: number;
  isOpen?: boolean;
  onClose?: () => void;
  onSettingsClick?: () => void;
  onTourClick?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

interface NavGroup {
  section: string;
  items: {
    id: NavigationPage;
    label: string;
    icon: React.ReactNode;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  unreadAlertsCount,
  isOpen = false,
  onClose,
  onSettingsClick,
  onTourClick,
  isDarkMode = false,
  onToggleTheme,
}) => {
  const navGroups: NavGroup[] = [
    {
      section: "OVERVIEW",
      items: [
        { id: "overview", label: "Executive Console", icon: <LayoutGrid size={15} /> },
      ],
    },
    {
      section: "INTELLIGENCE",
      items: [
        { id: "transactions", label: "Transaction Monitor", icon: <Activity size={15} /> },
        { id: "risk", label: "Risk Signals & XAI", icon: <ShieldAlert size={15} /> },
        { id: "network", label: "Fraud Network Topology", icon: <Share2 size={15} /> },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        { id: "investigations", label: "Investigation Cases", icon: <Briefcase size={15} /> },
        { id: "customers", label: "Customer 360", icon: <Users size={15} /> },
        { id: "alerts", label: "Alert Triage", icon: <Bell size={15} /> },
      ],
    },
    {
      section: "GOVERNANCE",
      items: [
        { id: "analytics", label: "Model Benchmarks & SAR", icon: <BarChart3 size={15} /> },
      ],
    },
  ];

  const handleNav = (page: NavigationPage) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <>
      {/* Mobile scrim */}
      <div
        className={`sidebar-scrim ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar select-none ${isOpen ? "open" : ""}`} aria-label="Main navigation">
        {/* Brand Header */}
        <div
          className="brand"
          onClick={() => handleNav("overview")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleNav("overview")}
        >
          <div className="brand-mark">
            <ShieldCheck size={18} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="brand-name">
              <span>upay</span> Sentinel
            </div>
            <div className="brand-sub">Trust &amp; Risk Platform</div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            className="md:hidden p-1 rounded text-slate-400 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 py-1 space-y-3" role="navigation">
          {navGroups.map((group) => (
            <div key={group.section}>
              <div className="nav-section-title">{group.section}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    currentPage === item.id ||
                    (currentPage === "investigation" && item.id === "investigations");

                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNav(item.id)}
                      onKeyDown={(e) => e.key === "Enter" && handleNav(item.id)}
                      className={`nav-item nav-${item.id} ${isActive ? "active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="shrink-0" aria-hidden="true">{item.icon}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.id === "alerts" && unreadAlertsCount > 0 && (
                        <span className="nav-count" aria-label={`${unreadAlertsCount} unread`}>
                          {unreadAlertsCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom Dock */}
        <div className="sidebar-bottom pt-2 border-t border-brand-borderSubtle">
          {/* Engine Status */}
          <div className="engine-status-box">
            <span className="pulse" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <b>Risk Engine Active</b>
                <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                  &lt; 2ms
                </span>
              </div>
              <small>DIU CPC &times; upay Node 01</small>
            </div>
          </div>

          {/* Analyst Profile */}
          <div className="analyst-profile">
            <div className="avatar" aria-hidden="true">AH</div>
            <div className="profile-info">
              <b>Arman Hossen</b>
              <small>Lead Risk Analyst</small>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                title={isDarkMode ? "Switch to Light Console" : "Switch to Cyber Dark Mode"}
                onClick={onToggleTheme}
                className="text-slate-400 hover:text-amber-400 transition-colors p-1 rounded hover:bg-brand-elevated"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                title="Start App Tour"
                onClick={onTourClick}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-brand-elevated"
                aria-label="Start Tour"
              >
                <HelpCircle size={14} />
              </button>
              <button
                title="System Settings"
                onClick={onSettingsClick}
                className="btn-settings text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-brand-elevated"
                aria-label="Settings"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
