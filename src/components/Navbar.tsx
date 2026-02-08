"use client";

import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">OpenClaw</span>
              <span className="text-gray-400 font-normal ml-1">SaaS</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition">
              Features
            </a>
            <a href="#use-cases" className="text-sm text-gray-400 hover:text-white transition">
              Use Cases
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">
              Pricing
            </a>
            <a
              href="#waitlist"
              className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition font-medium"
            >
              Join Waitlist
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-800/50 mt-2 pt-4 space-y-3">
            <a href="#features" className="block text-sm text-gray-400 hover:text-white transition" onClick={() => setMobileOpen(false)}>
              Features
            </a>
            <a href="#use-cases" className="block text-sm text-gray-400 hover:text-white transition" onClick={() => setMobileOpen(false)}>
              Use Cases
            </a>
            <a href="#pricing" className="block text-sm text-gray-400 hover:text-white transition" onClick={() => setMobileOpen(false)}>
              Pricing
            </a>
            <a
              href="#waitlist"
              className="block text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-center font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Join Waitlist
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
