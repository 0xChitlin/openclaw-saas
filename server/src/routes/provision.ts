import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDb, logAgent } from "../db/init";

const router = Router();

router.post("/", (req: Request, res: Response): void => {
  const { email, name, plan, stripe_id, template, agent_name, config } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const db = getDb();

  let customer = db.prepare("SELECT * FROM customers WHERE email = ?").get(email) as any;

  if (!customer) {
    const customerId = uuidv4();
    db.prepare(
      "INSERT INTO customers (id, email, name, plan, stripe_id, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(customerId, email, name || null, plan || "starter", stripe_id || null, "active");

    customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(customerId);
    console.log("[Provision] New customer created: " + email + " (" + customerId + ")");
  } else {
    db.prepare(
      "UPDATE customers SET plan = ?, stripe_id = COALESCE(?, stripe_id), status = 'active' WHERE id = ?"
    ).run(plan || customer.plan, stripe_id, customer.id);

    console.log("[Provision] Existing customer updated: " + email);
  }

  const agentId = uuidv4();
  const agentTemplate = template || "email-manager";
  const agentConfig = config || {};

  db.prepare(
    "INSERT INTO agents (id, customer_id, name, template, config, status) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    agentId,
    customer.id,
    agent_name || agentTemplate + " agent",
    agentTemplate,
    JSON.stringify(agentConfig),
    "paused"
  );

  logAgent(agentId, "info", "Agent provisioned for " + email + " (template: " + agentTemplate + ")");
  console.log("[Provision] Agent " + agentId + " created for " + email);

  res.status(201).json({
    success: true,
    customerId: customer.id,
    agentId,
    template: agentTemplate,
    status: "paused",
  });
});

export default router;
