"use client";

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  isLoading?: boolean;
}

export default function OnboardingStep({
  step,
  totalSteps,
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = "Continue",
  isLoading = false,
}: OnboardingStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < step
                ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                : i === step
                ? "bg-indigo-500/50"
                : "bg-gray-800"
            }`}
          />
        ))}
      </div>

      {/* Step indicator */}
      <div className="text-xs text-gray-500 mb-2 font-medium">
        Step {step + 1} of {totalSteps}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-gray-400 mb-8">{description}</p>

      {/* Content */}
      <div className="mb-8">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-sm px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white transition font-medium"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext}
          disabled={isLoading}
          className="text-sm px-8 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : nextLabel}
        </button>
      </div>
    </div>
  );
}
