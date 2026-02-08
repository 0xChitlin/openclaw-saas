"use client";

import { useEffect, useState, useCallback } from "react";
import AdminNav from "@/components/admin/AdminNav";
import AdminLogin from "@/components/admin/AdminLogin";
import StatsCard from "@/components/admin/StatsCard";
import CustomerTable from "@/components/admin/CustomerTable";
import AgentTable from "@/components/admin/AgentTable";
import LogViewer from "@/components/admin/LogViewer";

/* ── Types ── */

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  totalAgents: number;
  runningAgents: number;
  errorAgents: number;
  stoppedAgents: number;
  monthlyRevenue: number;
  uptime: number;
  totalLogs: number;
  todayLogs: number;
  planBreakdown: Array<{ plan: string; count: number }>;
}

interface Agent {
  id: string;
  customer_id: string;
  name: string;
  template: string;
  status: string;
  created_at: string;
  last_heartbeat: string;
  customer_name: string;
  customer_email: string;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  company: string;
  plan: string;
  agentStatus: string;
  createdAt: string;
  agentCount: number;
}

type TabKey = "overview" | "agents" | "customers";

/* ── Page ── */

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [logAgent, setLogAgent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    if (localStorage.getItem("da_admin_auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, agentsRes, customersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/agents"),
        fetch("/api/admin/customers"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.agents);
      }
      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  }, []);

  // Fetch data on auth + auto-refresh
  useEffect(() => {
    if (!authenticated) return;
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [authenticated, fetchAll]);

  function handleLogout() {
    localStorage.removeItem("da_admin_auth");
    setAuthenticated(false);
  }

  async function agentAction(
    agentId: string,
    action: "start" | "stop" | "restart"
  ) {
    setActionLoading(`${agentId}-${action}`);
    try {
      await fetch(`/api/admin/agents/${agentId}/${action}`, {
        method: "POST",
      });
      await fetchAll();
    } catch (err) {
      console.error(`Failed to ${action} agent:`, err);
    }
    setActionLoading(null);
  }

  async function handlePauseCustomerAgent(customerId: string) {
    // Find agent(s) for this customer and stop them
    const customerAgents = agents.filter(
      (a) => a.customer_id === customerId && a.status === "running"
    );
    for (const a of customerAgents) {
      await agentAction(a.id, "stop");
    }
  }

  async function handleDeleteCustomer(customerId: string) {
    try {
      await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE",
      });
      await fetchAll();
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  }

  function handleViewLogs(agentId: string) {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      setLogAgent({ id: agent.id, name: agent.name });
    }
  }

  // Login gate
  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "agents", label: "Agents", count: agents.length },
    { key: "customers", label: "Customers", count: customers.length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminNav onLogout={handleLogout} />

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6">
        <nav className="flex gap-6 max-w-7xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs text-gray-500">
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <>
            {stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatsCard
                    label="Total Customers"
                    value={stats.totalCustomers}
                    icon="👥"
                  />
                  <StatsCard
                    label="Active Agents"
                    value={stats.runningAgents}
                    icon="🤖"
                    color="green"
                  />
                  <StatsCard
                    label="Monthly Revenue"
                    value={`$${stats.monthlyRevenue.toLocaleString()}`}
                    icon="💰"
                  />
                  <StatsCard
                    label="Uptime"
                    value={`${stats.uptime}%`}
                    icon="📡"
                    color={stats.uptime >= 90 ? "green" : "yellow"}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatsCard
                    label="Total Agents"
                    value={stats.totalAgents}
                    icon="⚙️"
                  />
                  <StatsCard
                    label="Error Agents"
                    value={stats.errorAgents}
                    icon="⚠️"
                    color={stats.errorAgents > 0 ? "red" : "default"}
                  />
                  <StatsCard
                    label="Logs Today"
                    value={stats.todayLogs}
                    icon="📝"
                  />
                  <StatsCard
                    label="Stopped Agents"
                    value={stats.stoppedAgents}
                    icon="⏹"
                  />
                </div>

                {stats.planBreakdown.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      Plan Breakdown
                    </h3>
                    <div className="space-y-3">
                      {stats.planBreakdown.map((p) => (
                        <div
                          key={p.plan}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-300 capitalize">
                            {p.plan}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    (p.count / stats.totalCustomers) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="font-mono text-sm text-white w-8 text-right">
                              {p.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-400">Loading stats...</p>
              </div>
            )}
          </>
        )}

        {/* ── Agents Tab ── */}
        {activeTab === "agents" && (
          <AgentTable
            agents={agents}
            onStart={(id) => agentAction(id, "start")}
            onStop={(id) => agentAction(id, "stop")}
            onRestart={(id) => agentAction(id, "restart")}
            onViewLogs={handleViewLogs}
            actionLoading={actionLoading}
          />
        )}

        {/* ── Customers Tab ── */}
        {activeTab === "customers" && (
          <CustomerTable
            customers={customers}
            onPauseAgent={handlePauseCustomerAgent}
            onDelete={handleDeleteCustomer}
          />
        )}

        {/* ── Log Viewer Panel (overlays from any tab) ── */}
        {logAgent && (
          <div className="mt-6">
            <LogViewer
              agentId={logAgent.id}
              agentName={logAgent.name}
              onClose={() => setLogAgent(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
