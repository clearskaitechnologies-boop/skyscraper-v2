import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="h-12 w-12 text-neutral-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-12 text-center"
    >
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-neutral-50">
        {icon || defaultIcon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="mx-auto mb-6 max-w-sm text-neutral-600">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center rounded-2xl bg-[#147BFF] px-6 py-3 font-medium text-white transition-colors hover:bg-[#0366D6]"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// Pre-configured empty states
export function NoEvidenceState({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      title="No evidence yet"
      description="Upload photos to get started with AI damage detection and analysis."
      action={{ label: "Upload Photos", onClick: onUpload }}
      icon={
        <svg
          className="h-12 w-12 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      }
    />
  );
}

export function NoProjectsState({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      title="No projects yet"
      description="Create your first project to start organizing claims and evidence."
      action={{ label: "Create Project", onClick: onCreate }}
      icon={
        <svg
          className="h-12 w-12 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      }
    />
  );
}
