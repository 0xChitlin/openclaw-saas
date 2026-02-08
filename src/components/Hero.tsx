"use client";

import { motion } from "framer-motion";
import WordRotate from "@/components/magicui/word-rotate";
import ShimmerButton from "@/components/magicui/shimmer-button";
import Particles from "@/components/magicui/particles";
import BorderBeam from "@/components/magicui/border-beam";
import Marquee from "@/components/magicui/marquee";

const trustLogos = [
  "Stripe",
  "Shopify",
  "HubSpot",
  "Notion",
  "Slack",
  "Zapier",
  "Salesforce",
  "Monday",
  "Asana",
  "Intercom",
];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle particle background */}
      <Particles
        className="absolute inset-0"
        quantity={40}
        color="#f59e0b"
        size={1}
        speed={0.2}
        opacity={0.3}
      />

      {/* Gradient orbs */}
      <div className="hero-glow absolute top-20 left-1/4 w-[500px] h-[500px] bg-amber-300 opacity-[0.07]" />
      <div className="hero-glow absolute top-40 right-1/4 w-[400px] h-[400px] bg-orange-300 opacity-[0.05]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          Now serving 500+ businesses worldwide
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.08]"
        >
          Your AI{" "}
          <span className="text-amber-500">
            <WordRotate
              words={[
                "Email Manager",
                "Support Agent",
                "Data Entry Bot",
                "Calendar Assistant",
              ]}
              duration={2500}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          Hire an AI employee that works 24/7. Handles email, schedules
          meetings, answers customers, and enters data — no code required.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <ShimmerButton href="#pricing">Start Free Trial</ShimmerButton>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-all text-lg font-medium hover:shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Watch Demo
          </a>
        </motion.div>

        {/* Social proof badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            No technical skills needed
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Setup in 24 hours
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Cancel anytime
          </div>
        </motion.div>
      </div>

      {/* Product mockup with BorderBeam */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative max-w-4xl mx-auto mt-16"
      >
        <div className="relative rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
          <BorderBeam
            size={250}
            duration={12}
            colorFrom="#f59e0b"
            colorTo="#fbbf24"
          />

          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-amber-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-lg border border-slate-200 px-4 py-1.5 text-xs text-slate-400 max-w-sm mx-auto flex items-center gap-2">
                <svg
                  className="w-3 h-3 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z"
                    clipRule="evenodd"
                  />
                </svg>
                app.deskagents.com/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard mock */}
          <div className="p-6 bg-gradient-to-b from-slate-50/50 to-white">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs text-slate-400 mb-1 font-medium">
                  Emails Handled
                </p>
                <p className="text-2xl font-bold text-slate-900">1,247</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  ↑ 12% this week
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs text-slate-400 mb-1 font-medium">
                  Meetings Scheduled
                </p>
                <p className="text-2xl font-bold text-slate-900">83</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  ↑ 8% this week
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs text-slate-400 mb-1 font-medium">
                  Support Tickets
                </p>
                <p className="text-2xl font-bold text-slate-900">342</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  96% resolved
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-xs text-slate-400 mb-3 font-medium">
                Recent Activity
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-600">
                    Replied to invoice inquiry from Acme Corp
                  </span>
                  <span className="text-slate-300 ml-auto text-xs">2m ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-600">
                    Scheduled demo call with Sarah Chen
                  </span>
                  <span className="text-slate-300 ml-auto text-xs">8m ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-600">
                    Updated CRM record for deal #4821
                  </span>
                  <span className="text-slate-300 ml-auto text-xs">
                    15m ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-20 mb-4"
      >
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-300 mb-8">
          Trusted by forward-thinking companies
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          <Marquee speed={30} pauseOnHover>
            {trustLogos.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center mx-8"
              >
                <span className="text-xl font-semibold text-slate-200 select-none whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      </motion.div>
    </section>
  );
}
