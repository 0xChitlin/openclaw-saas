import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db/init";
import { signToken } from "../middleware/auth";
const router = Router();
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }
  const db = getDb();
  const admin = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as any;
  if (admin && await bcrypt.compare(password, admin.password_hash)) { res.json({ token: signToken({ id: String(admin.id), email: admin.email, role: "admin" }), role: "admin" }); return; }
  const cust = db.prepare("SELECT * FROM customers WHERE email = ?").get(email) as any;
  if (cust && (password === cust.stripe_id || password === cust.id)) { res.json({ token: signToken({ id: cust.id, email: cust.email, role: "customer" }), role: "customer" }); return; }
  res.status(401).json({ error: "Invalid credentials" });
});
export default router;
