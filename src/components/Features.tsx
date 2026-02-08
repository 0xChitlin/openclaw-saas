const features = [
  {
    icon: "📧",
    title: "Email Management",
    description:
      "Your AI reads, categorizes, drafts replies, and flags urgent messages. Never miss an important email again.",
  },
  {
    icon: "📅",
    title: "Calendar & Scheduling",
    description:
      "Automatic meeting scheduling, conflict resolution, and smart reminders. Your calendar runs itself.",
  },
  {
    icon: "💬",
    title: "Customer Support",
    description:
      "24/7 AI-powered responses across WhatsApp, Telegram, and email. Your customers get instant answers.",
  },
  {
    icon: "📊",
    title: "Data Entry & CRM",
    description:
      "Automate Kintone, spreadsheets, and database updates. No more manual data entry — ever.",
  },
  {
    icon: "🔄",
    title: "Workflow Automation",
    description:
      "Connect your tools and create automated workflows. If-this-then-that, but powered by AI that actually understands context.",
  },
  {
    icon: "🛡️",
    title: "Enterprise Security",
    description:
      "Your data stays yours. Isolated instances, encrypted storage, and SOC 2-ready architecture.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Everything Automated
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            One AI agent. <span className="gradient-text">Endless capabilities.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your OpenClaw agent learns your business and handles the repetitive work,
            so your team can focus on growth.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-hover rounded-2xl border border-gray-800/60 bg-gray-900/50 p-6 backdrop-blur-sm"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
