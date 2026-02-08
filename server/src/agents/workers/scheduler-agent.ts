import cron from "node-cron";
import nodemailer from "nodemailer";
import { dbAll, logAgent } from "../../db/init";
import type { AgentWorker } from "../manager";

interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  type: "daily-report" | "weekly-summary" | "custom";
  config: any;
}

export class SchedulerAgent implements AgentWorker {
  private agentId: string;
  private config: any;
  private cronJobs: cron.ScheduledTask[] = [];
  private status: "running" | "stopped" | "error" = "stopped";
  private taskCount = 0;

  constructor(agentId: string, config: any) {
    this.agentId = agentId;
    this.config = config;
  }

  async start(): Promise<void> {
    try {
      const tasks: ScheduledTask[] = this.config.tasks || this.getDefaultTasks();

      for (const task of tasks) {
        if (!cron.validate(task.cron)) {
          logAgent(this.agentId, "error", `Invalid cron expression for task "${task.name}": ${task.cron}`);
          continue;
        }

        const job = cron.schedule(task.cron, () => {
          this.executeTask(task).catch((err) => {
            logAgent(this.agentId, "error", `Task "${task.name}" failed: ${err.message}`);
          });
        });

        this.cronJobs.push(job);
        logAgent(this.agentId, "info", `Scheduled task "${task.name}" with cron: ${task.cron}`);
      }

      this.status = "running";
      logAgent(this.agentId, "info", `Scheduler agent started with ${this.cronJobs.length} tasks`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logAgent(this.agentId, "error", `Failed to start scheduler: ${message}`);
      this.status = "error";
      throw err;
    }
  }

  async stop(): Promise<void> {
    for (const job of this.cronJobs) {
      job.stop();
    }
    this.cronJobs = [];
    this.status = "stopped";
    logAgent(this.agentId, "info", `Scheduler agent stopped. Total tasks executed: ${this.taskCount}`);
  }

  getStatus(): "running" | "stopped" | "error" {
    return this.status;
  }

  private getDefaultTasks(): ScheduledTask[] {
    return [
      {
        id: "daily-report",
        name: "Daily Activity Report",
        cron: "0 18 * * *", // 6 PM daily
        type: "daily-report",
        config: {},
      },
      {
        id: "weekly-summary",
        name: "Weekly Summary",
        cron: "0 9 * * 1", // Monday 9 AM
        type: "weekly-summary",
        config: {},
      },
    ];
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    this.taskCount++;
    logAgent(this.agentId, "action", `Executing task: ${task.name}`);

    switch (task.type) {
      case "daily-report":
        await this.generateDailyReport();
        break;
      case "weekly-summary":
        await this.generateWeeklySummary();
        break;
      case "custom":
        await this.executeCustomTask(task);
        break;
      default:
        logAgent(this.agentId, "error", `Unknown task type: ${task.type}`);
    }
  }

  private async generateDailyReport(): Promise<void> {
    const logs = dbAll(
      `SELECT * FROM agent_logs
       WHERE agent_id = ? AND date(created_at) = date('now')
       ORDER BY created_at DESC`,
      [this.agentId]
    );

    const actions = logs.filter((l: any) => l.type === "action");
    const errors = logs.filter((l: any) => l.type === "error");

    const report = `
📊 Daily Activity Report — ${new Date().toLocaleDateString()}

Agent: ${this.agentId}
Total log entries today: ${logs.length}
Actions taken: ${actions.length}
Errors: ${errors.length}

Recent Actions:
${actions
  .slice(0, 10)
  .map((a: any) => `  • ${a.message}`)
  .join("\n") || "  (none)"}

${errors.length > 0 ? `\nErrors:\n${errors.map((e: any) => `  ⚠️ ${e.message}`).join("\n")}` : ""}

— DeskAgents Scheduler
`.trim();

    logAgent(this.agentId, "action", `Daily report generated: ${actions.length} actions, ${errors.length} errors`);

    if (this.config.report_email) {
      await this.sendEmail(this.config.report_email, `📊 Daily Report — ${new Date().toLocaleDateString()}`, report);
    }
  }

  private async generateWeeklySummary(): Promise<void> {
    const logs = dbAll(
      `SELECT type, COUNT(*) as count FROM agent_logs
       WHERE agent_id = ? AND created_at >= datetime('now', '-7 days')
       GROUP BY type`,
      [this.agentId]
    );

    const summary = logs.reduce((acc: Record<string, number>, row: any) => {
      acc[row.type] = row.count;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(summary).reduce((a, b) => a + b, 0);

    const report = `
📈 Weekly Summary — Week of ${new Date().toLocaleDateString()}

Agent: ${this.agentId}

Breakdown:
  ℹ️  Info: ${summary.info || 0}
  ⚡ Actions: ${summary.action || 0}
  ⚠️  Errors: ${summary.error || 0}

Total events: ${total}

— DeskAgents Scheduler
`.trim();

    logAgent(this.agentId, "action", "Weekly summary generated");

    if (this.config.report_email) {
      await this.sendEmail(this.config.report_email, `📈 Weekly Summary — ${new Date().toLocaleDateString()}`, report);
    }
  }

  private async executeCustomTask(task: ScheduledTask): Promise<void> {
    logAgent(this.agentId, "action", `Custom task "${task.name}" executed`);
  }

  private async sendEmail(to: string, subject: string, text: string): Promise<void> {
    if (!this.config.smtp) return;

    const transporter = nodemailer.createTransport({
      host: this.config.smtp.host || "smtp.gmail.com",
      port: this.config.smtp.port || 587,
      secure: false,
      auth: {
        user: this.config.smtp.user,
        pass: this.config.smtp.pass,
      },
    });

    try {
      await transporter.sendMail({
        from: this.config.smtp.user,
        to,
        subject,
        text,
      });
      logAgent(this.agentId, "info", `Report email sent to ${to}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logAgent(this.agentId, "error", `Failed to send report email: ${message}`);
    }
  }
}
