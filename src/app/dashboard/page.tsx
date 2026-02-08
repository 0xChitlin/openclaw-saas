"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import StatusCard from "@/components/dashboard/StatusCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import IntegrationCard from "@/components/dashboard/IntegrationCard";

interface UserData {
  id: string;
  email: string;
  name: string;
  company: string;
  plan: string;
  agentStatus: string;
  integrations: string[];
  onboarded: boolean;
}

interface ActivityItem {
  id: string;
  type: "email" | "calendar" | "support" | "data" | "system";
  action: string;
  detail: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          router.push("/login");
          return;
        }
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        // Redirect to onboarding if not onboarded
        if (!sessionData.user.onboarded) {
          router.push("/onboarding");
          return;
        }

        const activityRes = await fetch("/api/dashboard/activity");
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivities(activityData.activities);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleAgentAction(action: "pause" | "resume") {
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
          <span className="text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <DashboardNav userName={user.name} currentPage="dashboard" />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Here&apos;s what your AI agent has been up to.
          </p>
        </div>

        {/* Quick Actions bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href="/onboarding"
            className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition font-medium text-white"
          >
            + Add Integration
          </a>
          <a
            href="/dashboard/settings"
            className="text-sm px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white transition font-medium"
          >
            Change Plan
          </a>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Status + Integrations */}
          <div className="lg:col-span-1 space-y-6">
            <StatusCard
              agentStatus={user.agentStatus}
              plan={user.plan}
              onPause={() => handleAgentAction("pause")}
              onResume={() => handleAgentAction("resume")}
            />
            <IntegrationCard integrations={user.integrations} />
          </div>

          {/* Right column — Activity feed */}
          <div className="lg:col-span-2">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </main>
    </div>
  );
}
