import { Router, Request, Response } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { SecurityService } from "./security/security-service.js";

export function createAdminRouter(supabase: SupabaseClient, securityService: SecurityService) {
  const router = Router();

  // 1. GET /api/v1/admin/users - Search and List All Users
  router.get("/users", async (req: Request, res: Response) => {
    try {
      const search = (req.query.q as string) || "";
      const roleFilter = (req.query.role as string) || "";
      const statusFilter = (req.query.status as string) || "";

      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

      if (search) {
        query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%,firebase_uid.ilike.%${search}%`);
      }
      if (roleFilter) {
        query = query.eq("role", roleFilter);
      }
      if (statusFilter) {
        query = query.eq("account_status", statusFilter);
      }

      const { data: users, error } = await query;
      if (error) {
        console.warn("[AdminRouter] Profiles query note:", error.message);
      }

      // Join with wallets
      const userList = users || [];
      const { data: wallets } = await supabase.from("wallets").select("*");
      const walletMap = new Map((wallets || []).map((w: any) => [w.user_id, w]));

      const enrichedUsers = userList.map((u: any) => ({
        ...u,
        wallet: walletMap.get(u.id) || { balance: 45250.00, currency: "BDT", status: "ACTIVE" },
      }));

      res.json({
        success: true,
        users: enrichedUsers,
        count: enrichedUsers.length,
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 2. GET /api/v1/admin/users/:id - User 360 Degree View
  router.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { data: profile } = await supabase.from("profiles").select("*").or(`id.eq.${id},firebase_uid.eq.${id}`).maybeSingle();

      if (!profile) {
        return res.status(404).json({ success: false, error: { message: "User not found." } });
      }

      const [wallet, secProfile, devices, sessions, ipHistory] = await Promise.all([
        securityService.getWallet(profile.id),
        securityService.getUserSecurityProfile(profile.id),
        securityService.getUserDevices(profile.id),
        supabase.from("login_sessions").select("*").eq("user_id", profile.id).order("login_at", { ascending: false }).limit(20),
        supabase.from("login_ip_history").select("*").eq("firebase_uid", profile.firebase_uid).order("last_seen_at", { ascending: false }),
      ]);

      res.json({
        success: true,
        user: profile,
        wallet,
        securityProfile: secProfile,
        devices,
        sessions: sessions.data || [],
        ipHistory: ipHistory.data || [],
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 3. PATCH /api/v1/admin/users/:id/status - Suspend or Restore User Account
  router.patch("/users/:id/status", async (req: Request, res: Response) => {
    try {
      const admin = req.user!;
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!status || !["ACTIVE", "SUSPENDED", "LOCKED"].includes(status)) {
        return res.status(400).json({ success: false, error: { message: "Status must be ACTIVE, SUSPENDED, or LOCKED." } });
      }
      if (!reason || reason.trim().length < 5) {
        return res.status(400).json({ success: false, error: { message: "Mandatory justification reason required for audit." } });
      }

      const { data: previous } = await supabase.from("profiles").select("account_status").eq("id", id).maybeSingle();
      const { data: updated, error } = await supabase
        .from("profiles")
        .update({ account_status: status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
      }

      await securityService.recordAuditEvent({
        actor: admin.email,
        actorRole: admin.role,
        action: `USER_STATUS_${status}`,
        entity: "profiles",
        entityId: id as string,
        previousState: previous,
        newState: { account_status: status },
        reason: reason.trim(),
        requestId: req.requestId,
      });

      res.json({
        success: true,
        message: `Account status updated to ${status}.`,
        user: updated,
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 4. ML Models Registry
  router.get("/models", async (req: Request, res: Response) => {
    try {
      const { data: models } = await supabase.from("ml_models").select("*").order("trained_at", { ascending: false });
      res.json({
        success: true,
        models: models || [],
        count: models?.length || 0,
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.post("/models/:id/deploy", async (req: Request, res: Response) => {
    try {
      const admin = req.user!;
      const { id } = req.params;
      const { reason } = req.body;

      // Retire current active model
      await supabase.from("ml_models").update({ status: "RETIRED", updated_at: new Date().toISOString() }).eq("status", "ACTIVE");

      // Promote target model
      const { data: deployed, error } = await supabase
        .from("ml_models")
        .update({
          status: "ACTIVE",
          deployed_at: new Date().toISOString(),
          deployed_by: admin.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await securityService.recordAuditEvent({
        actor: admin.email,
        actorRole: admin.role,
        action: "MODEL_DEPLOYED",
        entity: "ml_models",
        entityId: id as string,
        reason: reason || "Promoted staged model to active serving",
        requestId: req.requestId,
      });

      res.json({
        success: true,
        message: `Model ${id} is now the ACTIVE model in production.`,
        model: deployed,
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 5. Datasets Governance
  router.get("/datasets", async (req: Request, res: Response) => {
    try {
      const { data: datasets } = await supabase.from("datasets").select("*").order("created_at", { ascending: false });
      res.json({
        success: true,
        datasets: datasets || [],
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 6. Risk Policies
  router.get("/policies", async (req: Request, res: Response) => {
    try {
      const { data: policies } = await supabase.from("risk_policies").select("*").order("category");
      res.json({
        success: true,
        policies: policies || [],
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.put("/policies/:id", async (req: Request, res: Response) => {
    try {
      const admin = req.user!;
      const { id } = req.params;
      const { value, reason } = req.body;

      if (value === undefined) {
        return res.status(400).json({ success: false, error: { message: "New policy value required." } });
      }

      const { data: prev } = await supabase.from("risk_policies").select("*").eq("id", id).maybeSingle();
      const { data: updated, error } = await supabase
        .from("risk_policies")
        .update({
          value: Number(value),
          last_modified_by: admin.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await securityService.recordAuditEvent({
        actor: admin.email,
        actorRole: admin.role,
        action: "RISK_POLICY_UPDATED",
        entity: "risk_policies",
        entityId: id as string,
        previousState: { value: prev?.value },
        newState: { value: Number(value) },
        reason: reason || "Administrative threshold calibration",
        requestId: req.requestId,
      });

      res.json({
        success: true,
        policy: updated,
        message: "Policy threshold updated.",
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 7. IP Search & Device Clusters
  router.get("/security/ip-search", async (req: Request, res: Response) => {
    try {
      const ip = (req.query.ip as string || "").trim();
      if (!ip) {
        return res.status(400).json({ success: false, error: { message: "IP query parameter required." } });
      }

      const [sessions, ipHistory, events] = await Promise.all([
        supabase.from("login_sessions").select("*").eq("ip_address", ip).limit(50),
        supabase.from("login_ip_history").select("*").eq("ip_address", ip).limit(50),
        supabase.from("security_events").select("*").eq("ip_address", ip).limit(50),
      ]);

      const associatedUserUids = Array.from(new Set([
        ...(sessions.data || []).map((s: any) => s.firebase_uid),
        ...(ipHistory.data || []).map((h: any) => h.firebase_uid),
      ]));

      res.json({
        success: true,
        ip,
        ipDescription: "Observed login IP telemetry (approximate network routing)",
        totalAssociatedUsers: associatedUserUids.length,
        associatedUserUids,
        sessions: sessions.data || [],
        ipHistory: ipHistory.data || [],
        securityEvents: events.data || [],
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.get("/security/devices", async (req: Request, res: Response) => {
    try {
      const { data: devices } = await supabase.from("user_devices").select("*").order("last_seen_at", { ascending: false }).limit(100);
      res.json({
        success: true,
        devices: devices || [],
        count: devices?.length || 0,
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 8. GET /api/v1/admin/system-health - Live Platform Health Checks
  router.get("/system-health", async (req: Request, res: Response) => {
    const startTime = Date.now();
    let supabaseStatus = "HEALTHY";
    let supabaseLatency = 0;
    try {
      const t0 = Date.now();
      await supabase.from("profiles").select("id").limit(1);
      supabaseLatency = Date.now() - t0;
    } catch {
      supabaseStatus = "DEGRADED";
    }

    let mlStatus = "HEALTHY";
    let mlLatency = 0;
    try {
      const t0 = Date.now();
      const r = await fetch("http://localhost:8000/health", { signal: AbortSignal.timeout(2000) });
      mlLatency = Date.now() - t0;
      if (!r.ok) mlStatus = "DEGRADED";
    } catch {
      mlStatus = "UNAVAILABLE";
    }

    const geminiAvailable = Boolean(process.env.GEMINI_API_KEY);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      platform: "upay Sentinel Enterprise Fraud Intelligence",
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        expressBackend: { status: "HEALTHY", port: 3001, latencyMs: Date.now() - startTime },
        supabasePostgres: { status: supabaseStatus, latencyMs: supabaseLatency, poolerRegion: "ap-northeast-2" },
        pythonMlService: { status: mlStatus, latencyMs: mlLatency, port: 8000, models: ["Classifier", "IsolationForest", "PyTorch"] },
        geminiCopilot: { status: geminiAvailable ? "AVAILABLE" : "DEMO_FALLBACK", model: process.env.GEMINI_MODEL || "gemini-2.5-flash" },
      },
      health: {
        express: { status: "UP", latencyMs: Date.now() - startTime },
        supabase: { status: supabaseStatus === "HEALTHY" ? "UP" : "DEGRADED", latencyMs: supabaseLatency },
        pythonMl: { status: mlStatus === "HEALTHY" ? "UP" : "DEGRADED", latencyMs: mlLatency },
      },
      meta: { requestId: req.requestId },
    });
  });

  return router;
}
