"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import OnboardingStep from "@/components/dashboard/OnboardingStep";

const TASK_OPTIONS = [
  { id: "email", label: "📧 Email Management", desc: "Auto-sort, reply, and draft emails" },
  { id: "calendar", label: "📅 Calendar", desc: "Schedule and manage appointments" },
  { id: "support", label: "🎫 Customer Support", desc: "Handle tickets and inquiries" },
  { id: "data", label: "📊 Data Entry", desc: "Automate forms and databases" },
  { id: "custom", label: "🛠 Custom", desc: "Tell us what you need" },
];

const TOOL_OPTIONS = [
  { id: "email", label: "Email (IMAP)", icon: "📧", desc: "Connect your email inbox" },
  { id: "calendar", label: "Google Calendar", icon: "📅", desc: "Sync your calendar" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", desc: "Business messaging" },
  { id: "telegram", label: "Telegram", icon: "✈️", desc: "Telegram bot integration" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [responseStyle, setResponseStyle] = useState("formal");
  const [notifications, setNotifications] = useState("email");

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUserName(data.user.name);
    }
    checkAuth();
  }, [router]);

  function toggleTask(id: string) {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function toggleTool(id: string) {
    setSelectedTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleFinish() {
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: selectedTasks,
          tools: selectedTools,
          workHours: { start: workStart, end: workEnd },
          responseStyle,
          notifications,
        }),
      });
      setStep(3);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardNav userName={userName} currentPage="onboarding" />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Step 0: Tasks */}
        {step === 0 && (
          <OnboardingStep
            step={0}
            totalSteps={4}
            title="What should your agent do?"
            description="Select the tasks you want your AI employee to handle."
            onNext={() => setStep(1)}
            nextLabel="Continue →"
          >
            <div className="space-y-3">
              {TASK_OPTIONS.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full text-left p-4 rounded-lg border transition ${
                    selectedTasks.includes(task.id)
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        selectedTasks.includes(task.id)
                          ? "border-indigo-500 bg-indigo-500"
                          : "border-gray-600"
                      }`}
                    >
                      {selectedTasks.includes(task.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{task.label}</div>
                      <div className="text-xs text-gray-400">{task.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </OnboardingStep>
        )}

        {/* Step 1: Tools */}
        {step === 1 && (
          <OnboardingStep
            step={1}
            totalSteps={4}
            title="Connect your tools"
            description="Which tools should your agent have access to?"
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
            nextLabel="Continue →"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOOL_OPTIONS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`text-left p-4 rounded-lg border transition ${
                    selectedTools.includes(tool.id)
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                  }`}
                >
                  <div className="text-2xl mb-2">{tool.icon}</div>
                  <div className="text-sm font-medium text-white">{tool.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{tool.desc}</div>
                  {selectedTools.includes(tool.id) && (
                    <div className="text-xs text-indigo-400 mt-2 font-medium">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
          </OnboardingStep>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <OnboardingStep
            step={2}
            totalSteps={4}
            title="Set your preferences"
            description="Customize how your agent works."
            onNext={handleFinish}
            onBack={() => setStep(1)}
            nextLabel="Set Up My Agent →"
            isLoading={loading}
          >
            <div className="space-y-6">
              {/* Work hours */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Work Hours
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="time"
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Response style */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Response Style
                </label>
                <div className="flex gap-3">
                  {["formal", "casual"].map((style) => (
                    <button
                      key={style}
                      onClick={() => setResponseStyle(style)}
                      className={`flex-1 p-3 rounded-lg border text-sm font-medium transition ${
                        responseStyle === style
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                          : "border-gray-800 text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      {style === "formal" ? "🎩 Formal" : "😊 Casual"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Notification Preferences
                </label>
                <div className="space-y-2">
                  {[
                    { id: "email", label: "📧 Email notifications" },
                    { id: "push", label: "🔔 Push notifications" },
                    { id: "none", label: "🔇 No notifications" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setNotifications(option.id)}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition ${
                        notifications === option.id
                          ? "border-indigo-500 bg-indigo-500/10 text-white"
                          : "border-gray-800 text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </OnboardingStep>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto text-center py-12">
            {/* Progress bar - complete */}
            <div className="flex items-center gap-2 mb-12">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                />
              ))}
            </div>

            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Your agent is being set up!
            </h1>
            <p className="text-gray-400 mb-2">
              We&apos;re configuring your AI employee with your preferences.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Estimated time: 2-5 minutes
            </p>

            {/* Status steps */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-left space-y-4 mb-8">
              {[
                { label: "Account verified", done: true },
                { label: "Preferences saved", done: true },
                { label: "Connecting integrations", done: false },
                { label: "Training agent on your workflow", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.done ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  )}
                  <span
                    className={`text-sm ${item.done ? "text-gray-300" : "text-white font-medium"}`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="/dashboard"
              className="inline-block text-sm px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition font-medium text-white"
            >
              Go to Dashboard →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
