import { Router, Request, Response } from "express";
import { getDb } from "../db/init";
import { getAgentManager } from "../agents/manager";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/admin/customers — list all customers
router.get("/customers", (req: Request, res: Response): void => {
  const db = getDb();
  const customers = db.prepare("SELECT * FROM customers ORDER BY created_at DESC").all();
  res.json({ customers });
});

// GET /api/admin/agents — list all agents with status
router.get("/agents", (req: Request, res: Response): void => {
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

// POST /api/admin/agents/:id/start — start an agent
router.post("/agents/:id/start", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const manager = getAgentManager();

  try {
    await manager.startAgent(id);
    res.json({ success: true, message: `Agent ${id} started` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// POST /api/admin/agents/:id/stop — stop an agent
router.post("/agents/:id/stop", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const manager = getAgentManager();

  try {
    await manager.stopAgent(id);
    res.json({ success: true, message: `Agent ${id} stopped` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// POST /api/admin/agents/:id/restart — restart an agent
router.post("/agents/:id/restart", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const manager = getAgentManager();

  try {
    await manager.restartAgent(id);
    res.json({ success: true, message: `Agent ${id} restarted` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// GET /api/admin/agents/:id/logs — get agent logs
router.get("/agents/:id/logs", (req: Request, res: Response): void => {
  const { id } = req.params;
  const limit = parseInt(String(req.query.limit)) || 100;
  const offset = parseInt(String(req.query.offset)) || 0;

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

// GET /api/admin/stats — dashboard stats
router.get("/stats", (req: Request, res: Response): void => {
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

  // Revenue estimate based on plans
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
