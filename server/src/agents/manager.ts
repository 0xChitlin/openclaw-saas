import { dbAll, dbGet, logAgent, updateAgentStatus, updateAgentHeartbeat } from "../db/init";
import { EmailAgent } from "./workers/email-agent";
import { SupportAgent } from "./workers/support-agent";
import { SchedulerAgent } from "./workers/scheduler-agent";

export interface AgentWorker {
  start(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): "running" | "stopped" | "error";
}

interface RunningAgent {
  worker: AgentWorker;
  agentId: string;
  template: string;
  heartbeatInterval: ReturnType<typeof setInterval>;
}

export class AgentManager {
  private running: Map<string, RunningAgent> = new Map();
  private monitorInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.monitorInterval = setInterval(() => this.healthCheck(), 60000);
    console.log("[AgentManager] Initialized");
  }

  async startAgent(agentId: string): Promise<void> {
    if (this.running.has(agentId)) { console.log("[AgentManager] Agent " + agentId + " already running"); return; }
    const agent = dbGet("SELECT * FROM agents WHERE id = ?", [agentId]);
    if (!agent) throw new Error("Agent " + agentId + " not found");
    const config = JSON.parse(agent.config || "{}");
    const integrations = dbAll("SELECT * FROM integrations WHERE agent_id = ?", [agentId]);
    let worker: AgentWorker;
    switch (agent.template) {
      case "email-manager": worker = new EmailAgent(agentId, config, integrations); break;
      case "customer-support": worker = new SupportAgent(agentId, config, integrations); break;
      case "scheduler": worker = new SchedulerAgent(agentId, config); break;
      default: throw new Error("Unknown template: " + agent.template);
    }
    try {
      await worker.start();
      const heartbeatInterval = setInterval(() => { updateAgentHeartbeat(agentId); }, 30000);
      this.running.set(agentId, { worker, agentId, template: agent.template, heartbeatInterval });
      updateAgentStatus(agentId, "active", process.pid);
      logAgent(agentId, "info", "Agent started (template: " + agent.template + ")");
    } catch (err) {
      updateAgentStatus(agentId, "error");
      logAgent(agentId, "error", "Failed to start: " + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  }

  async stopAgent(agentId: string): Promise<void> {
    const entry = this.running.get(agentId);
    if (!entry) { console.log("[AgentManager] Agent " + agentId + " not running"); return; }
    try {
      clearInterval(entry.heartbeatInterval);
      await entry.worker.stop();
      this.running.delete(agentId);
      updateAgentStatus(agentId, "paused");
      logAgent(agentId, "info", "Agent stopped");
    } catch (err) {
      updateAgentStatus(agentId, "error");
      logAgent(agentId, "error", "Error stopping: " + (err instanceof Error ? err.message : String(err)));
      this.running.delete(agentId);
    }
  }

  async restartAgent(agentId: string): Promise<void> {
    await this.stopAgent(agentId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.startAgent(agentId);
  }

  getStatus(agentId: string): "running" | "stopped" | "error" {
    const entry = this.running.get(agentId);
    if (!entry) return "stopped";
    return entry.worker.getStatus();
  }

  listRunning(): Array<{ agentId: string; template: string; status: string }> {
    const result: Array<{ agentId: string; template: string; status: string }> = [];
    for (const [, entry] of this.running) {
      result.push({ agentId: entry.agentId, template: entry.template, status: entry.worker.getStatus() });
    }
    return result;
  }

  async healthCheck(): Promise<void> {
    for (const [agentId, entry] of this.running) {
      if (entry.worker.getStatus() === "error") {
        logAgent(agentId, "error", "Agent crashed, auto-restarting...");
        try { await this.restartAgent(agentId); logAgent(agentId, "info", "Auto-restart successful"); }
        catch (err) { logAgent(agentId, "error", "Auto-restart failed: " + (err instanceof Error ? err.message : String(err))); updateAgentStatus(agentId, "error"); }
      }
    }
    const activeAgents = dbAll("SELECT id FROM agents WHERE status = 'active'");
    for (const agent of activeAgents) {
      if (!this.running.has(agent.id)) {
        try { await this.startAgent(agent.id); }
        catch (err) { console.error("[AgentManager] Failed to start orphaned agent " + agent.id); }
      }
    }
  }

  async shutdown(): Promise<void> {
    console.log("[AgentManager] Shutting down all agents...");
    if (this.monitorInterval) clearInterval(this.monitorInterval);
    await Promise.allSettled(Array.from(this.running.keys()).map((id) => this.stopAgent(id)));
    console.log("[AgentManager] All agents stopped");
  }
}

let manager: AgentManager | null = null;
export function getAgentManager(): AgentManager {
  if (!manager) manager = new AgentManager();
  return manager;
}
