const steps = [
  {
    number: "01",
    title: "Sign Up",
    description:
      "Create your account and tell us about your business. No technical knowledge required — just answer a few simple questions.",
  },
  {
    number: "02",
    title: "Connect Your Tools",
    description:
      "Link your email, calendar, Kintone, and messaging apps. We handle all the setup with guided walkthroughs.",
  },
  {
    number: "03",
    title: "Train Your Agent",
    description:
      "Tell your AI what to do in plain English. \"Reply to support emails within 5 minutes\" or \"Update Kintone when a deal closes.\"",
  },
  {
    number: "04",
    title: "Let It Work",
    description:
      "Your agent runs 24/7, handling tasks automatically. Review its activity in a simple dashboard and refine as needed.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Simple Setup
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Up and running in <span className="gradient-text">5 minutes</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            No developers needed. No complex configuration. Just plain English.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="flex items-start gap-6 group"
            >
              {/* Step number */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-indigo-400 font-bold text-lg">{step.number}</span>
              </div>

              {/* Content */}
              <div className="flex-1 pb-8 border-b border-gray-800/50 last:border-0">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-300 transition">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
