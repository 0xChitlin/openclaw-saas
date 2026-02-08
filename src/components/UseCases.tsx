"use client";

import { motion } from "framer-motion";
import { Store, Rocket, Building2 } from "lucide-react";

const audiences = [
  {
    icon: Store,
    title: "Small Business Owners",
    description:
      "Stop drowning in admin. Your AI handles invoicing follow-ups, appointment scheduling, and customer inquiries while you run your business.",
  },
  {
    icon: Rocket,
    title: "Solopreneurs",
    description:
      "Scale without hiring. From inbox management to CRM updates, get the output of a full team at a fraction of the cost.",
  },
  {
    icon: Building2,
    title: "Agencies",
    description:
      "Deploy AI agents for each client. Automate workflows, generate reports, and manage more clients without adding headcount.",
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Who it&apos;s for
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            If you spend hours on repetitive tasks, you need an AI employee.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {audiences.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="rounded-xl border border-slate-200 bg-white p-8 hover:shadow-lg hover:shadow-slate-100 transition-shadow duration-300"
            >
              <item.icon className="w-8 h-8 text-amber-500 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
