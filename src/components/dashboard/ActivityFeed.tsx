"use client";

interface ActivityItem {
  id: string;
  type: "email" | "calendar" | "support" | "data" | "system";
  action: string;
  detail: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const typeIcons: Record<string, string> = {
  email: "📧",
  calendar: "📅",
  support: "🎫",
  data: "📊",
  system: "⚙️",
};

const typeColors: Record<string, string> = {
  email: "border-blue-500/30 bg-blue-500/5",
  calendar: "border-green-500/30 bg-green-500/5",
  support: "border-orange-500/30 bg-orange-500/5",
  data: "border-purple-500/30 bg-purple-500/5",
  system: "border-gray-500/30 bg-gray-500/5",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <span className="text-xs text-gray-500">{activities.length} actions</span>
      </div>

      <div className="space-y-3">
        {activities.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${typeColors[item.type] || typeColors.system} transition hover:border-gray-600`}
          >
            <span className="text-lg mt-0.5">{typeIcons[item.type] || "📋"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white">{item.action}</span>
                <span className="text-xs text-gray-500 shrink-0">{timeAgo(item.timestamp)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
