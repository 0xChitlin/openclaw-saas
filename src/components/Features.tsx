"use client";

import {
  Mail,
  Calendar,
  Headphones,
  Database,
  Workflow,
  Shield,
} from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Mail,
    title: "Email Management",
    description:
      "Reads, categorizes, and drafts replies. Flags urgent messages so nothing slips through the cracks.",
    className: "md:col-span-2",
    accent: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    icon: Calendar,
    title: "Calendar & Scheduling",
    description:
      "Books meetings, resolves conflicts, sends reminders. Your calendar runs itself.",
    className: "md:col-span-1",
    accent: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "24/7 responses across email, WhatsApp, and Telegram. Instant, accurate answers.",
    className: "md:col-span-1",
    accent: "from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Database,
    title: "Data Entry & CRM",
    description:
      "Updates spreadsheets, Kintone, and databases automatically. Zero manual entry.",
    className: "md:col-span-1",
    accent: "from-purple-50 to-violet-50",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Connects your tools into intelligent workflows. AI that understands context, not just triggers.",
    className: "md:col-span-1",
    accent: "from-rose-50 to-pink-50",
    iconBg: "bg-rose-100 text-rose-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Isolated instances, encrypted storage, SOC 2-ready architecture. Your data stays yours.",
    className: "md:col-span-2",
    accent: "from-slate-50 to-gray-50",
    iconBg: "bg-slate-100 text-slate-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-3">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Everything your business needs,
              <br />
              <span className="text-slate-400">automated</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              One AI agent that learns your business and handles the work you
              shouldn&apos;t be doing yourself.
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <BlurFade key={feature.title} delay={0.1 + idx * 0.08}>
              <div
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-slate-200/80 p-6 sm:p-8",
                  "bg-gradient-to-br transition-all duration-500",
                  "hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100/80",
                  "hover:-translate-y-0.5",
                  feature.accent,
                  feature.className
                )}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-400/0 group-hover:from-amber-400/[0.02] group-hover:to-transparent transition-all duration-500" />

                <div className="relative z-10">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4",
                      feature.iconBg
                    )}
                  >
                    <feature.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
