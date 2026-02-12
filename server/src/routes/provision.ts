import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDb, logAgent } from "../db/init";
const router = Router();
router.post("/", (req: Request, res: Response): void => {
  const { email, name, plan, stripe_id, template, agent_name, config } = req.body;
  if (!email) { res.status(400).json({ error: "Email required" }); return; }
  const db = getDb();
  let cust = db.prepare("SELECT * FROM customers WHERE email = ?").get(email) as any;
  if (!cust) { const cid = uuidv4(); db.prepare("INSERT INTO customers (id,email,name,plan,stripe_id,status) VALUES (?,?,?,?,?,?)").run(cid,email,name||null,plan||"starter",stripe_id||null,"active"); cust = db.prepare("SELECT * FROM customers WHERE id=?").get(cid); }
  else { db.prepare("UPDATE customers SET plan=?, stripe_id=COALESCE(?,stripe_id), status='active' WHERE id=?").run(plan||cust.plan, stripe_id, cust.id); }
  const aid = uuidv4(); const tmpl = template || "email-manager";
  db.prepare("INSERT INTO agents (id,customer_id,name,template,config,status) VALUES (?,?,?,?,?,?)").run(aid, cust.id, agent_name||tmpl+" agent", tmpl, JSON.stringify(config||{}), "paused");
  logAgent(aid, "info", "Provisioned for " + email);
  res.status(201).json({ success: true, customerId: cust.id, agentId: aid, template: tmpl, status: "paused" });
});
export default router;
