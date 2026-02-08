import { Router, Request, Response } from "express";
import { getDb } from "../db/init";
import { getAgentManager } from "../agents/manager";

const router = Router();

// GET /api/health — healthcheck
router.get("/", (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const manager = getAgentManager();

    // Check DB is responsive
    const result = db.exec("SELECT 1 as ok");
    const dbOk = result.length > 0;

    const running = manager.listRunning();

    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbOk ? "connected" : "error",
      agents: {
        running: running.length,
        details: running,
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      status: "error",
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
