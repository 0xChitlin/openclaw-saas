"use client";

interface StatusCardProps {
  agentStatus: string;
  plan: string;
  onPause: () => void;
  onResume: () => void;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-emerald-400", dot: "bg-emerald-400" },
  setting_up: { label: "Setting Up", color: "text-yellow-400", dot: "bg-yellow-400" },
  paused: { label: "Paused", color: "text-gray-400", dot: "bg-gray-400" },
  deleted: { label: "Deleted", color: "text-red-400", dot: "bg-red-400" },
};

const planLabels: Record<string, string> = {
  individual: "Individual",
  business: "Business",
  enterprise: "Enterprise",
};

export default function StatusCard({ agentStatus, plan, onPause, onResume }: StatusCardProps) {
  const status = statusConfig[agentStatus] || statusConfig.active;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 glow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Your AI Agent</h2>
        <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
          {planLabels[plan] || plan} Plan
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className={`w-3 h-3 rounded-full ${status.dot} animate-pulse`} />
        <span className={`text-2xl font-bold ${status.color}`}>{status.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-gray-800/50">
          <div className="text-2xl font-bold text-white">147</div>
          <div className="text-xs text-gray-400 mt-1">Tasks Today</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-800/50">
          <div className="text-2xl font-bold text-white">98%</div>
          <div className="text-xs text-gray-400 mt-1">Success Rate</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-800/50">
          <div className="text-2xl font-bold text-white">3.2h</div>
          <div className="text-xs text-gray-400 mt-1">Time Saved</div>
        </div>
      </div>

      <div className="flex gap-3">
        {agentStatus === "active" ? (
          <button
            onClick={onPause}
            className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition font-medium"
          >
            ⏸ Pause Agent
          </button>
        ) : agentStatus === "paused" ? (
          <button
            onClick={onResume}
            className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition font-medium text-white"
          >
            ▶ Resume Agent
          </button>
        ) : null}
        <a
          href="/dashboard/settings"
          className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white transition text-center font-medium"
        >
          ⚙ Settings
        </a>
      </div>
    </div>
  );
}
