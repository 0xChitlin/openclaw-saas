"use client";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: "default" | "green" | "red" | "yellow" | "blue";
}

const colorMap = {
  default: "text-white",
  green: "text-green-400",
  red: "text-red-400",
  yellow: "text-yellow-400",
  blue: "text-blue-400",
};

export default function StatsCard({
  label,
  value,
  icon,
  color = "default",
}: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-2xl font-bold font-mono ${colorMap[color]}`}>
        {value}
      </div>
    </div>
  );
}
