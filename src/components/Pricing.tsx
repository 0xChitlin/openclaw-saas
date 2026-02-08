"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Individual",
    monthlyPrice: 49,
    description: "For solopreneurs and freelancers",
    features: [
      "1 AI agent",
      "Email management",
      "Calendar automation",
      "Basic customer support",
      "5 workflow automations",
      "Email support",
    ],
    tier: "individual",
    popular: false,
    isEnterprise: false,
  },
  {
    name: "Business",
    monthlyPrice: 199,
    description: "For growing businesses",
    features: [
      "3 AI agents",
      "Everything in Individual",
      "Kintone integration",
      "WhatsApp & Telegram bots",
      "Unlimited automations",
      "Priority support",
      "Custom training",
    ],
    tier: "business",
    popular: true,
    isEnterprise: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: 999,
    description: "For agencies and large teams",
    features: [
      "Unlimited AI agents",
      "Everything in Business",
      "Dedicated instance",
      "SSO & advanced security",
      "API access",
      "White-label option",
      "Dedicated account manager",
      "Custom integrations",
    ],
    tier: "enterprise",
    popular: false,
    isEnterprise: true,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  async function handleCheckout(tier: string) {
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  }

  function getPrice(monthlyPrice: number) {
    if (annual) {
      return Math.round(monthlyPrice * 0.8);
    }
    return monthlyPrice;
  }

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Less than hiring an intern. Your AI works 24/7 and never calls in sick.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm ${!annual ? "text-slate-900 font-medium" : "text-slate-400"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-amber-500" : "bg-slate-300"}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                annual ? "translate-x-6" : ""
              }`}
            />
          </button>
          <span className={`text-sm ${annual ? "text-slate-900 font-medium" : "text-slate-400"}`}>
            Annual <span className="text-amber-600 font-medium">(-20%)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 ${
                plan.popular
                  ? "bg-white border-2 border-amber-500 shadow-lg shadow-amber-100/50 relative"
                  : "bg-white border border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-semibold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">${getPrice(plan.monthlyPrice)}</span>
                <span className="text-slate-400">/mo</span>
              </div>

              {plan.isEnterprise ? (
                <a
                  href="mailto:hello@deskagents.com?subject=Enterprise%20Inquiry"
                  className="block w-full text-center py-3 rounded-lg font-semibold transition-colors mb-8 border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Contact Us
                </a>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.tier)}
                  disabled={loadingTier === plan.tier}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {loadingTier === plan.tier ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Get Started"
                  )}
                </button>
              )}

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
