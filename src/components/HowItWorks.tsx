"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Sign Up",
    description: "Choose your plan and tell us what you need automated.",
  },
  {
    number: "2",
    title: "We Set Up",
    description: "Our team configures your AI agent within 24 hours.",
  },
  {
    number: "3",
    title: "Sit Back",
    description: "Your agent works 24/7 handling tasks while you focus on growth.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            How it works
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Three steps. No technical skills required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-slate-300" />

          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="text-center relative"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-white text-lg font-bold mb-4 relative z-10">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
