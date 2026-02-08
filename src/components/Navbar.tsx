"use client";

import { useState } from "react";
import ShimmerButton from "@/components/magicui/shimmer-button";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              DeskAgents
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Pricing
            </a>
            <a
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Login
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <ShimmerButton
              href="#pricing"
              className="!px-5 !py-2 !text-sm"
              shimmerColor="rgba(255,255,255,0.3)"
            >
              Get Started
            </ShimmerButton>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 mt-2 pt-4 space-y-3">
            <a
              href="#features"
              className="block text-sm text-slate-600 hover:text-slate-900 transition"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block text-sm text-slate-600 hover:text-slate-900 transition"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="block text-sm text-slate-600 hover:text-slate-900 transition"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <a
              href="/login"
              className="block text-sm text-slate-600 hover:text-slate-900 transition"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </a>
            <a
              href="#pricing"
              className="block text-sm px-4 py-2 rounded-lg bg-amber-500 text-white text-center font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
