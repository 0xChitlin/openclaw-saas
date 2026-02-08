"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import ShineBorder from "@/components/magicui/shine-border";
import NumberTicker from "@/components/magicui/number-ticker";
import ShimmerButton from "@/components/magicui/shimmer-button";

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
    <section
      id="pricing"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50"
    >
      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Less than hiring an intern. Your AI works 24/7 and never calls in
              sick.
            </p>
          </div>
        </BlurFade>

        {/* Billing toggle */}
        <BlurFade delay={0.1}>
          <div className="flex items-center justify-center gap-3 mb-14">
            <span
              className={`text-sm transition-colors ${
                !annual ? "text-slate-900 font-semibold" : "text-slate-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors shadow-inner ${
                annual ? "bg-amber-500" : "bg-slate-200"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                  annual ? "translate-x-7" : ""
                }`}
              />
            </button>
            <span
              className={`text-sm transition-colors ${
                annual ? "text-slate-900 font-semibold" : "text-slate-400"
              }`}
            >
              Annual{" "}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold ml-1">
                Save 20%
              </span>
            </span>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, idx) => {
            const price = getPrice(plan.monthlyPrice);

            const card = (
              <div
                className={`rounded-2xl p-8 h-full ${
                  plan.popular
                    ? "bg-white relative"
                    : "bg-white border border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-200/50">
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900">
                    $<NumberTicker value={price} />
                  </span>
                  <span className="text-slate-400 text-lg">/mo</span>
                </div>

                {plan.isEnterprise ? (
                  <a
                    href="mailto:hello@deskagents.com?subject=Enterprise%20Inquiry"
                    className="block w-full text-center py-3.5 rounded-xl font-semibold transition-all border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 mb-8"
                  >
                    Contact Sales
                  </a>
                ) : plan.popular ? (
                  <div className="mb-8">
                    <ShimmerButton
                      onClick={() => handleCheckout(plan.tier)}
                      className="!w-full !py-3.5"
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
                    </ShimmerButton>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.tier)}
                    disabled={loadingTier === plan.tier}
                    className="block w-full text-center py-3.5 rounded-xl font-semibold transition-all mb-8 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
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
                  {plan.features.map((feature, featureIdx) => (
                    <BlurFade
                      key={feature}
                      delay={0.3 + featureIdx * 0.05}
                    >
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-amber-600" />
                        </div>
                        {feature}
                      </li>
                    </BlurFade>
                  ))}
                </ul>
              </div>
            );

            if (plan.popular) {
              return (
                <BlurFade key={plan.name} delay={0.15 + idx * 0.1}>
                  <ShineBorder
                    borderRadius={16}
                    borderWidth={2}
                    duration={6}
                    color={["#f59e0b", "#fbbf24", "#d97706"]}
                  >
                    {card}
                  </ShineBorder>
                </BlurFade>
              );
            }

            return (
              <BlurFade key={plan.name} delay={0.15 + idx * 0.1}>
                {card}
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
