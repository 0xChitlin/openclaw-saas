import { Router, Request, Response } from "express";
import { getDb } from "../db/init";
import { getAgentManager } from "../agents/manager";
const router = Router();
router.get("/", (_req: Request, res: Response): void => {
  try {
    const db = getDb(); const check = db.prepare("SELECT 1 as ok").get() as any;
    const running = getAgentManager().listRunning();
    res.json({ status: "ok", uptime: process.uptime(), database: check?.ok === 1 ? "connected" : "error", agents: { running: running.length, details: running }, memory: { heapMB: Math.round(process.memoryUsage().heapUsed/1048576) } });
  } catch (e: any) { res.status(500).json({ status: "error", error: e.message }); }
});
export default router;
