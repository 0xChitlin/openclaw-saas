import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { dbGet } from "../db/init";
import { signToken } from "../middleware/auth";

const router = Router();

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const admin = dbGet("SELECT * FROM admin_users WHERE email = ?", [email]);
  if (admin) {
    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (valid) {
      const token = signToken({ id: String(admin.id), email: admin.email, role: "admin" });
      res.json({ token, role: "admin", email: admin.email });
      return;
    }
  }

  const customer = dbGet("SELECT * FROM customers WHERE email = ?", [email]);
  if (customer) {
    if (password === customer.stripe_id || password === customer.id) {
      const token = signToken({ id: customer.id, email: customer.email, role: "customer" });
      res.json({ token, role: "customer", email: customer.email });
      return;
    }
  }

  res.status(401).json({ error: "Invalid credentials" });
});

export default router;
