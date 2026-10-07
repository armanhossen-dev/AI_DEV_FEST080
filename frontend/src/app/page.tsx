"use client";

import React, { useState, useEffect } from "react";
import { NavigationPage, Transaction, InvestigationCase } from "@/types";
import { SentinelProvider, useSentinel } from "@/context/SentinelContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { OverviewView } from "@/components/overview/OverviewView";
import { TransactionMonitorView } from "@/components/transactions/TransactionMonitorView";
import { TransactionDrawer } from "@/components/transactions/TransactionDrawer";
import { RiskIntelligenceView } from "@/components/risk/RiskIntelligenceView";
import { FraudNetworkView } from "@/components/network/FraudNetworkView";
import { InvestigationsView } from "@/components/investigations/InvestigationsView";
import { InvestigationDetailView } from "@/components/investigations/InvestigationDetailView";
import { CustomerIntelligenceView } from "@/components/customers/CustomerIntelligenceView";
import { AlertCenterView } from "@/components/alerts/AlertCenterView";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { SimulationModal } from "@/components/simulation/SimulationModal";
import { ReportExportModal } from "@/components/report/ReportExportModal";
import { Toast } from "@/components/ui/Toast";
import { AppTour } from "@/components/ui/AppTour";
import { SentinelAssistant } from "@/components/investigations/SentinelAssistant";
import { Sparkles, X, Bot, MessageSquare } from "lucide-react";

function SentinelAppShell() {
  const {
    transactions,
    alerts,
    cases,
    selectedCase,
    selectedTransaction,
    setSelectedCase,
    setSelectedTransaction,
    isStreaming,
    toggleStreaming,
    unreadAlertsCount,
    injectScenario,
  } = useSentinel();

  const [currentPage, setCurrentPage] = useState<NavigationPage>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
  };

  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    setSelectedTransaction(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Background stream simulator running through unified risk engine pipeline
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      const locations = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna"];
      const types = ["Wallet Transfer", "Cash Out", "Merchant Pay", "Add Money", "Mobile Recharge"] as const;
      const isAnomalous = Math.random() < 0.12; // 12% probability of an anomaly

      const randomAmount = isAnomalous
        ? Math.floor(Math.random() * 45000) + 25000
        : Math.floor(Math.random() * 4000) + 500;

      const randomCustNum = Math.floor(Math.random() * 9000) + 1000;
      const randomRecipNum = Math.floor(Math.random() * 9000) + 1000;
      const randomDev = isAnomalous
        ? `DEV-${Math.floor(Math.random() * 9000) + 1000}`
        : "DEV-2211";

      const streamTxnPartial: Partial<Transaction> = {
        id: `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        customer: `U-${randomCustNum}`,
        recipient: isAnomalous ? "U-8831" : `U-${randomRecipNum}`,
        amount: randomAmount,
        type: types[Math.floor(Math.random() * types.length)],
        device: randomDev,
        isNewDevice: isAnomalous,
        location: locations[Math.floor(Math.random() * locations.length)],
        isNewLocation: isAnomalous,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const resultTxn = await injectScenario(streamTxnPartial);

      if (resultTxn.riskLevel === "Critical") {
        showNotification(
          `Critical Risk Detected: ৳${resultTxn.amount.toLocaleString()} on ${resultTxn.customer} (Score: ${resultTxn.riskScore}/100)`
        );
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isStreaming, injectScenario]);

  // Inject attack / custom transaction handler from Modal or Topbar
  const handleInjectTransaction = async (txnData: Partial<Transaction>) => {
    const injected = await injectScenario(txnData);
    showNotification(
      `Injected ${injected.riskLevel} Transaction: ৳${injected.amount.toLocaleString()} (Score: ${injected.riskScore}/100)`
    );
    setSelectedTransaction(injected);
  };

  return (
    <div className="app flex min-h-screen bg-[var(--bg)]">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        unreadAlertsCount={unreadAlertsCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onTourClick={() => setIsTourOpen(true)}
      />

      {/* Main Shell */}
      <div className="main-wrapper flex-1">
        {/* Topbar */}
        <Topbar
          onOpenSimulation={() => setIsSimModalOpen(true)}
          onOpenReport={() => setIsReportModalOpen(true)}
          unreadCount={unreadAlertsCount}
          onNavigateAlerts={() => handleNavigate("alerts")}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((d) => !d)}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-5 md:p-7 max-w-[1600px] w-full mx-auto">
          {currentPage === "overview" && (
            <OverviewView
              onNavigate={handleNavigate}
              onOpenTransactionDrawer={(txn) => setSelectedTransaction(txn)}
              transactions={transactions}
              onOpenReport={() => setIsReportModalOpen(true)}
            />
          )}

          {currentPage === "transactions" && (
            <TransactionMonitorView
              transactions={transactions}
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
              isStreaming={isStreaming}
              onToggleStreaming={() => {
                toggleStreaming();
                showNotification(
                  isStreaming ? "Live simulation paused" : "Live simulation streaming resumed"
                );
              }}
              onOpenSimulation={() => setIsSimModalOpen(true)}
            />
          )}

          {currentPage === "risk" && (
            <RiskIntelligenceView
              onNavigate={handleNavigate}
              onNotify={showNotification}
            />
          )}

          {currentPage === "network" && (
            <FraudNetworkView
              onNavigate={handleNavigate}
              onOpenCase={() => handleNavigate("investigation")}
              onNotify={showNotification}
            />
          )}

          {currentPage === "investigations" && (
            <InvestigationsView
              onSelectCase={(c) => {
                setSelectedCase(c);
                handleNavigate("investigation");
              }}
              onNewCaseModal={() => {
                showNotification("New case wizard initiated. Auto-filling risk telemetry.");
                handleNavigate("investigation");
              }}
            />
          )}

          {currentPage === "investigation" && (
            <InvestigationDetailView
              caseData={selectedCase}
              onNavigate={handleNavigate}
              onNotify={showNotification}
            />
          )}

          {currentPage === "customers" && (
            <CustomerIntelligenceView
              onNavigate={handleNavigate}
              onOpenCase={() => handleNavigate("investigation")}
            />
          )}

          {currentPage === "alerts" && (
            <AlertCenterView
              onNavigate={handleNavigate}
              onOpenCase={() => handleNavigate("investigation")}
              onNotify={showNotification}
            />
          )}

          {currentPage === "analytics" && (
            <AnalyticsView
              onNavigate={handleNavigate}
              onOpenReport={() => setIsReportModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Slide-out Transaction Detail Drawer */}
      <TransactionDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onOpenInvestigation={(txn) => {
          setSelectedTransaction(null);
          const relatedCase = cases.find((c) => c.customer === txn.customer);
          if (relatedCase) setSelectedCase(relatedCase);
          handleNavigate("investigation");
          showNotification(`Opened Investigation workspace for ${txn.id}`);
        }}
      />

      {/* Simulation / Attack Injector Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onInjectTransaction={handleInjectTransaction}
      />

      {/* Export Report / Compliance Modal */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onNotify={showNotification}
      />

      {/* Toast Notification Container */}
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Onboarding / App Tour */}
      <AppTour run={isTourOpen} onFinish={() => setIsTourOpen(false)} />

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-[#0B0F14]/80 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn p-4">
          <div className="bg-brand-surface border border-brand-border rounded-lg shadow-modal w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-brand-text mb-2">System & Engine Settings</h3>
            <p className="text-xs text-brand-muted mb-6 leading-relaxed">
              Adjust AI confidence thresholds, configure notification alerts, and manage integration keys.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-brand-border">
                <div>
                  <div className="text-xs font-semibold text-brand-text">AI Auto-Mitigation Safeguard</div>
                  <div className="text-[11px] text-brand-subtle">Automatically block transactions exceeding Risk Score 90</div>
                </div>
                <input type="checkbox" className="h-4 w-4 rounded bg-brand-elevated border-brand-border text-emerald-500 focus:ring-emerald-500" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-brand-border">
                <div>
                  <div className="text-xs font-semibold text-brand-text">Operations Center Alerts</div>
                  <div className="text-[11px] text-brand-subtle">Dispatch real-time webhooks for CRITICAL tier anomalies</div>
                </div>
                <input type="checkbox" className="h-4 w-4 rounded bg-brand-elevated border-brand-border text-emerald-500 focus:ring-emerald-500" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-xs font-semibold text-brand-text">Bangladesh Bank BFIU Mirror</div>
                  <div className="text-[11px] text-brand-subtle">Stream automated AML SAR drafts to secure regulator endpoint</div>
                </div>
                <input type="checkbox" className="h-4 w-4 rounded bg-brand-elevated border-brand-border text-emerald-500 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-brand-border">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="btn-primary text-xs"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Assistant in Bottom Right */}
      <aside aria-label="Sentinel AI Copilot Widget" className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
        {isCopilotOpen && (
          <div className="mb-3 w-[430px] max-w-[calc(100vw-2.5rem)] h-[580px] max-h-[calc(100vh-6.5rem)] shadow-2xl rounded-xl border border-brand-border overflow-hidden bg-brand-surface backdrop-blur-xl animate-fadeIn flex flex-col">
            <SentinelAssistant
              caseId={selectedCase?.id || "INV-1042"}
              customer={selectedCase?.customer || "U-1042"}
              onNotify={showNotification}
              onClose={() => setIsCopilotOpen(false)}
              isFloating={true}
            />
          </div>
        )}

        <button
          id="sentinel-ai-assistant-toggle"
          onClick={() => setIsCopilotOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 border ${
            isCopilotOpen
              ? "bg-brand-elevated border-brand-border text-brand-text hover:bg-brand-surface"
              : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 border-amber-400 text-slate-950 hover:brightness-110 shadow-amber-500/25 ring-4 ring-amber-500/20"
          }`}
          title={isCopilotOpen ? "Minimize AI Assistant" : "Open Sentinel Copilot AI"}
          aria-label="Sentinel AI Copilot"
        >
          <div className="relative flex items-center justify-center">
            {isCopilotOpen ? (
              <X size={18} className="text-brand-text" />
            ) : (
              <>
                <Sparkles size={18} className="text-slate-950 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </>
            )}
          </div>
          <div className="text-left font-sans">
            <div
              className={`text-xs font-bold leading-tight flex items-center gap-1.5 ${
                isCopilotOpen ? "text-brand-text" : "text-slate-950"
              }`}
            >
              <span>{isCopilotOpen ? "Close Assistant" : "Sentinel Copilot"}</span>
              {!isCopilotOpen && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-950 text-amber-400 font-extrabold uppercase">
                  AI 2.5
                </span>
              )}
            </div>
            {!isCopilotOpen && (
              <div className="text-[9.5px] text-slate-900/80 font-medium tracking-tight">
                Grounded Fraud Intelligence
              </div>
            )}
          </div>
        </button>
      </aside>
    </div>
  );
}

export default function Home() {
  return (
    <SentinelProvider>
      <SentinelAppShell />
    </SentinelProvider>
  );
}
