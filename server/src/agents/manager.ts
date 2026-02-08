import { getDb, logAgent, updateAgentStatus, updateAgentHeartbeat } from "../db/init";
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
    // Start the health monitor
    this.monitorInterval = setInterval(() => this.healthCheck(), 60_000);
    console.log("[AgentManager] Initialized");
  }

  async startAgent(agentId: string): Promise<void> {
    // Don't double-start
    if (this.running.has(agentId)) {
      console.log(`[AgentManager] Agent ${agentId} already running`);
      return;
    }

    const db = getDb();
    const agent = db.prepare("SELECT * FROM agents WHERE id = ?").get(agentId) as any;
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const config = JSON.parse(agent.config || "{}");
    const integrations = db.prepare("SELECT * FROM integrations WHERE agent_id = ?").all(agentId) as any[];

    // Create worker based on template
    let worker: AgentWorker;
    switch (agent.template) {
      case "email-manager":
        worker = new EmailAgent(agentId, config, integrations);
        break;
      case "customer-support":
        worker = new SupportAgent(agentId, config, integrations);
        break;
      case "scheduler":
        worker = new SchedulerAgent(agentId, config);
        break;
      default:
        throw new Error(`Unknown template: ${agent.template}`);
    }

    try {
      await worker.start();

      // Set up heartbeat
      const heartbeatInterval = setInterval(() => {
        updateAgentHeartbeat(agentId);
      }, 30_000);

      this.running.set(agentId, {
        worker,
        agentId,
        template: agent.template,
        heartbeatInterval,
      });

      updateAgentStatus(agentId, "active", process.pid);
      logAgent(agentId, "info", `Agent started (template: ${agent.template})`);
      console.log(`[AgentManager] Started agent ${agentId} (${agent.template})`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateAgentStatus(agentId, "error");
      logAgent(agentId, "error", `Failed to start: ${message}`);
      throw err;
    }
  }

  async stopAgent(agentId: string): Promise<void> {
    const entry = this.running.get(agentId);
    if (!entry) {
      console.log(`[AgentManager] Agent ${agentId} not running`);
      return;
    }

    try {
      clearInterval(entry.heartbeatInterval);
      await entry.worker.stop();
      this.running.delete(agentId);

      updateAgentStatus(agentId, "paused");
      logAgent(agentId, "info", "Agent stopped");
      console.log(`[AgentManager] Stopped agent ${agentId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateAgentStatus(agentId, "error");
      logAgent(agentId, "error", `Error stopping: ${message}`);
      this.running.delete(agentId);
    }
  }

  async restartAgent(agentId: string): Promise<void> {
    await this.stopAgent(agentId);
    // Small delay to ensure clean shutdown
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
      result.push({
        agentId: entry.agentId,
        template: entry.template,
        status: entry.worker.getStatus(),
      });
    }
    return result;
  }

  async healthCheck(): Promise<void> {
    const db = getDb();

    for (const [agentId] of this.running) {
      const entry = this.running.get(agentId)!;
      const status = entry.worker.getStatus();

      if (status === "error") {
        console.log(`[AgentManager] Agent ${agentId} in error state, attempting restart`);
        logAgent(agentId, "error", "Agent crashed, auto-restarting...");

        try {
          await this.restartAgent(agentId);
          logAgent(agentId, "info", "Auto-restart successful");
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logAgent(agentId, "error", `Auto-restart failed: ${message}`);
          updateAgentStatus(agentId, "error");
        }
      }
    }

    // Check for agents that should be running but aren't
    const activeAgents = db.prepare("SELECT id FROM agents WHERE status = 'active'").all() as any[];
    for (const agent of activeAgents) {
      if (!this.running.has(agent.id)) {
        console.log(`[AgentManager] Agent ${agent.id} marked active but not running, starting...`);
        try {
          await this.startAgent(agent.id);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[AgentManager] Failed to start orphaned agent ${agent.id}: ${message}`);
        }
      }
    }
  }

  async shutdown(): Promise<void> {
    console.log("[AgentManager] Shutting down all agents...");
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    const promises = Array.from(this.running.keys()).map((id) => this.stopAgent(id));
    await Promise.allSettled(promises);
    console.log("[AgentManager] All agents stopped");
  }
}

// Singleton
let manager: AgentManager | null = null;

export function getAgentManager(): AgentManager {
  if (!manager) {
    manager = new AgentManager();
  }
  return manager;
}
