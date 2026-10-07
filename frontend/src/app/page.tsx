"use client";

import React, { useState, useEffect } from "react";
import { NavigationPage, Transaction, InvestigationCase } from "@/types";
import { initialTransactions, investigationCases, alertsList } from "@/lib/data";
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
import { scoreTransaction } from "@/lib/fraud-engine";
import { fraudMLInstance } from "@/lib/ml-engine";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.replace(/^\//, "").toLowerCase();
      if (["overview", "transactions", "risk", "network", "investigations", "customers", "alerts", "analytics"].includes(path)) {
        return path as NavigationPage;
      }
    }
    return "overview";
  });
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedDrawerTxn, setSelectedDrawerTxn] = useState<Transaction | null>(null);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase>(investigationCases[0]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unreadAlerts, setUnreadAlerts] = useState<number>(3);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [aiTrained, setAiTrained] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Train local AI model on mount
    fraudMLInstance.trainModel(initialTransactions).then(() => {
      setAiTrained(true);
      showNotification("🧠 Neural Network trained on mock transactions!");
    });
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
  };

  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    setSelectedDrawerTxn(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Background stream simulator (generates a safe or minor transaction every 15s if enabled)
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const locations = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna"];
      const types = ["Wallet Transfer", "Cash Out", "Merchant Pay", "Add Money", "Mobile Recharge"] as const;
      const isAnomalous = Math.random() < 0.15; // 15% probability of an anomaly

      const randomAmount = isAnomalous
        ? Math.floor(Math.random() * 45000) + 25000
        : Math.floor(Math.random() * 4000) + 500;

      const randomCustNum = Math.floor(Math.random() * 9000) + 1000;
      const randomRecipNum = Math.floor(Math.random() * 9000) + 1000;
      const randomDev = isAnomalous
        ? `DEV-${Math.floor(Math.random() * 9000) + 1000}`
        : "DEV-2211";

      const newTxnPartial: Partial<Transaction> = {
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

      let scoreResult = scoreTransaction(newTxnPartial);
      
      // Predict with our local TensorFlow.js model in the background stream
      if (fraudMLInstance.isTrained) {
        fraudMLInstance.predict(newTxnPartial).then((aiProb) => {
          const aiScore = Math.round(aiProb * 100);
          if (aiScore > scoreResult.riskScore) {
            scoreResult.riskScore = aiScore;
            if (aiScore >= 85) scoreResult.riskLevel = "Critical";
            else if (aiScore >= 70) scoreResult.riskLevel = "High";
            else if (aiScore >= 45) scoreResult.riskLevel = "Medium";
            if (!scoreResult.flags.includes("🤖 Local AI Neural Net flagged anomaly")) {
              scoreResult.flags.unshift("🤖 Local AI Neural Net flagged anomaly");
            }
          }
          
          finalizeStreamingTransaction(scoreResult);
        });
      } else {
        finalizeStreamingTransaction(scoreResult);
      }

      function finalizeStreamingTransaction(scoreResult: any) {
        const completeTxn: Transaction = {
          ...newTxnPartial,
          id: newTxnPartial.id!,
          customer: newTxnPartial.customer!,
          recipient: newTxnPartial.recipient!,
          amount: newTxnPartial.amount!,
          type: newTxnPartial.type!,
          device: newTxnPartial.device!,
          isNewDevice: newTxnPartial.isNewDevice!,
          location: newTxnPartial.location!,
          isNewLocation: newTxnPartial.isNewLocation!,
          time: newTxnPartial.time!,
          timestamp: Date.now(),
          riskScore: scoreResult.riskScore,
          riskLevel: scoreResult.riskLevel,
          status:
            scoreResult.riskLevel === "Critical"
              ? "Investigating"
              : scoreResult.riskLevel === "High"
              ? "Flagged"
              : "Approved",
          flags: scoreResult.flags,
        };

        setTransactions((prev) => [completeTxn, ...prev.slice(0, 49)]);

        if (scoreResult.riskLevel === "Critical") {
          setUnreadAlerts((prev) => prev + 1);
          showNotification(
            `Critical Risk Detected: ৳${completeTxn.amount.toLocaleString()} on ${completeTxn.customer} (Score: ${scoreResult.riskScore})`
          );
        }
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Inject attack / custom transaction handler
  const handleInjectTransaction = async (txnData: Partial<Transaction>) => {
    let scoreResult = scoreTransaction(txnData);

    // 🧠 AI Overdrive: If our TFJS model predicts higher risk, we override the rules engine!
    if (aiTrained) {
      const aiProb = await fraudMLInstance.predict(txnData);
      const aiScore = Math.round(aiProb * 100);
      
      if (aiScore > scoreResult.riskScore) {
        scoreResult.riskScore = aiScore;
        if (aiScore >= 85) scoreResult.riskLevel = "Critical";
        else if (aiScore >= 70) scoreResult.riskLevel = "High";
        else if (aiScore >= 45) scoreResult.riskLevel = "Medium";
        
        if (!scoreResult.flags.includes("🤖 Local AI Neural Net flagged anomaly")) {
          scoreResult.flags.unshift("🤖 Local AI Neural Net flagged anomaly");
        }
      }
    }

    const injected: Transaction = {
      id: txnData.id || `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      customer: txnData.customer || "U-1042",
      recipient: txnData.recipient || "U-8831",
      amount: txnData.amount || 48500,
      type: txnData.type || "Wallet Transfer",
      device: txnData.device || "DEV-8821",
      isNewDevice: txnData.isNewDevice ?? true,
      location: txnData.location || "Dhaka",
      isNewLocation: txnData.isNewLocation ?? false,
      time: txnData.time || "Just now",
      timestamp: Date.now(),
      riskScore: scoreResult.riskScore,
      riskLevel: scoreResult.riskLevel,
      status:
        scoreResult.riskLevel === "Critical"
          ? "Investigating"
          : scoreResult.riskLevel === "High"
          ? "Flagged"
          : "Approved",
      flags:
        txnData.flags && txnData.flags.length > 0 && scoreResult.flags.length === 0
          ? txnData.flags
          : [...(txnData.flags || []), ...scoreResult.flags],
    };

    setTransactions((prev) => [injected, ...prev]);

    if (injected.riskLevel === "Critical") {
      setUnreadAlerts((prev) => prev + 1);
    }

    showNotification(
      `Injected ${injected.riskLevel} Transaction: ৳${injected.amount.toLocaleString()} (Score: ${injected.riskScore}/100)`
    );

    // Open drawer directly so the judge can immediately inspect the scoring!
    setSelectedDrawerTxn(injected);
  };

  const handleScenarioInject = (type: "ato" | "mule" | "sim_swap" | "velocity" | "normal") => {
    switch (type) {
      case "ato":
        handleInjectTransaction({
          id: `TXN-ATO-${Math.floor(Math.random() * 9000 + 1000)}`,
          customer: "U-2214",
          recipient: "U-9182",
          amount: 32000,
          type: "Cash Out",
          device: "DEV-NEW-8841",
          isNewDevice: true,
          location: "Chattogram",
          isNewLocation: true,
          flags: [
            "Nocturnal cash-out anomaly (02:44 AM)",
            "Unrecognized device fingerprint (DEV-NEW-8841)",
            "Recent USSD PIN reset triggered 12m prior",
          ],
        });
        break;
      case "mule":
        handleInjectTransaction({
          id: `TXN-MULE-${Math.floor(Math.random() * 9000 + 1000)}`,
          customer: "U-1042",
          recipient: "U-8831",
          amount: 48500,
          type: "Wallet Transfer",
          device: "DEV-8821",
          isNewDevice: true,
          location: "Dhaka",
          isNewLocation: false,
          flags: [
            "Recipient linked to Mule Syndicate Cluster #17",
            "Rapid multi-hop fund dispersal pattern",
            "Exceeds typical behavioral baseline by 6.2x",
          ],
        });
        break;
      case "sim_swap":
        handleInjectTransaction({
          id: `TXN-SIM-${Math.floor(Math.random() * 9000 + 1000)}`,
          customer: "U-9182",
          recipient: "U-7721",
          amount: 98000,
          type: "Wallet Transfer",
          device: "DEV-EMUL-09",
          isNewDevice: true,
          location: "Sylhet",
          isNewLocation: true,
          flags: [
            "Carrier SIM swap detected 10 minutes prior",
            "Maximum daily balance sweep attempted",
            "Emulator user-agent signature identified",
          ],
        });
        break;
      case "velocity":
        handleInjectTransaction({
          id: `TXN-VEL-${Math.floor(Math.random() * 9000 + 1000)}`,
          customer: "U-5541",
          recipient: "U-3329",
          amount: 24500,
          type: "Wallet Transfer",
          device: "DEV-3312",
          isNewDevice: false,
          location: "Dhaka",
          isNewLocation: false,
          flags: [
            "Velocity burst: 6 transactions in 10 minutes",
            "Amounts structured just beneath ৳25,000 reporting threshold",
          ],
        });
        break;
      case "normal":
        handleInjectTransaction({
          id: `TXN-NORM-${Math.floor(Math.random() * 9000 + 1000)}`,
          customer: "U-1120",
          recipient: "U-4402",
          amount: 2450,
          type: "Merchant Pay",
          device: "DEV-1120",
          isNewDevice: false,
          location: "Dhaka",
          isNewLocation: false,
          flags: [
            "Routine daytime merchant grocery payment",
            "Trusted device match",
          ],
        });
        break;
    }
  };

  return (
    <div className="app flex min-h-screen bg-[var(--bg)]">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        unreadAlertsCount={unreadAlerts}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onTourClick={() => setIsTourOpen(true)}
      />

      {/* Main Shell */}
      <div className="main-shell flex-1">
        {/* Topbar */}
        <Topbar
          onOpenSimulation={() => setIsSimModalOpen(true)}
          onOpenReport={() => setIsReportModalOpen(true)}
          unreadCount={unreadAlerts}
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
              onOpenTransactionDrawer={(txn) => setSelectedDrawerTxn(txn)}
              transactions={transactions}
              onOpenReport={() => setIsReportModalOpen(true)}
              onInjectScenario={handleScenarioInject}
            />
          )}

          {currentPage === "transactions" && (
            <TransactionMonitorView
              transactions={transactions}
              onSelectTransaction={(txn) => setSelectedDrawerTxn(txn)}
              isStreaming={isStreaming}
              onToggleStreaming={() => {
                setIsStreaming(!isStreaming);
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
        transaction={selectedDrawerTxn}
        onClose={() => setSelectedDrawerTxn(null)}
        onOpenInvestigation={(txn) => {
          setSelectedDrawerTxn(null);
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
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* Onboarding / App Tour */}
      <AppTour 
        run={isTourOpen} 
        onFinish={() => setIsTourOpen(false)} 
      />

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-surface border border-line rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-ink mb-4">System Settings</h3>
            <p className="text-sm text-subtle mb-6">
              Adjust AI confidence thresholds, configure notification alerts, and manage integration keys.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">AI Auto-Mitigation</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Email Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Webhook Integration</span>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="btn btn-secondary text-sm"
              >
                Close
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="btn btn-primary text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
