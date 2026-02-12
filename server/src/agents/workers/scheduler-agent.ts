import cron from "node-cron";
import nodemailer from "nodemailer";
import { getDb, logAgent } from "../../db/init";
import type { AgentWorker } from "../manager";

export class SchedulerAgent implements AgentWorker {
  private agentId: string; private config: any;
  private jobs: cron.ScheduledTask[] = [];
  private status: "running" | "stopped" | "error" = "stopped";

  constructor(id: string, config: any) { this.agentId = id; this.config = config; }

  async start() {
    const tasks = this.config.tasks || [{ name: "Daily Report", cron: "0 18 * * *", type: "daily" }, { name: "Weekly Summary", cron: "0 9 * * 1", type: "weekly" }];
    for (const t of tasks) {
      if (!cron.validate(t.cron)) continue;
      this.jobs.push(cron.schedule(t.cron, () => {
        const db = getDb();
        if (t.type === "daily") {
          const logs = db.prepare("SELECT type, COUNT(*) as c FROM agent_logs WHERE agent_id = ? AND date(created_at) = date('now') GROUP BY type").all(this.agentId) as any[];
          logAgent(this.agentId, "action", "Daily report: " + logs.map((r: any) => r.type + "=" + r.c).join(", "));
        } else {
          const logs = db.prepare("SELECT type, COUNT(*) as c FROM agent_logs WHERE agent_id = ? AND created_at >= datetime('now', '-7 days') GROUP BY type").all(this.agentId) as any[];
          logAgent(this.agentId, "action", "Weekly summary: " + logs.map((r: any) => r.type + "=" + r.c).join(", "));
        }
      }));
      logAgent(this.agentId, "info", "Scheduled: " + t.name + " (" + t.cron + ")");
    }
    this.status = "running";
  }

  async stop() { for (const j of this.jobs) j.stop(); this.jobs = []; this.status = "stopped"; }
  getStatus(): "running" | "stopped" | "error" { return this.status; }
}
