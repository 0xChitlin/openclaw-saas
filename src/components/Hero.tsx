"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]"
        >
          Your AI Employee
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          We set up and manage AI agents that handle your email, calendar, 
          customer support, and data entry — so you can focus on growing your business.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-lg font-semibold transition-colors"
          >
            Get Started
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors text-lg font-medium"
          >
            How It Works
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No technical skills needed
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Setup in 24 hours
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Cancel anytime
          </div>
        </motion.div>
      </div>

      {/* Product mockup — browser window */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="max-w-4xl mx-auto mt-16"
      >
        <div className="rounded-xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-400 max-w-sm mx-auto">
                app.deskagents.com/dashboard
              </div>
            </div>
          </div>
          {/* Mock dashboard */}
          <div className="p-6 bg-slate-50">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-400 mb-1">Emails Handled</p>
                <p className="text-2xl font-bold text-slate-900">1,247</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 12% this week</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-400 mb-1">Meetings Scheduled</p>
                <p className="text-2xl font-bold text-slate-900">83</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 8% this week</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-400 mb-1">Support Tickets</p>
                <p className="text-2xl font-bold text-slate-900">342</p>
                <p className="text-xs text-emerald-600 mt-1">96% resolved</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-3">Recent Activity</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-600">Replied to invoice inquiry from Acme Corp</span>
                  <span className="text-slate-300 ml-auto text-xs">2m ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-600">Scheduled demo call with Sarah Chen</span>
                  <span className="text-slate-300 ml-auto text-xs">8m ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-600">Updated CRM record for deal #4821</span>
                  <span className="text-slate-300 ml-auto text-xs">15m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
