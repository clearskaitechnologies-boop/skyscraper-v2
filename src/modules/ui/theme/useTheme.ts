// ============================================================================
// USE THEME HOOK - Using next-themes + fieldMode
// ============================================================================

import { useTheme as useNextTheme } from 'next-themes';

import { useFieldMode } from './FieldModeProvider';

export function useTheme() {
  const nextTheme = useNextTheme();
  const { fieldMode, setFieldMode } = useFieldMode();
  
  return {
    ...nextTheme,
    fieldMode,
    setFieldMode,
    isDark: nextTheme.resolvedTheme === 'dark',
  };
}
