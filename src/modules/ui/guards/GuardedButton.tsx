"use client";

// ============================================================================
// GUARDED BUTTON - Phase 5.1 Polish Pack
// ============================================================================
// Button with role-based disabling + tooltip

import { ButtonHTMLAttributes,ReactNode } from 'react';

interface GuardedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  canEdit: boolean;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function GuardedButton({
  canEdit,
  children,
  variant = 'primary',
  className = '',
  onClick,
  ...props
}: GuardedButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white focus-visible:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 focus-visible:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white focus-visible:ring-red-500',
  };

  const disabledClasses = 'opacity-60 cursor-not-allowed pointer-events-none';

  if (!canEdit) {
    return (
      <div className="group relative inline-block">
        <button
          className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
          disabled
          {...props}
        >
          {children}
        </button>
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700">
          Adjuster access is read-only
          <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900 dark:border-t-slate-700"></div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
