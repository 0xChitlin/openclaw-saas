import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { dbGet, dbRun, logAgent } from "../db/init";

const router = Router();

/**
 * POST /api/provision
 *
 * Called by Stripe webhook or directly to create a customer + agent.
 */
router.post("/", (req: Request, res: Response): void => {
  const { email, name, plan, stripe_id, template, agent_name, config } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  // Check if customer already exists
  let customer = dbGet("SELECT * FROM customers WHERE email = ?", [email]);

  if (!customer) {
    const customerId = uuidv4();
    dbRun(
      "INSERT INTO customers (id, email, name, plan, stripe_id, status) VALUES (?, ?, ?, ?, ?, ?)",
      [customerId, email, name || null, plan || "starter", stripe_id || null, "active"]
    );

    customer = dbGet("SELECT * FROM customers WHERE id = ?", [customerId]);
    console.log(`[Provision] New customer created: ${email} (${customerId})`);
  } else {
    // Update existing customer
    dbRun(
      "UPDATE customers SET plan = ?, stripe_id = COALESCE(?, stripe_id), status = 'active' WHERE id = ?",
      [plan || customer.plan, stripe_id, customer.id]
    );

    console.log(`[Provision] Existing customer updated: ${email}`);
  }

  // Create agent for customer
  const agentId = uuidv4();
  const agentTemplate = template || "email-manager";
  const agentConfig = config || {};

  dbRun(
    "INSERT INTO agents (id, customer_id, name, template, config, status) VALUES (?, ?, ?, ?, ?, ?)",
    [
      agentId,
      customer.id,
      agent_name || `${agentTemplate} agent`,
      agentTemplate,
      JSON.stringify(agentConfig),
      "paused",
    ]
  );

  logAgent(agentId, "info", `Agent provisioned for ${email} (template: ${agentTemplate})`);
  console.log(`[Provision] Agent ${agentId} created for ${email}`);

  res.status(201).json({
    success: true,
    customerId: customer.id,
    agentId,
    template: agentTemplate,
    status: "paused",
  });
});

export default router;
