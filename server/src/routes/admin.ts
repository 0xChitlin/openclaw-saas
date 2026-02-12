import { Router, Request, Response } from "express";
import { getDb } from "../db/init";
import { getAgentManager } from "../agents/manager";
import { authMiddleware, adminOnly } from "../middleware/auth";
const router = Router();
router.use(authMiddleware); router.use(adminOnly);

router.get("/customers", (_req: Request, res: Response): void => { res.json({ customers: getDb().prepare("SELECT * FROM customers ORDER BY created_at DESC").all() }); });

router.get("/agents", (_req: Request, res: Response): void => {
  const agents = getDb().prepare("SELECT a.*, c.email as customer_email FROM agents a LEFT JOIN customers c ON a.customer_id = c.id ORDER BY a.created_at DESC").all() as any[];
  const m = getAgentManager();
  res.json({ agents: agents.map(a => ({ ...a, runtime_status: m.getStatus(a.id) })) });
});

router.post("/agents/:id/start", async (req: Request, res: Response): Promise<void> => { try { await getAgentManager().startAgent(String(req.params.id)); res.json({ success: true }); } catch (e: any) { res.status(500).json({ error: e.message }); } });
router.post("/agents/:id/stop", async (req: Request, res: Response): Promise<void> => { try { await getAgentManager().stopAgent(String(req.params.id)); res.json({ success: true }); } catch (e: any) { res.status(500).json({ error: e.message }); } });
router.post("/agents/:id/restart", async (req: Request, res: Response): Promise<void> => { try { await getAgentManager().restartAgent(String(req.params.id)); res.json({ success: true }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

router.get("/agents/:id/logs", (req: Request, res: Response): void => {
  const id = String(req.params.id); const lim = parseInt(String(req.query.limit||"100")); const off = parseInt(String(req.query.offset||"0"));
  const db = getDb();
  res.json({ logs: db.prepare("SELECT * FROM agent_logs WHERE agent_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?").all(id, lim, off), total: (db.prepare("SELECT COUNT(*) as count FROM agent_logs WHERE agent_id = ?").get(id) as any).count });
});

router.get("/stats", (_req: Request, res: Response): void => {
  const db = getDb(); const m = getAgentManager();
  const g = (s: string) => (db.prepare(s).get() as any).count;
  const pc = db.prepare("SELECT plan, COUNT(*) as count FROM customers WHERE status = 'active' GROUP BY plan").all() as any[];
  const pp: Record<string,number> = { starter: 29, pro: 79, enterprise: 299 };
  res.json({ totalCustomers: g("SELECT COUNT(*) as count FROM customers"), activeCustomers: g("SELECT COUNT(*) as count FROM customers WHERE status = 'active'"), totalAgents: g("SELECT COUNT(*) as count FROM agents"), runningAgents: m.listRunning().length, errorAgents: g("SELECT COUNT(*) as count FROM agents WHERE status = 'error'"), totalLogs: g("SELECT COUNT(*) as count FROM agent_logs"), todayLogs: g("SELECT COUNT(*) as count FROM agent_logs WHERE date(created_at) = date('now')"), monthlyRevenue: pc.reduce((t: number, r: any) => t + (pp[r.plan]||0)*r.count, 0), planBreakdown: pc });
});

export default router;
