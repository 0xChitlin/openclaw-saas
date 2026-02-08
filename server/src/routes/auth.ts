import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db/init";
import { signToken } from "../middleware/auth";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const db = getDb();

  // Check admin users first
  const admin = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as any;
  if (admin) {
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (valid) {
      const token = signToken({ id: String(admin.id), email: admin.email, role: "admin" });
      res.json({ token, role: "admin", email: admin.email });
      return;
    }
  }

  // Check customers
  const customer = db.prepare("SELECT * FROM customers WHERE email = ?").get(email) as any;
  if (customer) {
    // For customers, use stripe_id as a simple "password" for now
    // In production, you'd have proper password auth
    if (password === customer.stripe_id || password === customer.id) {
      const token = signToken({ id: customer.id, email: customer.email, role: "customer" });
      res.json({ token, role: "customer", email: customer.email });
      return;
    }
  }

  res.status(401).json({ error: "Invalid credentials" });
});

export default router;
