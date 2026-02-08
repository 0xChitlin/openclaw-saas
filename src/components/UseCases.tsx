const useCases = [
  {
    emoji: "🏪",
    title: "Small Business Owners",
    description:
      "Stop drowning in admin work. Your AI employee handles invoicing follow-ups, appointment scheduling, and customer inquiries while you run your business.",
    stats: "Save 20+ hours/week",
  },
  {
    emoji: "🚀",
    title: "Solopreneurs",
    description:
      "Scale without hiring. From managing your inbox to updating your CRM, get the productivity of a full team at a fraction of the cost.",
    stats: "10x your output",
  },
  {
    emoji: "🏢",
    title: "Agencies & Teams",
    description:
      "Deploy AI agents for each client. Automate Kintone workflows, generate reports, and keep every project on track — automatically.",
    stats: "Manage 3x more clients",
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Built For You
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Who is this <span className="gradient-text">for?</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            If you spend hours on repetitive tasks, you need an AI employee.
          </p>
        </div>

        {/* Use case cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="card-hover gradient-border rounded-2xl bg-gray-900/80 p-8 backdrop-blur-sm"
            >
              <div className="text-4xl mb-4">{useCase.emoji}</div>
              <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {useCase.description}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                ⚡ {useCase.stats}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
