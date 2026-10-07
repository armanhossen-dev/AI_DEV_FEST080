import { AuditEvent } from "./types";

class AuditLogService {
  private events: AuditEvent[] = [];

  constructor() {
    // Seed initial baseline audit events
    this.recordEvent({
      eventType: "SYSTEM_CONFIG",
      actor: "SYSTEM_SENTINEL",
      details: "Sentinel Risk Engine initialized with 6 multi-signal risk layers and Bangladesh Bank compliance rules.",
      metadata: { version: "v2.6-enterprise", environment: "production-prototype" },
    });
    this.recordEvent({
      eventType: "CASE_CREATED",
      actor: "SENTINEL_AUTO_ESCALATION",
      relatedId: "INV-1042",
      details: "Automated case created for customer U-1042 (Score: 94/100, Mule Syndicate Cluster #17 link).",
    });
  }

  public recordEvent(entry: Omit<AuditEvent, "id" | "timestamp" | "isoTime">): AuditEvent {
    const now = new Date();
    const event: AuditEvent = {
      id: `AUDIT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      isoTime: now.toISOString(),
      eventType: entry.eventType,
      actor: entry.actor,
      relatedId: entry.relatedId,
      details: entry.details,
      metadata: entry.metadata,
    };

    this.events.unshift(event);

    // Keep memory clean
    if (this.events.length > 500) {
      this.events = this.events.slice(0, 500);
    }

    return event;
  }

  public getEvents(filter?: { eventType?: string; relatedId?: string }): AuditEvent[] {
    let result = [...this.events];
    if (filter?.eventType) {
      result = result.filter((e) => e.eventType === filter.eventType);
    }
    if (filter?.relatedId) {
      result = result.filter((e) => e.relatedId === filter.relatedId);
    }
    return result;
  }

  public clear() {
    this.events = [];
  }
}

export const auditLogger = new AuditLogService();
