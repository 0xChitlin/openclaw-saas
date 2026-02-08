"use client";

import { useRouter } from "next/navigation";

interface DashboardNavProps {
  userName: string;
  currentPage?: "dashboard" | "settings" | "onboarding";
}

export default function DashboardNav({ userName, currentPage = "dashboard" }: DashboardNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <a href="/dashboard" className="text-xl font-bold">
              <span className="gradient-text">DeskAgents</span>
            </a>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <a
              href="/dashboard"
              className={`text-sm transition ${
                currentPage === "dashboard"
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Dashboard
            </a>
            <a
              href="/dashboard/settings"
              className={`text-sm transition ${
                currentPage === "settings"
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Settings
            </a>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 hidden sm:block">{userName}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-400 transition ml-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
