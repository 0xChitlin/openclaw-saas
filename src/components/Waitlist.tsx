"use client";

import BlurFade from "@/components/magicui/blur-fade";
import ShimmerButton from "@/components/magicui/shimmer-button";
import DotPattern from "@/components/magicui/dot-pattern";

export default function Waitlist() {
  return (
    <section id="cta" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dot pattern background */}
      <DotPattern
        className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
        width={20}
        height={20}
        cr={1}
        color="rgba(245, 158, 11, 0.3)"
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <BlurFade delay={0}>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-3">
            Get Started Today
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Ready to hire your
            <br />
            <span className="text-amber-500">AI employee?</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Stop spending hours on tasks an AI can handle. Pick a plan and have
            your agent running within 24 hours.
          </p>
        </BlurFade>

        <BlurFade delay={0.2}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <ShimmerButton href="#pricing">View Pricing</ShimmerButton>
            <a
              href="mailto:hello@deskagents.com"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-all text-lg font-medium hover:shadow-sm"
            >
              Talk to Us
            </a>
          </div>
        </BlurFade>

        <BlurFade delay={0.3}>
          <p className="mt-8 text-sm text-slate-400">
            No credit card required · Free 14-day trial · Cancel anytime
          </p>
        </BlurFade>
      </div>
    </section>
  );
}
