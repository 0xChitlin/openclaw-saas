"use client";

import { useState } from "react";

const useCaseOptions = [
  "Email management",
  "Calendar & scheduling",
  "Customer support",
  "Data entry (Kintone/CRM)",
  "Workflow automation",
  "Social media management",
  "Other",
];

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !useCase) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, useCase, businessType }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("You're on the list! We'll be in touch soon. 🎉");
        setEmail("");
        setUseCase("");
        setBusinessType("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section id="waitlist" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/20 to-transparent pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Early Access
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get your <span className="gradient-text">AI employee</span> first
          </h2>
          <p className="text-gray-400">
            Join the waitlist for early access and founding member pricing.
          </p>
        </div>

        {/* Form */}
        {status === "success" ? (
          <div className="text-center p-8 rounded-2xl border border-green-500/30 bg-green-500/10">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-green-300 text-lg font-semibold">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email address *
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
              <label htmlFor="useCase" className="block text-sm font-medium text-gray-300 mb-1.5">
                What do you want to automate? *
              </label>
              <select
                id="useCase"
                required
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white transition appearance-none"
              >
                <option value="" className="text-gray-500">Select a use case</option>
                {useCaseOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-300 mb-1.5">
                Business type (optional)
              </label>
              <input
                type="text"
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g., Real estate agency, e-commerce, consulting"
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-gray-500 transition"
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
                  Joining...
                </span>
              ) : (
                "Join the Waitlist →"
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              No spam. No commitment. Just early access.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
