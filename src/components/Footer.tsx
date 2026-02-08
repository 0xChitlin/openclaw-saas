export default function Footer() {
  return (
    <footer className="border-t border-slate-100 py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              DeskAgents
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-slate-500">
            <a
              href="#features"
              className="hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-slate-900 transition-colors"
            >
              Pricing
            </a>
            <a
              href="/login"
              className="hover:text-slate-900 transition-colors"
            >
              Login
            </a>
            <a
              href="mailto:hello@deskagents.com"
              className="hover:text-slate-900 transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} DeskAgents. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
