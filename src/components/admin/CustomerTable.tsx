"use client";

import { useState, useMemo } from "react";

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

interface CustomerTableProps {
  customers: Customer[];
  onPauseAgent: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortKey = "name" | "email" | "plan" | "agentStatus" | "createdAt";
type SortDir = "asc" | "desc";

export default function CustomerTable({
  customers,
  onPauseAgent,
  onDelete,
}: CustomerTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.plan.toLowerCase().includes(q)
    );

    list.sort((a, b) => {
      const valA = a[sortKey] || "";
      const valB = b[sortKey] || "";
      const cmp = String(valA).localeCompare(String(valB));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [customers, search, sortKey, sortDir]);

  const SortHeader = ({
    label,
    field,
  }: {
    label: string;
    field: SortKey;
  }) => (
    <th
      className="text-left px-4 py-3 cursor-pointer hover:text-gray-200 select-none"
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortKey === field && (
        <span className="ml-1 text-indigo-400">
          {sortDir === "asc" ? "↑" : "↓"}
        </span>
      )}
    </th>
  );

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    paused: "bg-yellow-500/20 text-yellow-400",
    error: "bg-red-500/20 text-red-400",
    inactive: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Customers ({filtered.length})
        </h2>
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No customers found.</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <SortHeader label="Name" field="name" />
                <SortHeader label="Email" field="email" />
                <SortHeader label="Plan" field="plan" />
                <SortHeader label="Agent Status" field="agentStatus" />
                <SortHeader label="Created" field="createdAt" />
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.company}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-xs capitalize">
                      {c.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        statusColors[c.agentStatus] || statusColors.inactive
                      }`}
                    >
                      {c.agentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => onPauseAgent(c.id)}
                      className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30 transition-colors"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete customer ${c.name}?`)) {
                          onDelete(c.id);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
