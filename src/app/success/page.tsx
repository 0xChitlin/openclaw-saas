"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [automationGoal, setAutomationGoal] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, automationGoal, sessionId }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("We've got your info! Your AI agent setup begins now.");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome to <span className="gradient-text">DeskAgents</span>!
          </h1>
          <p className="text-gray-400 text-lg">
            Your payment was successful. Let&apos;s get your AI employee set up.
          </p>
        </div>

        {/* Onboarding form */}
        {status === "success" ? (
          <div className="text-center p-8 rounded-2xl border border-green-500/30 bg-green-500/10">
            <div className="text-4xl mb-4">🚀</div>
            <p className="text-green-300 text-lg font-semibold mb-2">{message}</p>
            <p className="text-gray-400 text-sm mt-4">
              We&apos;ll set up your AI agent within 24 hours and connect it to your preferred messaging app.
              Check your email for next steps.
            </p>
            <a
              href="/"
              className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all font-semibold"
            >
              Back to Home
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl border border-gray-800/60 bg-gray-900/50">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-gray-500 transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-gray-500 transition"
              />
            </div>

            <div>
              <label htmlFor="automationGoal" className="block text-sm font-medium text-gray-300 mb-1.5">
                What do you want your AI agent to automate?
              </label>
              <textarea
                id="automationGoal"
                value={automationGoal}
                onChange={(e) => setAutomationGoal(e.target.value)}
                placeholder="e.g., Reply to customer support emails, schedule meetings, update my CRM..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-gray-500 transition resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-sm">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed glow"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Complete Setup →"
              )}
            </button>

            <div className="text-center mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-sm text-gray-300">
                <span className="text-indigo-400 font-semibold">What happens next?</span>
                <br />
                We&apos;ll set up your AI agent within 24 hours and connect it to your preferred messaging app (WhatsApp, Telegram, email, etc.).
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
