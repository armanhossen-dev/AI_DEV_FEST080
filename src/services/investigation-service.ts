import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  InvestigationCase,
  InvestigationAction,
  InvestigationStatus,
  InvestigationDecision,
  RiskSeverity,
  TransactionStatus,
} from "@/types";
import { generateCuratedDemoState } from "./demo-data-service";

const localState = generateCuratedDemoState();

export async function fetchInvestigations(statusFilter: string = "all"): Promise<InvestigationCase[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from("investigations")
        .select(`
          *,
          transactions (
            id,
            transaction_reference,
            sender_name,
            sender_phone_masked,
            receiver_name,
            receiver_phone_masked,
            amount,
            currency,
            transaction_type,
            timestamp,
            device_id,
            device_new,
            location,
            beneficiary_new,
            ip_risk,
            transaction_status
          ),
          actions:investigation_actions (
            id,
            action_type,
            actor_name,
            action_details,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((inv: any) => ({
          ...inv,
          transaction: inv.transactions,
          actions: inv.actions || [],
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch investigations failed, using local state:", err);
    }
  }

  // Fallback local state
  let cases = [...localState.investigations];
  if (statusFilter !== "all") {
    cases = cases.filter((c) => c.status === statusFilter);
  }
  return cases;
}

export async function fetchInvestigationById(id: string): Promise<InvestigationCase | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("investigations")
        .select(`
          *,
          transactions (
            id,
            transaction_reference,
            sender_name,
            sender_phone_masked,
            receiver_name,
            receiver_phone_masked,
            amount,
            currency,
            transaction_type,
            timestamp,
            device_id,
            device_new,
            location,
            beneficiary_new,
            ip_risk,
            transaction_status
          ),
          actions:investigation_actions (
            id,
            action_type,
            actor_name,
            action_details,
            created_at
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          transaction: data.transactions,
          actions: data.actions || [],
        };
      }
    } catch (err) {
      console.warn("Fetch investigation by id error:", err);
    }
  }

  return localState.investigations.find((c) => c.id === id) || null;
}

export async function performInvestigationDecision(params: {
  investigationId?: string;
  transactionId: string;
  decision: InvestigationDecision;
  actorName: string;
  actorId?: string | null;
  notes?: string;
}): Promise<{ success: boolean; newStatus: TransactionStatus }> {
  const { investigationId, transactionId, decision, actorName, actorId, notes } = params;

  let newTxnStatus: TransactionStatus = "completed";
  let newInvStatus: InvestigationStatus = "resolved";

  switch (decision) {
    case "approved":
      newTxnStatus = "completed";
      newInvStatus = "resolved";
      break;
    case "held":
      newTxnStatus = "held";
      newInvStatus = "investigating";
      break;
    case "blocked":
      newTxnStatus = "blocked";
      newInvStatus = "resolved";
      break;
    case "false_positive":
      newTxnStatus = "completed";
      newInvStatus = "resolved";
      break;
  }

  const nowIso = new Date().toISOString();

  // 1. Update in-memory / local cache
  const cachedTxn = localState.transactions.find((t) => t.id === transactionId);
  if (cachedTxn) {
    cachedTxn.transaction_status = newTxnStatus;
  }

  let targetInv = localState.investigations.find(
    (i) => i.id === investigationId || i.transaction_id === transactionId
  );

  if (targetInv) {
    targetInv.status = newInvStatus;
    targetInv.final_decision = decision;
    targetInv.updated_at = nowIso;
    if (newInvStatus === "resolved") {
      targetInv.resolved_at = nowIso;
    }
    if (notes) {
      targetInv.investigator_notes = notes;
    }
  }

  const actionRecord: InvestigationAction = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    investigation_id: targetInv?.id || investigationId || "inv-direct",
    actor_id: actorId || null,
    actor_name: actorName || "Lead Fraud Analyst",
    action_type:
      decision === "approved"
        ? "approved_transaction"
        : decision === "held"
        ? "held_transaction"
        : decision === "blocked"
        ? "blocked_transaction"
        : "marked_false_positive",
    action_details: {
      decision,
      newTxnStatus,
      notes: notes || "Human investigator decision confirmed.",
      timestamp: nowIso,
    },
    created_at: nowIso,
  };
  localState.actions.unshift(actionRecord);

  // 2. Persist to Supabase Postgres
  if (isSupabaseConfigured) {
    try {
      // Update transaction status
      await supabase
        .from("transactions")
        .update({ transaction_status: newTxnStatus })
        .eq("id", transactionId);

      // If investigation exists, update it
      if (investigationId) {
        await supabase
          .from("investigations")
          .update({
            status: newInvStatus,
            final_decision: decision,
            updated_at: nowIso,
            resolved_at: newInvStatus === "resolved" ? nowIso : null,
            ...(notes ? { investigator_notes: notes } : {}),
          })
          .eq("id", investigationId);

        // Record audit trail
        await supabase.from("investigation_actions").insert({
          investigation_id: investigationId,
          actor_id: actorId || null,
          actor_name: actorName,
          action_type: actionRecord.action_type,
          action_details: actionRecord.action_details,
        });
      }
    } catch (err) {
      console.warn("Supabase decision write error:", err);
    }
  }

  return { success: true, newStatus: newTxnStatus };
}

export async function addInvestigationNote(
  investigationId: string,
  noteText: string,
  actorName: string
): Promise<void> {
  const nowIso = new Date().toISOString();

  // Update local
  const targetInv = localState.investigations.find((i) => i.id === investigationId);
  if (targetInv) {
    targetInv.investigator_notes = targetInv.investigator_notes
      ? `${targetInv.investigator_notes}\n[${nowIso.substring(11, 16)}] ${actorName}: ${noteText}`
      : `[${nowIso.substring(11, 16)}] ${actorName}: ${noteText}`;
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from("investigation_actions").insert({
        investigation_id: investigationId,
        actor_name: actorName,
        action_type: "added_note",
        action_details: { note: noteText, timestamp: nowIso },
      });
    } catch (err) {
      console.warn("Supabase add note error:", err);
    }
  }
}
