"use client";

import { useState, useMemo } from "react";

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

interface AgentTableProps {
  agents: Agent[];
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onViewLogs: (id: string) => void;
  actionLoading: string | null;
}

export default function AgentTable({
  agents,
  onStart,
  onStop,
  onRestart,
  onViewLogs,
  actionLoading,
}: AgentTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.template.toLowerCase().includes(q) ||
        a.customer_name.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
    );
  }, [agents, search]);

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    running: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      dot: "bg-green-400",
    },
    stopped: {
      bg: "bg-gray-500/20",
      text: "text-gray-400",
      dot: "bg-gray-400",
    },
    error: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      dot: "bg-red-400",
    },
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Agents ({filtered.length})
        </h2>
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No agents found.</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Agent</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Template</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Last Heartbeat</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((agent) => {
                const sc = statusConfig[agent.status] || statusConfig.stopped;
                return (
                  <tr
                    key={agent.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{agent.name}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {agent.id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300">{agent.customer_name}</div>
                      <div className="text-xs text-gray-500">
                        {agent.customer_email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {agent.template}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${sc.bg} ${sc.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                        />
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {timeAgo(agent.last_heartbeat)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStart(agent.id)}
                          disabled={
                            actionLoading === `${agent.id}-start` ||
                            agent.status === "running"
                          }
                          className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          ▶ Start
                        </button>
                        <button
                          onClick={() => onStop(agent.id)}
                          disabled={
                            actionLoading === `${agent.id}-stop` ||
                            agent.status === "stopped"
                          }
                          className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          ⏹ Stop
                        </button>
                        <button
                          onClick={() => onRestart(agent.id)}
                          disabled={actionLoading === `${agent.id}-restart`}
                          className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => onViewLogs(agent.id)}
                          className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
                        >
                          📋 Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
