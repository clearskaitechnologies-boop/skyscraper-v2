"use client";

interface DominusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "summary", label: "Summary" },
  { id: "urgency", label: "Urgency" },
  { id: "jobtype", label: "Job Type" },
  { id: "actions", label: "Next Actions" },
  { id: "materials", label: "Materials" },
  { id: "flags", label: "Flags" },
  { id: "vision", label: "Vision" },
  { id: "prep", label: "Prep" },
  { id: "compliance", label: "Carrier Compliance" },
  { id: "supplement", label: "Supplement" },
  { id: "batf", label: "Before-After" },
  { id: "storm", label: "Storm Impact" },
  { id: "denial", label: "Denial Response" },
];

export function DominusTabs({ activeTab, onTabChange }: DominusTabsProps) {
  return (
    <div className="overflow-x-auto border-b border-gray-200">
      <nav className="flex min-w-max gap-2" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
