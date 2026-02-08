"use client";

import { ArrowRight } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";

export default function Waitlist() {
  return (
    <section id="cta" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-amber-500/[0.06] rounded-full blur-[100px]" />
      </div>

      <BlurFade>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Ready to hire your
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              AI employee?
            </span>
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-xl mx-auto">
            Join 2,400+ businesses that are saving 20+ hours per week with
            DeskAgents.
          </p>

          {/* Email capture */}
          <div className="mt-10 max-w-md mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = "#pricing";
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:from-amber-400 hover:to-orange-400 transition-all flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-3 text-xs text-neutral-600">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
