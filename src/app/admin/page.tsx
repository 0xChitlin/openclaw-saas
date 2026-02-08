"use client";

import { useEffect, useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  totalAgents: number;
  runningAgents: number;
  errorAgents: number;
  totalLogs: number;
  todayLogs: number;
  monthlyRevenue: number;
  planBreakdown: Array<{ plan: string; count: number }>;
}

interface Agent {
  id: string;
  customer_id: string;
  name: string;
  template: string;
  status: string;
  runtime_status: string;
  customer_email: string;
  customer_name: string;
  last_heartbeat: string;
  created_at: string;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  plan: string;
  status: string;
  created_at: string;
}

interface LogEntry {
  id: number;
  agent_id: string;
  type: string;
  message: string;
  created_at: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@deskagents.com");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "customers" | "logs">("overview");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async (authToken: string) => {
    try {
      const headers = { Authorization: "Bearer " + authToken };
      const [statsRes, agentsRes, customersRes] = await Promise.all([
        fetch(API_URL + "/api/admin/stats", { headers }),
        fetch(API_URL + "/api/admin/agents", { headers }),
        fetch(API_URL + "/api/admin/customers", { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (agentsRes.ok) { const data = await agentsRes.json(); setAgents(data.agents); }
      if (customersRes.ok) { const data = await customersRes.json(); setCustomers(data.customers); }
    } catch (err) { console.error("Failed to fetch admin data:", err); }
  }, []);

  const fetchLogs = useCallback(async (agentId: string) => {
    if (!token) return;
    try {
      const res = await fetch(API_URL + "/api/admin/agents/" + agentId + "/logs?limit=50", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) { const data = await res.json(); setLogs(data.logs); }
    } catch (err) { console.error("Failed to fetch logs:", err); }
  }, [token]);

  useEffect(() => {
    if (token) { fetchData(token); const i = setInterval(() => fetchData(token), 15000); return () => clearInterval(i); }
  }, [token, fetchData]);

  useEffect(() => {
    if (selectedAgent) { fetchLogs(selectedAgent); const i = setInterval(() => fetchLogs(selectedAgent), 10000); return () => clearInterval(i); }
  }, [selectedAgent, fetchLogs]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(API_URL + "/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) { setToken(data.token); }
      else { setLoginError(data.error || "Login failed"); }
    } catch { setLoginError("Cannot connect to server. Is the backend running on port 4000?"); }
  }

  async function agentAction(agentId: string, action: "start" | "stop" | "restart") {
    if (!token) return;
    setActionLoading(agentId + "-" + action);
    try {
      await fetch(API_URL + "/api/admin/agents/" + agentId + "/" + action, {
        method: "POST", headers: { Authorization: "Bearer " + token },
      });
      await fetchData(token);
    } catch (err) { console.error("Failed to " + action + " agent:", err); }
    setActionLoading(null);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">🔧 Admin Panel</h1>
          <p className="text-gray-400 mb-6">DeskAgents Runtime Management</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" placeholder="Enter admin password" />
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">🔧 DeskAgents Admin</h1>
          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">Connected</span>
        </div>
        <button onClick={() => setToken(null)} className="text-sm text-gray-400 hover:text-white">Logout</button>
      </header>

      <div className="border-b border-gray-800 px-6">
        <nav className="flex gap-6">
          {(["overview", "agents", "customers", "logs"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={"py-3 text-sm font-medium border-b-2 transition " +
                (activeTab === tab ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white")}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Customers" value={stats.totalCustomers} icon="👥" />
              <StatCard label="Active Customers" value={stats.activeCustomers} icon="✅" />
              <StatCard label="Running Agents" value={stats.runningAgents} icon="🤖" />
              <StatCard label="Monthly Revenue" value={"$" + stats.monthlyRevenue} icon="💰" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Agents" value={stats.totalAgents} icon="⚙️" />
              <StatCard label="Error Agents" value={stats.errorAgents} icon="⚠️" color="red" />
              <StatCard label="Logs Today" value={stats.todayLogs} icon="📝" />
              <StatCard label="Total Logs" value={stats.totalLogs} icon="📊" />
            </div>
            {stats.planBreakdown.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Plan Breakdown</h3>
                <div className="space-y-2">
                  {stats.planBreakdown.map((p) => (
                    <div key={p.plan} className="flex items-center justify-between">
                      <span className="text-gray-400 capitalize">{p.plan}</span>
                      <span className="font-mono">{p.count} customers</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "agents" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Agents ({agents.length})</h2>
            {agents.length === 0 ? <p className="text-gray-400">No agents provisioned yet.</p> : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left px-4 py-3">Agent</th>
                      <th className="text-left px-4 py-3">Template</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Runtime</th>
                      <th className="text-right px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{agent.id.slice(0, 8)}...</div>
                        </td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">{agent.template}</span></td>
                        <td className="px-4 py-3 text-gray-400">{agent.customer_email || "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={agent.status} /></td>
                        <td className="px-4 py-3"><StatusBadge status={agent.runtime_status} /></td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => agentAction(agent.id, "start")} disabled={actionLoading === agent.id + "-start"}
                            className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 disabled:opacity-50">▶ Start</button>
                          <button onClick={() => agentAction(agent.id, "stop")} disabled={actionLoading === agent.id + "-stop"}
                            className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 disabled:opacity-50">⏹ Stop</button>
                          <button onClick={() => agentAction(agent.id, "restart")} disabled={actionLoading === agent.id + "-restart"}
                            className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30 disabled:opacity-50">🔄 Restart</button>
                          <button onClick={() => { setSelectedAgent(agent.id); setActiveTab("logs"); }}
                            className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30">📋 Logs</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Customers ({customers.length})</h2>
            {customers.length === 0 ? <p className="text-gray-400">No customers yet.</p> : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Plan</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-medium">{c.name || "—"}</td>
                        <td className="px-4 py-3 text-gray-400">{c.email}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-xs capitalize">{c.plan}</span></td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Agent Logs</h2>
              {agents.length > 0 && (
                <select value={selectedAgent || ""} onChange={(e) => setSelectedAgent(e.target.value || null)}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white">
                  <option value="">Select an agent...</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id.slice(0, 8)})</option>)}
                </select>
              )}
            </div>
            {!selectedAgent ? <p className="text-gray-400">Select an agent to view logs.</p> : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto">
                {logs.length === 0 ? <p className="text-gray-500">No logs yet.</p> :
                  logs.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <span className="text-gray-600 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleTimeString()}</span>
                      <span className={"text-xs px-1.5 py-0.5 rounded " +
                        (log.type === "error" ? "bg-red-500/20 text-red-400" : log.type === "action" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400")}>
                        {log.type}
                      </span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className={"text-2xl font-bold " + (color === "red" ? "text-red-400" : "text-white")}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    running: "bg-green-500/20 text-green-400",
    paused: "bg-yellow-500/20 text-yellow-400",
    stopped: "bg-gray-500/20 text-gray-400",
    error: "bg-red-500/20 text-red-400",
  };
  return <span className={"px-2 py-0.5 rounded text-xs " + (colors[status] || colors.stopped)}>{status}</span>;
}
