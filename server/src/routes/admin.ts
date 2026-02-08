import { Router, Request, Response } from "express";
import { getDb } from "../db/init";
import { getAgentManager } from "../agents/manager";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

// GET /api/admin/customers
router.get("/customers", (_req: Request, res: Response): void => {
  const db = getDb();
  const customers = db.prepare("SELECT * FROM customers ORDER BY created_at DESC").all();
  res.json({ customers });
});

// GET /api/admin/agents
router.get("/agents", (_req: Request, res: Response): void => {
  const db = getDb();
  const agents = db
    .prepare(
      `SELECT a.*, c.email as customer_email, c.name as customer_name
       FROM agents a
       LEFT JOIN customers c ON a.customer_id = c.id
       ORDER BY a.created_at DESC`
    )
    .all();

  const manager = getAgentManager();
  const enriched = (agents as any[]).map((agent) => ({
    ...agent,
    runtime_status: manager.getStatus(agent.id),
  }));

  res.json({ agents: enriched });
});

// POST /api/admin/agents/:id/start
router.post("/agents/:id/start", async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    await getAgentManager().startAgent(id);
    res.json({ success: true, message: `Agent ${id} started` });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/admin/agents/:id/stop
router.post("/agents/:id/stop", async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    await getAgentManager().stopAgent(id);
    res.json({ success: true, message: `Agent ${id} stopped` });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/admin/agents/:id/restart
router.post("/agents/:id/restart", async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    await getAgentManager().restartAgent(id);
    res.json({ success: true, message: `Agent ${id} restarted` });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/admin/agents/:id/logs
router.get("/agents/:id/logs", (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const limit = parseInt(String(req.query.limit || "100"), 10);
  const offset = parseInt(String(req.query.offset || "0"), 10);

  const db = getDb();
  const logs = db
    .prepare(
      `SELECT * FROM agent_logs
       WHERE agent_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(id, limit, offset);

  const total = db
    .prepare("SELECT COUNT(*) as count FROM agent_logs WHERE agent_id = ?")
    .get(id) as { count: number };

  res.json({ logs, total: total.count });
});

// GET /api/admin/stats
router.get("/stats", (_req: Request, res: Response): void => {
  const db = getDb();
  const manager = getAgentManager();

  const totalCustomers = (db.prepare("SELECT COUNT(*) as count FROM customers").get() as any).count;
  const activeCustomers = (
    db.prepare("SELECT COUNT(*) as count FROM customers WHERE status = 'active'").get() as any
  ).count;
  const totalAgents = (db.prepare("SELECT COUNT(*) as count FROM agents").get() as any).count;
  const runningAgents = manager.listRunning().length;
  const errorAgents = (
    db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'error'").get() as any
  ).count;
  const totalLogs = (db.prepare("SELECT COUNT(*) as count FROM agent_logs").get() as any).count;
  const todayLogs = (
    db
      .prepare("SELECT COUNT(*) as count FROM agent_logs WHERE date(created_at) = date('now')")
      .get() as any
  ).count;

  const planCounts = db
    .prepare(
      "SELECT plan, COUNT(*) as count FROM customers WHERE status = 'active' GROUP BY plan"
    )
    .all() as any[];

  const planPrices: Record<string, number> = { starter: 29, pro: 79, enterprise: 299 };
  const monthlyRevenue = planCounts.reduce((total: number, row: any) => {
    return total + (planPrices[row.plan] || 0) * row.count;
  }, 0);

  res.json({
    totalCustomers,
    activeCustomers,
    totalAgents,
    runningAgents,
    errorAgents,
    totalLogs,
    todayLogs,
    monthlyRevenue,
    planBreakdown: planCounts,
  });
});

export default router;
