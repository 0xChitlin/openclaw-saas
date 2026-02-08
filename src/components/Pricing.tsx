const plans = [
  {
    name: "Individual",
    price: "$49",
    period: "/mo",
    description: "Perfect for solopreneurs and freelancers",
    features: [
      "1 AI agent",
      "Email management",
      "Calendar automation",
      "Basic customer support",
      "5 workflow automations",
      "Email support",
    ],
    cta: "Join Waitlist",
    popular: false,
  },
  {
    name: "Business",
    price: "$199",
    period: "/mo",
    description: "For growing businesses with more complex needs",
    features: [
      "3 AI agents",
      "Everything in Individual",
      "Kintone integration",
      "WhatsApp & Telegram bots",
      "Unlimited workflow automations",
      "Priority support",
      "Custom training",
    ],
    cta: "Join Waitlist",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$999",
    period: "/mo",
    description: "Full-scale automation for agencies and large teams",
    features: [
      "Unlimited AI agents",
      "Everything in Business",
      "Dedicated instance",
      "SSO & advanced security",
      "API access",
      "White-label option",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Simple Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Less than hiring an <span className="gradient-text">intern</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your AI employee works 24/7, never calls in sick, and costs less than a daily coffee habit.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 card-hover ${
                plan.popular
                  ? "bg-gradient-to-b from-indigo-500/10 to-purple-600/10 border-2 border-indigo-500/40 relative glow"
                  : "bg-gray-900/50 border border-gray-800/60"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>

              <a
                href="#waitlist"
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all mb-8 ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                {plan.cta}
              </a>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
