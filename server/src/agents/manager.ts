import { getDb, logAgent, updateAgentStatus, updateAgentHeartbeat } from "../db/init";
import { EmailAgent } from "./workers/email-agent";
import { SupportAgent } from "./workers/support-agent";
import { SchedulerAgent } from "./workers/scheduler-agent";

export interface AgentWorker { start(): Promise<void>; stop(): Promise<void>; getStatus(): "running" | "stopped" | "error"; }
interface RunningAgent { worker: AgentWorker; agentId: string; template: string; hb: ReturnType<typeof setInterval>; }

export class AgentManager {
  private running = new Map<string, RunningAgent>();
  private monitor: ReturnType<typeof setInterval> | null = null;
  constructor() { this.monitor = setInterval(() => this.healthCheck(), 60000); }

  async startAgent(id: string) {
    if (this.running.has(id)) return;
    const db = getDb();
    const a = db.prepare("SELECT * FROM agents WHERE id = ?").get(id) as any;
    if (!a) throw new Error("Agent not found: " + id);
    const cfg = JSON.parse(a.config || "{}");
    const ints = db.prepare("SELECT * FROM integrations WHERE agent_id = ?").all(id) as any[];
    let w: AgentWorker;
    if (a.template === "email-manager") w = new EmailAgent(id, cfg, ints);
    else if (a.template === "customer-support") w = new SupportAgent(id, cfg, ints);
    else if (a.template === "scheduler") w = new SchedulerAgent(id, cfg);
    else throw new Error("Unknown template: " + a.template);
    await w.start();
    this.running.set(id, { worker: w, agentId: id, template: a.template, hb: setInterval(() => updateAgentHeartbeat(id), 30000) });
    updateAgentStatus(id, "active", process.pid);
    logAgent(id, "info", "Agent started (" + a.template + ")");
  }

  async stopAgent(id: string) {
    const e = this.running.get(id);
    if (!e) return;
    clearInterval(e.hb);
    await e.worker.stop();
    this.running.delete(id);
    updateAgentStatus(id, "paused");
    logAgent(id, "info", "Agent stopped");
  }

  async restartAgent(id: string) { await this.stopAgent(id); await new Promise(r => setTimeout(r, 1000)); await this.startAgent(id); }
  getStatus(id: string): "running" | "stopped" | "error" { const e = this.running.get(id); return e ? e.worker.getStatus() : "stopped"; }
  listRunning() { return Array.from(this.running.values()).map(e => ({ agentId: e.agentId, template: e.template, status: e.worker.getStatus() })); }

  async healthCheck() {
    for (const [id, e] of this.running) { if (e.worker.getStatus() === "error") { try { await this.restartAgent(id); } catch {} } }
    const active = getDb().prepare("SELECT id FROM agents WHERE status = 'active'").all() as any[];
    for (const a of active) { if (!this.running.has(a.id)) { try { await this.startAgent(a.id); } catch {} } }
  }

  async shutdown() { if (this.monitor) clearInterval(this.monitor); await Promise.allSettled(Array.from(this.running.keys()).map(id => this.stopAgent(id))); }
}

let mgr: AgentManager | null = null;
export function getAgentManager() { if (!mgr) mgr = new AgentManager(); return mgr; }
