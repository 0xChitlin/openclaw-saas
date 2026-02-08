export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">⚡</span>
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">DeskAgents</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-300 transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-gray-300 transition">
              Pricing
            </a>
            <a href="#waitlist" className="hover:text-gray-300 transition">
              Waitlist
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-600">
            © {year} DeskAgents. All rights reserved.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800/30 text-center">
          <p className="text-xs text-gray-600">
            DeskAgents — Your AI Employees. Powered by advanced AI agent technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
