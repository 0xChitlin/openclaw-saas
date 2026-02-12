import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "deskagents-secret-change-me";
export interface JwtPayload { id: string; email: string; role: "admin" | "customer"; }
declare global { namespace Express { interface Request { user?: JwtPayload; } } }
export function signToken(p: JwtPayload): string { return jwt.sign(p, JWT_SECRET, { expiresIn: "24h" }); }
export function verifyToken(t: string): JwtPayload { return jwt.verify(t, JWT_SECRET) as JwtPayload; }
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) { res.status(401).json({ error: "No auth" }); return; }
  try { req.user = verifyToken(h.slice(7)); next(); } catch { res.status(401).json({ error: "Bad token" }); }
}
export function adminOnly(req: Request, res: Response, next: NextFunction): void { if (req.user?.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; } next(); }
export function customerOnly(req: Request, res: Response, next: NextFunction): void { if (req.user?.role !== "customer") { res.status(403).json({ error: "Customer only" }); return; } next(); }
