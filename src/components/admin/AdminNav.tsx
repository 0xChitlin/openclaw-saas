"use client";

interface AdminNavProps {
  onLogout: () => void;
}

export default function AdminNav({ onLogout }: AdminNavProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">🔧 DeskAgents Admin</h1>
        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
          Live
        </span>
      </div>
      <button
        onClick={onLogout}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Logout
      </button>
    </header>
  );
}
