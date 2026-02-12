import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDb, logAgent } from "../db/init";
import { getAgentManager } from "../agents/manager";
import { authMiddleware, customerOnly } from "../middleware/auth";
const router = Router();
router.use(authMiddleware); router.use(customerOnly);

router.get("/agent", (req: Request, res: Response): void => {
  const agents = getDb().prepare("SELECT * FROM agents WHERE customer_id = ? ORDER BY created_at DESC").all(req.user!.id) as any[];
  if (!agents.length) { res.json({ agent: null }); return; }
  const m = getAgentManager();
  res.json({ agents: agents.map(a => ({ ...a, config: JSON.parse(a.config||"{}"), runtime_status: m.getStatus(a.id) })) });
});

router.get("/logs", (req: Request, res: Response): void => {
  res.json({ logs: getDb().prepare("SELECT al.* FROM agent_logs al JOIN agents a ON al.agent_id=a.id WHERE a.customer_id=? ORDER BY al.created_at DESC LIMIT ?").all(req.user!.id, parseInt(String(req.query.limit||"50"))) });
});

router.patch("/agent", async (req: Request, res: Response): Promise<void> => {
  const { action, agentId } = req.body;
  if (!action || !["pause","resume"].includes(action)) { res.status(400).json({ error: "Bad action" }); return; }
  const db = getDb(); const m = getAgentManager();
  const agent = (agentId ? db.prepare("SELECT * FROM agents WHERE id=? AND customer_id=?").get(agentId, req.user!.id) : db.prepare("SELECT * FROM agents WHERE customer_id=? LIMIT 1").get(req.user!.id)) as any;
  if (!agent) { res.status(404).json({ error: "No agent" }); return; }
  try { if (action==="pause") { await m.stopAgent(agent.id); res.json({ status: "paused" }); } else { await m.startAgent(agent.id); res.json({ status: "active" }); } }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/integrations", (req: Request, res: Response): void => {
  const { agentId, type, config } = req.body;
  if (!type) { res.status(400).json({ error: "type required" }); return; }
  const db = getDb();
  const agent = (agentId ? db.prepare("SELECT * FROM agents WHERE id=? AND customer_id=?").get(agentId, req.user!.id) : db.prepare("SELECT * FROM agents WHERE customer_id=? LIMIT 1").get(req.user!.id)) as any;
  if (!agent) { res.status(404).json({ error: "No agent" }); return; }
  const id = uuidv4();
  db.prepare("INSERT INTO integrations (id, agent_id, type, config, status) VALUES (?,?,?,?,?)").run(id, agent.id, type, JSON.stringify(config||{}), "active");
  logAgent(agent.id, "info", "Integration added: " + type);
  res.status(201).json({ success: true, integration: { id, type, status: "active" } });
});
export default router;
