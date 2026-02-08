"use client";

import { motion } from "framer-motion";

export default function Waitlist() {
  return (
    <section id="cta" className="py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Ready to get started?
        </h2>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
          Stop spending hours on tasks an AI can handle. Pick a plan and have your agent running within 24 hours.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-lg font-semibold transition-colors"
          >
            View Pricing
          </a>
          <a
            href="mailto:hello@deskagents.com"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors text-lg font-medium"
          >
            Talk to Us
          </a>
        </div>
      </motion.div>
    </section>
  );
}
