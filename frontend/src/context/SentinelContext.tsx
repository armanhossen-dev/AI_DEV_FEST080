"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  Transaction,
  InvestigationCase,
  NetworkNode,
  NetworkEdge,
  AlertItem,
  RiskLevel,
} from "@/types";
import {
  initialTransactions,
  investigationCases as initialCases,
  networkNodes as initialNodes,
  networkEdges as initialEdges,
  alertsList as initialAlerts,
} from "@/lib/data";
import {
  riskEngine,
  RiskAssessment,
  AuditEvent,
  ModelMetrics,
} from "@/lib/risk-engine";
import { fraudMLInstance } from "@/lib/ml-engine";

export interface SentinelContextType {
  transactions: Transaction[];
  alerts: AlertItem[];
  cases: InvestigationCase[];
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  auditEvents: AuditEvent[];
  modelMetrics: ModelMetrics | null;
  selectedCase: InvestigationCase;
  selectedTransaction: Transaction | null;
  isStreaming: boolean;
  aiTrained: boolean;
  unreadAlertsCount: number;
  setSelectedCase: (c: InvestigationCase) => void;
  setSelectedTransaction: (t: Transaction | null) => void;
  toggleStreaming: () => void;
  markAlertAsRead: (alertId: string) => void;
  injectScenario: (scenario: "mule" | "ato" | "velocity" | "sim_swap" | "normal" | Partial<Transaction>) => Promise<Transaction>;
  executeAnalystAction: (
    caseId: string,
    action: "HOLD" | "STEP_UP" | "RELEASE" | "ESCALATE" | "MARK_SAFE",
    notes?: string
  ) => void;
  runModelEvaluation: () => ModelMetrics;
  getCaseByTransactionId: (txnId: string) => InvestigationCase | undefined;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

export const SentinelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [cases, setCases] = useState<InvestigationCase[]>(initialCases);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>(initialNodes);
  const [networkEdges, setNetworkEdges] = useState<NetworkEdge[]>(initialEdges);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(riskEngine.auditLog.getEvents());
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase>(initialCases[0]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [aiTrained, setAiTrained] = useState<boolean>(false);

  // Train local Neural Network on mount and initialize benchmark metrics
  useEffect(() => {
    fraudMLInstance.trainModel(initialTransactions).then(() => {
      setAiTrained(true);
    });

    // Run authentic benchmark evaluation on held-out test dataset
    const evaluation = riskEngine.evaluateBenchmark();
    setModelMetrics(evaluation.metrics);
  }, []);

  // Compute unread alerts count
  const unreadAlertsCount = alerts.filter((a) => a.unread).length;

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, unread: false } : a))
    );
  }, []);

  const toggleStreaming = useCallback(() => {
    setIsStreaming((prev) => !prev);
  }, []);

  const runModelEvaluation = useCallback(() => {
    const evaluation = riskEngine.evaluateBenchmark();
    setModelMetrics(evaluation.metrics);
    const auditEv = riskEngine.auditLog.recordEvent({
      eventType: "MODEL_EVALUATED",
      actor: "EVALUATION_HARNESS",
      details: `Held-out test benchmark evaluated (${evaluation.metrics.totalSamples} samples). F1: ${evaluation.metrics.f1Score}, Precision: ${evaluation.metrics.precision}, Recall: ${evaluation.metrics.recall}`,
      metadata: { metrics: evaluation.metrics },
    });
    setAuditEvents(riskEngine.auditLog.getEvents());
    return evaluation.metrics;
  }, []);

  // Centralized unified pipeline: Injects any transaction/scenario and propagates across ALL surfaces
  const injectScenario = useCallback(
    async (
      scenario: "mule" | "ato" | "velocity" | "sim_swap" | "normal" | Partial<Transaction>
    ): Promise<Transaction> => {
      let partialTxn: Partial<Transaction> = {};

      if (scenario === "mule") {
        partialTxn = {
          customer: "U-1042",
          recipient: "U-8831",
          amount: 48500,
          type: "Wallet Transfer",
          device: "DEV-8821",
          isNewDevice: true,
          location: "Dhaka",
          isNewLocation: false,
          time: "02:13 AM",
          flags: [
            "Amount 4.8× above normal baseline",
            "Unrecognized hardware device DEV-8821",
            "Target wallet U-8831 linked to mule syndicate #17",
            "Off-hours nocturnal execution (02:13 AM)",
          ],
        };
      } else if (scenario === "ato") {
        partialTxn = {
          customer: "U-2214",
          recipient: "U-9210",
          amount: 32000,
          type: "Cash Out",
          device: "DEV-9932",
          isNewDevice: true,
          location: "Chattogram",
          isNewLocation: true,
          time: "03:15 AM",
          flags: [
            "USSD credential reset preceding transaction",
            "Geographic jump: Dhaka to Chattogram in 40 min",
            "Immediate full-balance cash-out attempt",
          ],
        };
      } else if (scenario === "sim_swap") {
        partialTxn = {
          customer: "U-9182",
          recipient: "U-9901",
          amount: 98000,
          type: "Wallet Transfer",
          device: "DEV-9901",
          isNewDevice: true,
          location: "Sylhet",
          isNewLocation: true,
          time: "03:45 AM",
          flags: [
            "Sim swap detected",
            "Max limit transfer",
            "Unrecognized IP address",
          ],
        };
      } else if (scenario === "velocity") {
        partialTxn = {
          customer: "U-8821",
          recipient: "U-4412",
          amount: 18500,
          type: "Wallet Transfer",
          device: "DEV-8821",
          isNewDevice: false,
          location: "Dhaka",
          isNewLocation: false,
          time: "01:22 AM",
          flags: [
            "Micro-structuring velocity: 6 transfers in 180 seconds",
            "Recipient linked to mule cluster #17",
          ],
        };
      } else if (scenario === "normal") {
        partialTxn = {
          customer: "U-2910",
          recipient: "M-291",
          amount: 2450,
          type: "Merchant Pay",
          device: "DEV-2211",
          isNewDevice: false,
          location: "Dhaka",
          isNewLocation: false,
          time: "02:30 PM",
          flags: ["Within regular daytime spending pattern", "Verified merchant terminal"],
        };
      } else {
        partialTxn = scenario;
      }

      // Check ML probability if model is trained
      let mlProb: number | undefined;
      if (fraudMLInstance.isTrained) {
        try {
          mlProb = await fraudMLInstance.predict(partialTxn);
        } catch {
          // graceful fallback
        }
      }

      // 1. Evaluate through centralized Risk Engine
      const assessment: RiskAssessment = riskEngine.evaluateTransaction(partialTxn, {
        mlProbability: mlProb,
      });

      const txnId = partialTxn.id || `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const amount = Number(partialTxn.amount) || 0;

      const completeTxn: Transaction = {
        id: txnId,
        customer: partialTxn.customer || "U-1042",
        recipient: partialTxn.recipient || "U-8831",
        amount,
        type: partialTxn.type || "Wallet Transfer",
        device: partialTxn.device || "DEV-2211",
        isNewDevice: partialTxn.isNewDevice ?? false,
        location: partialTxn.location || "Dhaka",
        isNewLocation: partialTxn.isNewLocation ?? false,
        time: partialTxn.time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now(),
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        status:
          assessment.riskLevel === "Critical"
            ? "Investigating"
            : assessment.riskLevel === "High"
            ? "Flagged"
            : assessment.riskLevel === "Medium"
            ? "Monitoring"
            : "Approved",
        flags: [
          ...assessment.rulesTriggered.map((r) => r.description),
          ...assessment.anomalies.map((a) => a.description),
        ],
      };

      // 2. Propagate to Transactions State
      setTransactions((prev) => [completeTxn, ...prev]);

      // 3. Update Audit Trail (Immutable Log)
      riskEngine.auditLog.recordEvent({
        eventType: "TRANSACTION_EVALUATED",
        actor: "SENTINEL_ENGINE",
        relatedId: completeTxn.id,
        details: `Transaction evaluated: ৳${amount.toLocaleString()} from ${completeTxn.customer} to ${completeTxn.recipient}. Risk: ${assessment.riskLevel} (${assessment.riskScore}/100).`,
        metadata: { assessment },
      });

      // 4. If High or Critical Risk, propagate to Alerts, Cases, and Network Graph!
      if (assessment.riskLevel === "Critical" || assessment.riskLevel === "High") {
        const caseId = `INV-${completeTxn.customer.replace("U-", "")}`;

        // Create Alert
        const newAlert: AlertItem = {
          id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          severity: assessment.riskLevel,
          title: `${assessment.riskLevel === "Critical" ? "Critical Risk" : "Suspicious"} Transaction Flagged`,
          description: `${assessment.rulesTriggered[0]?.ruleName || assessment.anomalies[0]?.description || "Anomaly detected"} (৳${amount.toLocaleString()} on ${completeTxn.customer})`,
          timeAgo: "Just now",
          iconType: assessment.networkRisk.isMuleCluster ? "network" : "shield",
          confidence: assessment.confidence,
          relatedId: caseId,
          unread: true,
        };

        setAlerts((prev) => [newAlert, ...prev]);

        riskEngine.auditLog.recordEvent({
          eventType: "ALERT_TRIGGERED",
          actor: "ALERT_DISPATCHER",
          relatedId: newAlert.id,
          details: `Alert dispatched for case ${caseId}: ${newAlert.title}`,
        });

        // Create or update Case
        setCases((prev) => {
          const existingIndex = prev.findIndex((c) => c.customer === completeTxn.customer || c.id === caseId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              amount: existing.amount + amount,
              exposure: existing.exposure + amount,
              riskScore: Math.max(existing.riskScore, assessment.riskScore),
              riskLevel: assessment.riskLevel === "Critical" ? "Critical" : existing.riskLevel,
              transactionsCount: existing.transactionsCount + 1,
              updated: "Just now",
              summary: `${existing.summary} Latest transaction ${completeTxn.id} of ৳${amount.toLocaleString()} evaluated at score ${assessment.riskScore}/100.`,
            };
            return updated;
          } else {
            const newCase: InvestigationCase = {
              id: caseId,
              riskLevel: assessment.riskLevel,
              customer: completeTxn.customer,
              amount,
              reason: assessment.rulesTriggered[0]?.ruleName || "Multi-vector Anomaly",
              analyst: "Arman Hossen",
              status: "Investigating",
              updated: "Just now",
              createdTime: `Today at ${completeTxn.time}`,
              exposure: amount * 1.5,
              transactionsCount: 1,
              networkConnections: 3,
              riskScore: assessment.riskScore,
              summary: assessment.explanationSummary,
              recommendation: assessment.recommendedActions[0]?.reason || "Manual verification required.",
              confidence: assessment.confidence,
            };
            return [newCase, ...prev];
          }
        });

        riskEngine.auditLog.recordEvent({
          eventType: "CASE_CREATED",
          actor: "CASE_MANAGEMENT",
          relatedId: caseId,
          details: `Investigation case ${caseId} updated with transaction ${completeTxn.id}.`,
        });

        // Update Network Graph (Add nodes/edges if new, mark hot)
        setNetworkNodes((prev) => {
          const nodes = [...prev];
          if (!nodes.some((n) => n.id === completeTxn.customer)) {
            nodes.push({
              id: completeTxn.customer,
              label: completeTxn.customer,
              type: "customer",
              risk: assessment.riskLevel,
              x: 200 + Math.floor(Math.random() * 200),
              y: 200 + Math.floor(Math.random() * 150),
              clusterId: assessment.networkRisk.clusterId,
              details: "Injected Customer Account",
            });
          }
          if (!nodes.some((n) => n.id === completeTxn.recipient)) {
            nodes.push({
              id: completeTxn.recipient,
              label: completeTxn.recipient,
              type: "recipient",
              risk: assessment.riskLevel,
              x: 400 + Math.floor(Math.random() * 200),
              y: 200 + Math.floor(Math.random() * 150),
              clusterId: assessment.networkRisk.clusterId,
              details: "Injected Target Counterparty",
            });
          }
          return nodes;
        });

        setNetworkEdges((prev) => [
          {
            source: completeTxn.customer,
            target: completeTxn.recipient,
            amount,
            isHot: true,
            type: "transfer",
          },
          ...prev,
        ]);
      }

      // Update audit events state in UI
      setAuditEvents(riskEngine.auditLog.getEvents());

      return completeTxn;
    },
    []
  );

  // Analyst Decision Execution with Strict Human Oversight and Audit Trail
  const executeAnalystAction = useCallback(
    (
      caseId: string,
      action: "HOLD" | "STEP_UP" | "RELEASE" | "ESCALATE" | "MARK_SAFE",
      notes?: string
    ) => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return;

      let newStatus: InvestigationCase["status"] = targetCase.status;
      let actionDetails = "";

      switch (action) {
        case "HOLD":
          newStatus = "Investigating";
          actionDetails = `Analyst placed settlement hold on recipient wallet for case ${caseId}. Human verification requested.`;
          break;
        case "STEP_UP":
          newStatus = "Pending Review";
          actionDetails = `Biometric & OTP step-up challenge triggered for customer ${targetCase.customer}.`;
          break;
        case "ESCALATE":
          newStatus = "Escalated";
          actionDetails = `Case ${caseId} escalated to Senior AML Committee & Legal Staging.`;
          break;
        case "RELEASE":
          newStatus = "Resolved";
          actionDetails = `Case ${caseId} verified and approved by analyst. Hold released.`;
          break;
        case "MARK_SAFE":
          newStatus = "Resolved";
          actionDetails = `Case ${caseId} marked as False Positive / Safe by analyst. Telemetry routed to negative learning pipeline.`;
          break;
      }

      if (notes) actionDetails += ` Notes: "${notes}"`;

      // Update Cases
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: newStatus, updated: "Just now" } : c))
      );

      // Log in centralized Audit Trail
      riskEngine.auditLog.recordEvent({
        eventType: "ANALYST_ACTION",
        actor: "ANALYST: Arman Hossen",
        relatedId: caseId,
        details: actionDetails,
        metadata: { action, notes, caseId, customer: targetCase.customer },
      });

      setAuditEvents(riskEngine.auditLog.getEvents());
    },
    [cases]
  );

  const getCaseByTransactionId = useCallback(
    (txnId: string) => {
      const txn = transactions.find((t) => t.id === txnId);
      if (!txn) return undefined;
      return cases.find((c) => c.customer === txn.customer);
    },
    [transactions, cases]
  );

  return (
    <SentinelContext.Provider
      value={{
        transactions,
        alerts,
        cases,
        networkNodes,
        networkEdges,
        auditEvents,
        modelMetrics,
        selectedCase,
        selectedTransaction,
        isStreaming,
        aiTrained,
        unreadAlertsCount,
        setSelectedCase,
        setSelectedTransaction,
        toggleStreaming,
        markAlertAsRead,
        injectScenario,
        executeAnalystAction,
        runModelEvaluation,
        getCaseByTransactionId,
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
};

export const useSentinel = (): SentinelContextType => {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error("useSentinel must be used within a SentinelProvider");
  }
  return context;
};
