"use client";

interface IntegrationCardProps {
  integrations: string[];
}

interface IntegrationInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const allIntegrations: IntegrationInfo[] = [
  { id: "email", name: "Email (IMAP)", icon: "📧", description: "Read, reply, and sort emails" },
  { id: "calendar", name: "Google Calendar", icon: "📅", description: "Schedule and manage events" },
  { id: "messaging", name: "Messaging", icon: "💬", description: "WhatsApp & Telegram" },
];

export default function IntegrationCard({ integrations }: IntegrationCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Integrations</h2>
        <a
          href="/onboarding"
          className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium"
        >
          + Add Integration
        </a>
      </div>

      <div className="space-y-3">
        {allIntegrations.map((integration) => {
          const isConnected = integrations.includes(integration.id);
          return (
            <div
              key={integration.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isConnected
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-gray-800 bg-gray-800/30"
              }`}
            >
              <span className="text-xl">{integration.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{integration.name}</div>
                <div className="text-xs text-gray-400">{integration.description}</div>
              </div>
              {isConnected ? (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
              ) : (
                <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-indigo-500/30 hover:text-indigo-400 transition">
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
