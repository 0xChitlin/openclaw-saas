export default function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="text-lg font-bold tracking-tight text-slate-900">DeskAgents</span>

        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="#features" className="hover:text-slate-900 transition">Features</a>
          <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
          <a href="/login" className="hover:text-slate-900 transition">Login</a>
          <a href="mailto:hello@deskagents.com" className="hover:text-slate-900 transition">Contact</a>
        </div>

        <p className="text-sm text-slate-400">© 2026 DeskAgents</p>
      </div>
    </footer>
  );
}
