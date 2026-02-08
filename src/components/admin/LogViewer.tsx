"use client";

import { useState, useEffect, useRef, useMemo } from "react";

interface LogEntry {
  id: number;
  agent_id: string;
  type: string;
  message: string;
  created_at: string;
}

interface LogViewerProps {
  agentId: string;
  agentName: string;
  onClose: () => void;
}

export default function LogViewer({
  agentId,
  agentName,
  onClose,
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        const res = await fetch(`/api/admin/agents/${agentId}/logs?limit=100`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setLogs(data.logs);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [agentId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return logs;
    return logs.filter((l) => l.type === typeFilter);
  }, [logs, typeFilter]);

  // Show in chronological order (oldest first) for log viewing
  const chronological = useMemo(() => {
    return [...filtered].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [filtered]);

  const typeColors: Record<string, string> = {
    info: "bg-blue-500/20 text-blue-400",
    error: "bg-red-500/20 text-red-400",
    action: "bg-green-500/20 text-green-400",
  };

  const messageColors: Record<string, string> = {
    info: "text-blue-200",
    error: "text-red-200",
    action: "text-green-200",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">
            📋 Logs — {agentName}
          </h3>
          <span className="text-xs text-gray-500 font-mono">{agentId}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
          >
            <option value="all">All types</option>
            <option value="info">Info</option>
            <option value="error">Errors</option>
            <option value="action">Actions</option>
          </select>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 rounded transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Log content */}
      <div className="p-4 font-mono text-xs max-h-[500px] overflow-y-auto space-y-0.5 bg-gray-950/50">
        {loading ? (
          <p className="text-gray-500">Loading logs...</p>
        ) : chronological.length === 0 ? (
          <p className="text-gray-500">No logs found.</p>
        ) : (
          chronological.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 py-0.5 hover:bg-gray-800/30 px-1 rounded"
            >
              <span className="text-gray-600 whitespace-nowrap shrink-0">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <span
                className={`px-1.5 py-0 rounded text-[10px] uppercase tracking-wider shrink-0 ${
                  typeColors[log.type] || "bg-gray-700 text-gray-400"
                }`}
              >
                {log.type}
              </span>
              <span className={messageColors[log.type] || "text-gray-300"}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
