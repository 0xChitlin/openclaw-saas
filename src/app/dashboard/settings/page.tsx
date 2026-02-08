"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

interface UserData {
  id: string;
  email: string;
  name: string;
  company: string;
  plan: string;
  agentStatus: string;
  integrations: string[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setCompany(data.user.company);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // silently handle
    } finally {
      setSaving(false);
    }
  }

  async function handleAgentAction(action: "pause" | "resume" | "delete") {
    if (!user) return;
    try {
      const res = await fetch("/api/dashboard/agent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, agentStatus: data.agentStatus });
        if (action === "delete") {
          router.push("/login");
        }
      }
    } catch {
      // silently handle
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const planLabels: Record<string, string> = {
    individual: "Individual — $97/mo",
    business: "Business — $297/mo",
    enterprise: "Enterprise — Custom",
  };

  return (
    <div className="min-h-screen">
      <DashboardNav userName={user.name} currentPage="settings" />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        {/* Profile Section */}
        <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm text-gray-400 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
              />
            </div>
            <div>
              <label htmlFor="settings-email" className="block text-sm text-gray-400 mb-1.5">
                Email
              </label>
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm text-gray-400 mb-1.5">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="text-sm px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {saved && (
                <span className="text-sm text-emerald-400">✓ Saved</span>
              )}
            </div>
          </form>
        </section>

        {/* Plan & Billing */}
        <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Plan & Billing</h2>
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-800 mb-4">
            <div>
              <div className="text-sm font-medium text-white">Current Plan</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {planLabels[user.plan] || user.plan}
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Active
            </span>
          </div>
          <a
            href="https://billing.stripe.com/p/login/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white transition font-medium"
          >
            Manage Billing →
          </a>
        </section>

        {/* Integrations */}
        <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Integrations</h2>
          <div className="space-y-3">
            {[
              { id: "email", name: "Email (IMAP)", icon: "📧" },
              { id: "calendar", name: "Google Calendar", icon: "📅" },
              { id: "messaging", name: "Messaging", icon: "💬" },
            ].map((integration) => {
              const isConnected = user.integrations.includes(integration.id);
              return (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-gray-800/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{integration.icon}</span>
                    <span className="text-sm text-white">{integration.name}</span>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400">Connected</span>
                      <button className="text-xs text-gray-500 hover:text-red-400 transition">
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-indigo-500/30 hover:text-indigo-400 transition">
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">
                  {user.agentStatus === "paused" ? "Resume Agent" : "Pause Agent"}
                </div>
                <div className="text-xs text-gray-400">
                  {user.agentStatus === "paused"
                    ? "Your agent is currently paused. Resume to start processing again."
                    : "Temporarily stop your agent from processing tasks."}
                </div>
              </div>
              <button
                onClick={() =>
                  handleAgentAction(user.agentStatus === "paused" ? "resume" : "pause")
                }
                className={`text-xs px-4 py-2 rounded-lg border transition font-medium ${
                  user.agentStatus === "paused"
                    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                }`}
              >
                {user.agentStatus === "paused" ? "Resume" : "Pause"}
              </button>
            </div>

            <div className="border-t border-red-500/10 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Delete Agent</div>
                  <div className="text-xs text-gray-400">
                    Permanently delete your agent and all associated data.
                  </div>
                </div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAgentAction("delete")}
                      className="text-xs px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs px-3 py-2 text-gray-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
