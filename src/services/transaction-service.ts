import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  DbTransaction,
  RiskAssessment,
  RiskLevel,
  TransactionStatus,
  TransactionFeatures,
  RiskFactorItem,
} from "@/types";
import { evaluateTransaction } from "@/lib/risk-engine";
import { generateCuratedDemoState } from "./demo-data-service";

const localState = generateCuratedDemoState();

export interface GetTransactionsOptions {
  page?: number;
  limit?: number;
  search?: string;
  riskLevel?: RiskLevel | "all";
  status?: string | "all";
  sortBy?: "recent" | "risk" | "amount";
}

export interface GetTransactionsResult {
  transactions: (DbTransaction & { assessment?: RiskAssessment })[];
  totalCount: number;
}

export async function fetchTransactions(
  options: GetTransactionsOptions = {}
): Promise<GetTransactionsResult> {
  const {
    page = 1,
    limit = 25,
    search = "",
    riskLevel = "all",
    status = "all",
    sortBy = "recent",
  } = options;

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          risk_assessments (
            id,
            fraud_score,
            anomaly_score,
            account_risk_score,
            final_risk_score,
            risk_level,
            confidence,
            explanation_summary,
            recommended_action
          )
        `, { count: "exact" });

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`transaction_reference.ilike.${term},sender_name.ilike.${term},receiver_name.ilike.${term},location.ilike.${term}`);
      }

      if (status !== "all") {
        query = query.eq("transaction_status", status);
      }

      if (sortBy === "recent") {
        query = query.order("timestamp", { ascending: false });
      } else if (sortBy === "amount") {
        query = query.order("amount", { ascending: false });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        let results = data.map((t: any) => ({
          ...t,
          assessment: Array.isArray(t.risk_assessments)
            ? t.risk_assessments[0]
            : t.risk_assessments,
        }));

        if (riskLevel !== "all") {
          results = results.filter((r) => r.assessment?.risk_level === riskLevel);
        }

        if (sortBy === "risk") {
          results.sort(
            (a, b) =>
              (b.assessment?.final_risk_score || 0) - (a.assessment?.final_risk_score || 0)
          );
        }

        return {
          transactions: results,
          totalCount: count || results.length,
        };
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local dataset:", err);
    }
  }

  // Fallback to local curated state
  let filtered = [...localState.transactions];
  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.transaction_reference.toLowerCase().includes(s) ||
        t.sender_name.toLowerCase().includes(s) ||
        t.receiver_name.toLowerCase().includes(s) ||
        t.location.toLowerCase().includes(s)
    );
  }

  if (status !== "all") {
    filtered = filtered.filter((t) => t.transaction_status === status);
  }

  let mapped = filtered.map((t) => ({
    ...t,
    assessment: localState.assessments[t.id],
  }));

  if (riskLevel !== "all") {
    mapped = mapped.filter((t) => t.assessment?.risk_level === riskLevel);
  }

  if (sortBy === "recent") {
    mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } else if (sortBy === "amount") {
    mapped.sort((a, b) => b.amount - a.amount);
  } else if (sortBy === "risk") {
    mapped.sort(
      (a, b) =>
        (b.assessment?.final_risk_score || 0) - (a.assessment?.final_risk_score || 0)
    );
  }

  const totalCount = mapped.length;
  const paged = mapped.slice((page - 1) * limit, page * limit);

  return { transactions: paged, totalCount };
}

export async function fetchTransactionById(id: string): Promise<{
  transaction: DbTransaction;
  assessment: RiskAssessment;
  features: TransactionFeatures;
  factors: RiskFactorItem[];
} | null> {
  if (isSupabaseConfigured) {
    try {
      const { data: txn, error: txnErr } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (txn && !txnErr) {
        // Fetch assessment
        const { data: assess } = await supabase
          .from("risk_assessments")
          .select("*")
          .eq("transaction_id", id)
          .maybeSingle();

        // Fetch factors
        let factors: RiskFactorItem[] = [];
        if (assess) {
          const { data: factorRows } = await supabase
            .from("risk_factors")
            .select("*")
            .eq("assessment_id", assess.id);
          factors = factorRows || [];
        }

        // Fetch features
        const { data: feats } = await supabase
          .from("transaction_features")
          .select("*")
          .eq("transaction_id", id)
          .maybeSingle();

        if (assess && feats) {
          return {
            transaction: txn as DbTransaction,
            assessment: { ...assess, factors } as RiskAssessment,
            features: feats as TransactionFeatures,
            factors,
          };
        }
      }
    } catch (err) {
      console.warn("Error loading single txn from Supabase:", err);
    }
  }

  // Fallback to local evaluation
  const localTxn = localState.transactions.find((t) => t.id === id);
  if (!localTxn) return null;

  let localAssess = localState.assessments[localTxn.id];
  const evalResult = evaluateTransaction(localTxn);

  if (!localAssess) {
    localAssess = {
      id: `assess-${localTxn.id}`,
      transaction_id: localTxn.id,
      fraud_score: evalResult.fraud_score,
      anomaly_score: evalResult.anomaly_score,
      account_risk_score: evalResult.account_risk_score,
      final_risk_score: evalResult.final_risk_score,
      risk_level: evalResult.risk_level,
      confidence: evalResult.confidence,
      model_version: "v1.4.2-sentinel-fusion",
      explanation_summary: evalResult.explanation_summary,
      recommended_action: evalResult.recommended_action,
      created_at: localTxn.created_at,
      factors: evalResult.factors,
    };
  }

  return {
    transaction: localTxn,
    assessment: localAssess,
    features: evalResult.features,
    factors: evalResult.factors,
  };
}

export async function createLiveTransaction(
  payload: Omit<DbTransaction, "id" | "created_at">
): Promise<DbTransaction> {
  const evaluated = evaluateTransaction(payload);
  const newId = `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const createdTxn: DbTransaction = {
    ...payload,
    id: newId,
    created_at: new Date().toISOString(),
  };

  // Add to local state first for immediate UI reactivity
  localState.transactions.unshift(createdTxn);
  localState.assessments[newId] = {
    id: `assess-${newId}`,
    transaction_id: newId,
    fraud_score: evaluated.fraud_score,
    anomaly_score: evaluated.anomaly_score,
    account_risk_score: evaluated.account_risk_score,
    final_risk_score: evaluated.final_risk_score,
    risk_level: evaluated.risk_level,
    confidence: evaluated.confidence,
    model_version: "v1.4.2-sentinel-fusion",
    explanation_summary: evaluated.explanation_summary,
    recommended_action: evaluated.recommended_action,
    created_at: createdTxn.created_at,
    factors: evaluated.factors,
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          transaction_reference: payload.transaction_reference,
          sender_name: payload.sender_name,
          sender_phone_masked: payload.sender_phone_masked,
          receiver_name: payload.receiver_name,
          receiver_phone_masked: payload.receiver_phone_masked,
          amount: payload.amount,
          currency: payload.currency || "BDT",
          transaction_type: payload.transaction_type,
          timestamp: payload.timestamp,
          device_id: payload.device_id,
          device_new: payload.device_new,
          location: payload.location,
          beneficiary_new: payload.beneficiary_new,
          ip_risk: payload.ip_risk,
          transaction_status: payload.transaction_status,
        })
        .select()
        .single();

      if (data && !error) {
        // Also insert assessment into Supabase
        await supabase.from("risk_assessments").insert({
          transaction_id: data.id,
          fraud_score: evaluated.fraud_score,
          anomaly_score: evaluated.anomaly_score,
          account_risk_score: evaluated.account_risk_score,
          final_risk_score: evaluated.final_risk_score,
          risk_level: evaluated.risk_level,
          confidence: evaluated.confidence,
          explanation_summary: evaluated.explanation_summary,
          recommended_action: evaluated.recommended_action,
        });
        return data as DbTransaction;
      }
    } catch (err) {
      console.warn("Supabase live insertion failed:", err);
    }
  }

  return createdTxn;
}
