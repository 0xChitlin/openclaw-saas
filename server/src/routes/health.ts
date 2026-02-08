import { Router, Request, Response } from "express";
import { getDb } from "../db/init";
import { getAgentManager } from "../agents/manager";

const router = Router();

router.get("/", (_req: Request, res: Response): void => {
  try {
    const db: any = getDb();
    const manager = getAgentManager();
    const result = db.exec("SELECT 1 as ok");
    const dbOk = Array.isArray(result) && result.length > 0;
    const running = manager.listRunning();
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbOk ? "connected" : "error",
      agents: { running: running.length, details: running },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
