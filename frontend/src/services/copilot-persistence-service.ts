import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AiAgentSession {
  id: string;
  user_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AiAgentMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  tool_name?: string;
  tool_metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Creates or retrieves a persistent AI Agent investigation session.
 */
export async function createCopilotSession(
  title: string,
  userId?: string
): Promise<AiAgentSession> {
  const nowIso = new Date().toISOString();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("ai_agent_sessions")
        .insert({
          title,
          user_id: userId || null,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select()
        .single();

      if (!error && data) {
        return data as AiAgentSession;
      }
    } catch (err) {
      console.warn("Failed to create AI agent session in Supabase:", err);
    }
  }

  return {
    id: `SESSION-${Date.now()}`,
    user_id: userId,
    title,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

/**
 * Persists an AI message, including tool call records and telemetry references.
 */
export async function saveCopilotMessage(params: {
  sessionId: string;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  toolName?: string;
  toolMetadata?: Record<string, any>;
}): Promise<AiAgentMessage> {
  const { sessionId, role, content, toolName, toolMetadata } = params;
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("ai_agent_messages")
        .insert({
          session_id: sessionId,
          role,
          content,
          tool_name: toolName || null,
          tool_metadata: toolMetadata || null,
          created_at: nowIso,
        })
        .select()
        .single();

      if (!error && data) {
        return data as AiAgentMessage;
      }
    } catch (err) {
      console.warn("Failed to persist AI message:", err);
    }
  }

  return {
    id: `MSG-${Date.now()}`,
    session_id: sessionId,
    role,
    content,
    tool_name: toolName,
    tool_metadata: toolMetadata,
    created_at: nowIso,
  };
}

/**
 * Retrieves chat history for a session.
 */
export async function getCopilotMessages(sessionId: string): Promise<AiAgentMessage[]> {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from("ai_agent_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (data) return data as AiAgentMessage[];
    } catch (err) {
      console.warn("Failed to retrieve AI messages:", err);
    }
  }
  return [];
}
