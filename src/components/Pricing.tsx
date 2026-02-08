"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import BlurFade from "@/components/magicui/blur-fade";
import BorderBeam from "@/components/magicui/border-beam";

const plans = [
  {
    name: "Starter",
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
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "Business",
    monthlyPrice: 199,
    description: "For growing businesses",
    features: [
      "3 AI agents",
      "Everything in Starter",
      "Kintone integration",
      "WhatsApp & Telegram bots",
      "Unlimited automations",
      "Priority support",
      "Custom training",
    ],
    tier: "business",
    popular: true,
    isEnterprise: false,
    gradient: "from-amber-500/20 to-orange-500/20",
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
    gradient: "from-purple-500/20 to-pink-500/20",
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
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <BlurFade>
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-medium tracking-wider uppercase mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
              Less than hiring an intern. Your AI works 24/7 and never calls in
              sick.
            </p>
          </div>
        </BlurFade>

        {/* Billing toggle */}
        <BlurFade delay={0.1}>
          <div className="flex items-center justify-center gap-4 mb-14">
            <span
              className={`text-sm transition-colors ${
                !annual ? "text-white font-medium" : "text-neutral-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors border border-white/10 ${
                annual ? "bg-amber-500" : "bg-white/[0.1]"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                  annual ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span
              className={`text-sm transition-colors ${
                annual ? "text-white font-medium" : "text-neutral-500"
              }`}
            >
              Annual{" "}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Save 20%
              </span>
            </span>
          </div>
        </BlurFade>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? "border-amber-500/30 bg-white/[0.04] scale-[1.02] lg:scale-105"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
              }`}
            >
              {/* Border beam for popular plan */}
              {plan.popular && (
                <BorderBeam
                  size={150}
                  duration={10}
                  colorFrom="#f59e0b"
                  colorTo="#d97706"
                />
              )}

              {/* Most Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-semibold shadow-lg shadow-amber-500/20">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                {plan.description}
              </p>

              <div className="mb-6">
                {plan.isEnterprise ? (
                  <div>
                    <span className="text-4xl font-bold text-white">
                      Custom
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-bold text-white">
                      ${getPrice(plan.monthlyPrice)}
                    </span>
                    <span className="text-neutral-500">/mo</span>
                    {annual && (
                      <span className="ml-2 text-sm text-neutral-600 line-through">
                        ${plan.monthlyPrice}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {plan.isEnterprise ? (
                <a
                  href="mailto:hello@deskagents.com?subject=Enterprise%20Inquiry"
                  className="block w-full text-center py-3 rounded-xl font-semibold transition-all mb-8 border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.03]"
                >
                  Contact Sales
                </a>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.tier)}
                  disabled={loadingTier === plan.tier}
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition-all mb-8 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20"
                      : "border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  {loadingTier === plan.tier ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-neutral-400"
                  >
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
