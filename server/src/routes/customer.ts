import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDb, logAgent } from "../db/init";
import { getAgentManager } from "../agents/manager";
import { authMiddleware, customerOnly } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.use(customerOnly);

router.get("/agent", (req: Request, res: Response): void => {
  const customerId = req.user!.id;
  const db = getDb();

  const agents = db
    .prepare("SELECT * FROM agents WHERE customer_id = ? ORDER BY created_at DESC")
    .all(customerId) as any[];

  if (agents.length === 0) {
    res.json({ agent: null });
    return;
  }

  const manager = getAgentManager();
  const enriched = agents.map((agent) => ({
    ...agent,
    config: JSON.parse(agent.config || "{}"),
    runtime_status: manager.getStatus(agent.id),
  }));

  res.json({ agents: enriched });
});

router.get("/logs", (req: Request, res: Response): void => {
  const customerId = req.user!.id;
  const limit = parseInt(String(req.query.limit || "50"), 10);
  const db = getDb();

  const logs = db
    .prepare(
      `SELECT al.* FROM agent_logs al
       JOIN agents a ON al.agent_id = a.id
       WHERE a.customer_id = ?
       ORDER BY al.created_at DESC
       LIMIT ?`
    )
    .all(customerId, limit);

  res.json({ logs });
});

router.patch("/agent", async (req: Request, res: Response): Promise<void> => {
  const customerId = req.user!.id;
  const { action, agentId } = req.body;

  if (!action || !["pause", "resume"].includes(action)) {
    res.status(400).json({ error: 'Action must be "pause" or "resume"' });
    return;
  }

  const db = getDb();
  const manager = getAgentManager();

  let agent: any;
  if (agentId) {
    agent = db
      .prepare("SELECT * FROM agents WHERE id = ? AND customer_id = ?")
      .get(agentId, customerId);
  } else {
    agent = db
      .prepare("SELECT * FROM agents WHERE customer_id = ? ORDER BY created_at LIMIT 1")
      .get(customerId);
  }

  if (!agent) {
    res.status(404).json({ error: "No agent found" });
    return;
  }

  try {
    if (action === "pause") {
      await manager.stopAgent(agent.id);
      res.json({ success: true, status: "paused" });
    } else {
      await manager.startAgent(agent.id);
      res.json({ success: true, status: "active" });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

router.post("/integrations", (req: Request, res: Response): void => {
  const customerId = req.user!.id;
  const { agentId, type, config } = req.body;

  if (!type) {
    res.status(400).json({ error: "Integration type required" });
    return;
  }

  const db = getDb();

  let agent: any;
  if (agentId) {
    agent = db
      .prepare("SELECT * FROM agents WHERE id = ? AND customer_id = ?")
      .get(agentId, customerId);
  } else {
    agent = db
      .prepare("SELECT * FROM agents WHERE customer_id = ? ORDER BY created_at LIMIT 1")
      .get(customerId);
  }

  if (!agent) {
    res.status(404).json({ error: "No agent found" });
    return;
  }

  const id = uuidv4();
  db.prepare(
    "INSERT INTO integrations (id, agent_id, type, config, status) VALUES (?, ?, ?, ?, ?)"
  ).run(id, agent.id, type, JSON.stringify(config || {}), "active");

  logAgent(agent.id, "info", `Integration added: ${type}`);

  res.status(201).json({
    success: true,
    integration: { id, agent_id: agent.id, type, status: "active" },
  });
});

export default router;
