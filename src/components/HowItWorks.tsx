"use client";

import BlurFade from "@/components/magicui/blur-fade";
import NumberTicker from "@/components/magicui/number-ticker";
import { UserPlus, Settings, Zap } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: "Sign Up",
    description:
      "Choose your plan and tell us what you need automated. Takes 2 minutes.",
  },
  {
    number: 2,
    icon: Settings,
    title: "We Configure",
    description:
      "Our team configures and trains your AI agent within 24 hours. Custom to your business.",
  },
  {
    number: 3,
    icon: Zap,
    title: "Sit Back & Scale",
    description:
      "Your agent works 24/7 handling tasks while you focus on growth. Monitor everything in your dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50"
    >
      <div className="max-w-5xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Three steps to your
              <br />
              <span className="text-slate-400">AI workforce</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              No technical skills required. We handle everything.
            </p>
          </div>
        </BlurFade>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px">
            <div className="h-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, idx) => (
              <BlurFade key={step.number} delay={0.15 + idx * 0.15}>
                <div className="text-center relative">
                  {/* Step number circle */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xl font-bold mb-6 relative z-10 shadow-lg shadow-amber-200/50">
                    <NumberTicker value={step.number} />
                  </div>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600 mx-auto mb-4">
                    <step.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
