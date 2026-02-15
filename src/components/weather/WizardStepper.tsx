// components/weather/WizardStepper.tsx
export default function WizardStepper({ step }: { step: number }) {
  const steps = ["Claim", "Loss", "Options", "Generate"];

  return (
    <div className="mb-6 flex items-center justify-between">
      {steps.map((label, i) => {
        const s = i + 1;
        const active = s === step;

        return (
          <div
            key={label}
            className={`flex-1 rounded border py-3 text-center 
              ${active ? "bg-blue-600 text-white" : "bg-gray-100"}
            `}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
