import fs from "fs";
import path from "path";

/* ── Types ── */

export interface AdminCustomer {
  id: string;
  email: string;
  name: string;
  company: string;
  plan: string;
  agentStatus: string;
  integrations: string[];
  onboarded: boolean;
  createdAt: string;
}

export interface AdminAgent {
  id: string;
  customer_id: string;
  name: string;
  template: string;
  status: string; // running | stopped | error
  created_at: string;
  last_heartbeat: string;
}

export interface AdminLog {
  id: number;
  agent_id: string;
  type: string; // info | error | action
  message: string;
  created_at: string;
}

/* ── Paths ── */

const DATA_DIR = path.join(process.cwd(), "data");
const CUSTOMERS_PATH = path.join(DATA_DIR, "customers.json");
const AGENTS_PATH = path.join(DATA_DIR, "admin-agents.json");
const LOGS_PATH = path.join(DATA_DIR, "admin-logs.json");

/* ── Readers ── */

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(filePath: string, data: T): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* ── Customers ── */

export function getAdminCustomers(): AdminCustomer[] {
  return readJSON<AdminCustomer[]>(CUSTOMERS_PATH, []);
}

export function deleteAdminCustomer(id: string): boolean {
  const customers = getAdminCustomers();
  const filtered = customers.filter((c) => c.id !== id);
  if (filtered.length === customers.length) return false;
  writeJSON(CUSTOMERS_PATH, filtered);
  return true;
}

/* ── Agents ── */

export function getAdminAgents(): AdminAgent[] {
  return readJSON<AdminAgent[]>(AGENTS_PATH, []);
}

export function getAdminAgent(id: string): AdminAgent | undefined {
  return getAdminAgents().find((a) => a.id === id);
}

export function updateAdminAgent(id: string, updates: Partial<AdminAgent>): AdminAgent | null {
  const agents = getAdminAgents();
  const idx = agents.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  agents[idx] = { ...agents[idx], ...updates };
  writeJSON(AGENTS_PATH, agents);
  return agents[idx];
}

/* ── Logs ── */

export function getAdminLogs(agentId?: string, limit = 50): AdminLog[] {
  let logs = readJSON<AdminLog[]>(LOGS_PATH, []);
  if (agentId) {
    logs = logs.filter((l) => l.agent_id === agentId);
  }
  // Sort newest first
  logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return logs.slice(0, limit);
}

export function addAdminLog(agentId: string, type: string, message: string): AdminLog {
  const logs = readJSON<AdminLog[]>(LOGS_PATH, []);
  const newLog: AdminLog = {
    id: logs.length > 0 ? Math.max(...logs.map((l) => l.id)) + 1 : 1,
    agent_id: agentId,
    type,
    message,
    created_at: new Date().toISOString(),
  };
  logs.push(newLog);
  writeJSON(LOGS_PATH, logs);
  return newLog;
}

/* ── Stats ── */

const PLAN_PRICES: Record<string, number> = {
  individual: 49,
  team: 149,
  business: 399,
  enterprise: 999,
};

export function getAdminStats() {
  const customers = getAdminCustomers();
  const agents = getAdminAgents();
  const logs = readJSON<AdminLog[]>(LOGS_PATH, []);

  const activeCustomers = customers.filter((c) => c.agentStatus === "active").length;
  const runningAgents = agents.filter((a) => a.status === "running").length;
  const errorAgents = agents.filter((a) => a.status === "error").length;
  const stoppedAgents = agents.filter((a) => a.status === "stopped").length;

  const monthlyRevenue = customers.reduce((sum, c) => {
    return sum + (PLAN_PRICES[c.plan] || 0);
  }, 0);

  const uptime =
    agents.length > 0
      ? Math.round((runningAgents / agents.length) * 100 * 10) / 10
      : 100;

  // Plan breakdown
  const planMap: Record<string, number> = {};
  for (const c of customers) {
    planMap[c.plan] = (planMap[c.plan] || 0) + 1;
  }
  const planBreakdown = Object.entries(planMap).map(([plan, count]) => ({
    plan,
    count,
  }));

  // Today's logs
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(
    (l) => new Date(l.created_at).getTime() >= todayStart.getTime()
  ).length;

  return {
    totalCustomers: customers.length,
    activeCustomers,
    totalAgents: agents.length,
    runningAgents,
    errorAgents,
    stoppedAgents,
    monthlyRevenue,
    uptime,
    totalLogs: logs.length,
    todayLogs,
    planBreakdown,
  };
}

/* ── Admin Auth ── */

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "deskagents-admin-2026";

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
