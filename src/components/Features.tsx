"use client";

import { motion } from "framer-motion";
import { Mail, Calendar, Headphones, Database, Workflow, Shield } from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Email Management",
    description:
      "Reads, categorizes, and drafts replies. Flags urgent messages so nothing slips through.",
  },
  {
    icon: Calendar,
    title: "Calendar & Scheduling",
    description:
      "Books meetings, resolves conflicts, and sends reminders. Your calendar runs itself.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "24/7 responses across email, WhatsApp, and Telegram. Customers get instant, accurate answers.",
  },
  {
    icon: Database,
    title: "Data Entry & CRM",
    description:
      "Updates spreadsheets, Kintone, and databases automatically. No more manual entry.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Connects your tools into automated workflows. AI that understands context, not just triggers.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Isolated instances, encrypted storage, and SOC 2-ready architecture. Your data stays yours.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Everything your business needs, automated
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            One AI agent that learns your business and handles the work you shouldn&apos;t be doing yourself.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:shadow-slate-100 transition-shadow duration-300"
            >
              <feature.icon className="w-6 h-6 text-amber-500 mb-4" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
