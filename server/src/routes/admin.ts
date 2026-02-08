import { Router, Request, Response } from "express";
import { dbAll, dbGet } from "../db/init";
import { getAgentManager } from "../agents/manager";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);
router.use(adminOnly);

router.get("/customers", (_req: Request, res: Response): void => {
  const customers = dbAll("SELECT * FROM customers ORDER BY created_at DESC");
  res.json({ customers });
});

router.get("/agents", (_req: Request, res: Response): void => {
  const agents = dbAll(
    "SELECT a.*, c.email as customer_email, c.name as customer_name FROM agents a LEFT JOIN customers c ON a.customer_id = c.id ORDER BY a.created_at DESC"
  );
  const manager = getAgentManager();
  const enriched = agents.map((agent: any) => ({
    ...agent,
    runtime_status: manager.getStatus(agent.id),
  }));
  res.json({ agents: enriched });
});

router.post("/agents/:id/start", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await getAgentManager().startAgent(id);
    res.json({ success: true, message: "Agent " + id + " started" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/agents/:id/stop", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await getAgentManager().stopAgent(id);
    res.json({ success: true, message: "Agent " + id + " stopped" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/agents/:id/restart", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await getAgentManager().restartAgent(id);
    res.json({ success: true, message: "Agent " + id + " restarted" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/agents/:id/logs", (req: Request, res: Response): void => {
  const id = req.params.id as string;
  const limit = parseInt(String(req.query.limit || "100"), 10);
  const offset = parseInt(String(req.query.offset || "0"), 10);
  const logs = dbAll(
    "SELECT * FROM agent_logs WHERE agent_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [id, limit, offset]
  );
  const totalRow = dbGet("SELECT COUNT(*) as c FROM agent_logs WHERE agent_id = ?", [id]);
  res.json({ logs, total: totalRow ? totalRow.c || 0 : 0 });
});

router.get("/stats", (_req: Request, res: Response): void => {
  const manager = getAgentManager();
  const g = (sql: string) => (dbGet(sql) || { c: 0 }).c;
  const totalCustomers = g("SELECT COUNT(*) as c FROM customers");
  const activeCustomers = g("SELECT COUNT(*) as c FROM customers WHERE status = 'active'");
  const totalAgents = g("SELECT COUNT(*) as c FROM agents");
  const runningAgents = manager.listRunning().length;
  const errorAgents = g("SELECT COUNT(*) as c FROM agents WHERE status = 'error'");
  const totalLogs = g("SELECT COUNT(*) as c FROM agent_logs");
  const todayLogs = g("SELECT COUNT(*) as c FROM agent_logs WHERE date(created_at) = date('now')");
  const planCounts = dbAll("SELECT plan, COUNT(*) as count FROM customers WHERE status = 'active' GROUP BY plan");
  const planPrices: Record<string, number> = { starter: 29, pro: 79, enterprise: 299 };
  const monthlyRevenue = planCounts.reduce((total: number, row: any) => total + (planPrices[row.plan] || 0) * (row.count || 0), 0);
  res.json({ totalCustomers, activeCustomers, totalAgents, runningAgents, errorAgents, totalLogs, todayLogs, monthlyRevenue, planBreakdown: planCounts });
});

export default router;
