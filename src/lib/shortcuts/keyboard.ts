/**
 * TASK 96: KEYBOARD SHORTCUTS
 *
 * System-wide keyboard shortcuts with vim/emacs modes and customization.
 */

export type ShortcutMode = "default" | "vim" | "emacs";

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string;
  action: string;
  context?: string;
  mode: ShortcutMode;
  enabled: boolean;
}

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // Global
  {
    id: "search",
    name: "Search",
    description: "Open global search",
    keys: "cmd+k",
    action: "openSearch",
    mode: "default",
    enabled: true,
  },
  {
    id: "command-palette",
    name: "Command Palette",
    description: "Open command palette",
    keys: "cmd+shift+p",
    action: "openCommandPalette",
    mode: "default",
    enabled: true,
  },
  {
    id: "new-claim",
    name: "New Claim",
    description: "Create new claim",
    keys: "cmd+shift+c",
    action: "newClaim",
    mode: "default",
    enabled: true,
  },
  {
    id: "new-job",
    name: "New Job",
    description: "Create new job",
    keys: "cmd+shift+j",
    action: "newJob",
    mode: "default",
    enabled: true,
  },
  {
    id: "new-task",
    name: "New Task",
    description: "Create new task",
    keys: "cmd+shift+t",
    action: "newTask",
    mode: "default",
    enabled: true,
  },

  // Navigation
  {
    id: "go-dashboard",
    name: "Go to Dashboard",
    description: "Navigate to dashboard",
    keys: "g d",
    action: "goDashboard",
    mode: "default",
    enabled: true,
  },
  {
    id: "go-claims",
    name: "Go to Claims",
    description: "Navigate to claims",
    keys: "g c",
    action: "goClaims",
    mode: "default",
    enabled: true,
  },
  {
    id: "go-jobs",
    name: "Go to Jobs",
    description: "Navigate to jobs",
    keys: "g j",
    action: "goJobs",
    mode: "default",
    enabled: true,
  },
  {
    id: "go-tasks",
    name: "Go to Tasks",
    description: "Navigate to tasks",
    keys: "g t",
    action: "goTasks",
    mode: "default",
    enabled: true,
  },
  {
    id: "go-contacts",
    name: "Go to Contacts",
    description: "Navigate to contacts",
    keys: "g o",
    action: "goContacts",
    mode: "default",
    enabled: true,
  },
  {
    id: "go-settings",
    name: "Go to Settings",
    description: "Navigate to settings",
    keys: "g s",
    action: "goSettings",
    mode: "default",
    enabled: true,
  },

  // Editing
  {
    id: "save",
    name: "Save",
    description: "Save current form",
    keys: "cmd+s",
    action: "save",
    mode: "default",
    enabled: true,
  },
  {
    id: "cancel",
    name: "Cancel",
    description: "Cancel and go back",
    keys: "esc",
    action: "cancel",
    mode: "default",
    enabled: true,
  },
  {
    id: "edit",
    name: "Edit",
    description: "Edit current item",
    keys: "e",
    action: "edit",
    mode: "default",
    enabled: true,
  },
  {
    id: "delete",
    name: "Delete",
    description: "Delete current item",
    keys: "shift+delete",
    action: "delete",
    mode: "default",
    enabled: true,
  },

  // Selection
  {
    id: "select-all",
    name: "Select All",
    description: "Select all items",
    keys: "cmd+a",
    action: "selectAll",
    mode: "default",
    enabled: true,
  },
  {
    id: "deselect-all",
    name: "Deselect All",
    description: "Clear selection",
    keys: "cmd+d",
    action: "deselectAll",
    mode: "default",
    enabled: true,
  },

  // View
  {
    id: "toggle-sidebar",
    name: "Toggle Sidebar",
    description: "Show/hide sidebar",
    keys: "cmd+b",
    action: "toggleSidebar",
    mode: "default",
    enabled: true,
  },
  {
    id: "toggle-fullscreen",
    name: "Toggle Fullscreen",
    description: "Enter/exit fullscreen",
    keys: "cmd+shift+f",
    action: "toggleFullscreen",
    mode: "default",
    enabled: true,
  },
  {
    id: "zoom-in",
    name: "Zoom In",
    description: "Increase zoom",
    keys: "cmd++",
    action: "zoomIn",
    mode: "default",
    enabled: true,
  },
  {
    id: "zoom-out",
    name: "Zoom Out",
    description: "Decrease zoom",
    keys: "cmd+-",
    action: "zoomOut",
    mode: "default",
    enabled: true,
  },
  {
    id: "reset-zoom",
    name: "Reset Zoom",
    description: "Reset zoom to 100%",
    keys: "cmd+0",
    action: "resetZoom",
    mode: "default",
    enabled: true,
  },
];

export const VIM_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "vim-down",
    name: "Move Down",
    description: "Move cursor down",
    keys: "j",
    action: "moveDown",
    mode: "vim",
    enabled: true,
  },
  {
    id: "vim-up",
    name: "Move Up",
    description: "Move cursor up",
    keys: "k",
    action: "moveUp",
    mode: "vim",
    enabled: true,
  },
  {
    id: "vim-left",
    name: "Move Left",
    description: "Move cursor left",
    keys: "h",
    action: "moveLeft",
    mode: "vim",
    enabled: true,
  },
  {
    id: "vim-right",
    name: "Move Right",
    description: "Move cursor right",
    keys: "l",
    action: "moveRight",
    mode: "vim",
    enabled: true,
  },
  {
    id: "vim-open",
    name: "Open",
    description: "Open selected item",
    keys: "o",
    action: "open",
    mode: "vim",
    enabled: true,
  },
  {
    id: "vim-quit",
    name: "Quit",
    description: "Close current view",
    keys: "q",
    action: "quit",
    mode: "vim",
    enabled: true,
  },
  {
    id: "vim-write",
    name: "Write",
    description: "Save changes",
    keys: "w",
    action: "write",
    mode: "vim",
    enabled: true,
  },
];

export const EMACS_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "emacs-forward",
    name: "Forward",
    description: "Move forward",
    keys: "ctrl+f",
    action: "forward",
    mode: "emacs",
    enabled: true,
  },
  {
    id: "emacs-backward",
    name: "Backward",
    description: "Move backward",
    keys: "ctrl+b",
    action: "backward",
    mode: "emacs",
    enabled: true,
  },
  {
    id: "emacs-next",
    name: "Next",
    description: "Move to next line",
    keys: "ctrl+n",
    action: "next",
    mode: "emacs",
    enabled: true,
  },
  {
    id: "emacs-previous",
    name: "Previous",
    description: "Move to previous line",
    keys: "ctrl+p",
    action: "previous",
    mode: "emacs",
    enabled: true,
  },
  {
    id: "emacs-kill",
    name: "Kill",
    description: "Delete to end of line",
    keys: "ctrl+k",
    action: "kill",
    mode: "emacs",
    enabled: true,
  },
];

/**
 * Get shortcuts for mode
 */
export function getShortcuts(mode: ShortcutMode = "default"): KeyboardShortcut[] {
  let shortcuts = [...DEFAULT_SHORTCUTS];

  if (mode === "vim") {
    shortcuts = [...shortcuts, ...VIM_SHORTCUTS];
  } else if (mode === "emacs") {
    shortcuts = [...shortcuts, ...EMACS_SHORTCUTS];
  }

  return shortcuts.filter((s) => s.enabled);
}

/**
 * Parse key combination
 */
export function parseKeys(keys: string): {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
} {
  const parts = keys.toLowerCase().split("+");
  const modifiers = {
    ctrl: parts.includes("ctrl"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    meta: parts.includes("cmd") || parts.includes("meta"),
  };

  const key = parts[parts.length - 1];

  return { key, ...modifiers };
}

/**
 * Check if event matches shortcut
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const parsed = parseKeys(shortcut.keys);

  return (
    event.key.toLowerCase() === parsed.key &&
    event.ctrlKey === parsed.ctrl &&
    event.altKey === parsed.alt &&
    event.shiftKey === parsed.shift &&
    event.metaKey === parsed.meta
  );
}

/**
 * Register shortcut handler
 */
export function registerShortcut(shortcut: KeyboardShortcut, handler: () => void): () => void {
  const listener = (event: KeyboardEvent) => {
    if (matchesShortcut(event, shortcut)) {
      event.preventDefault();
      handler();
    }
  };

  document.addEventListener("keydown", listener);

  return () => {
    document.removeEventListener("keydown", listener);
  };
}

/**
 * Register multiple shortcuts
 */
export function registerShortcuts(
  shortcuts: KeyboardShortcut[],
  handlers: Record<string, () => void>
): () => void {
  const unregisterFns = shortcuts.map((shortcut) => {
    const handler = handlers[shortcut.action];
    if (handler) {
      return registerShortcut(shortcut, handler);
    }
    return () => {};
  });

  return () => {
    unregisterFns.forEach((fn) => fn());
  };
}

/**
 * Get shortcut by action
 */
export function getShortcutByAction(
  action: string,
  mode: ShortcutMode = "default"
): KeyboardShortcut | undefined {
  const shortcuts = getShortcuts(mode);
  return shortcuts.find((s) => s.action === action);
}

/**
 * Format shortcut keys for display
 */
export function formatShortcutKeys(keys: string): string {
  return keys
    .replace("cmd", "⌘")
    .replace("ctrl", "⌃")
    .replace("alt", "⌥")
    .replace("shift", "⇧")
    .replace("+", " ");
}

/**
 * Get shortcut categories
 */
export function getShortcutCategories(): {
  name: string;
  shortcuts: KeyboardShortcut[];
}[] {
  const shortcuts = getShortcuts();

  return [
    {
      name: "Global",
      shortcuts: shortcuts.filter((s) => !s.context),
    },
    {
      name: "Navigation",
      shortcuts: shortcuts.filter((s) => s.action.startsWith("go")),
    },
    {
      name: "Editing",
      shortcuts: shortcuts.filter((s) => ["save", "cancel", "edit", "delete"].includes(s.action)),
    },
    {
      name: "Selection",
      shortcuts: shortcuts.filter((s) => s.action.includes("select")),
    },
    {
      name: "View",
      shortcuts: shortcuts.filter((s) => ["toggle", "zoom"].some((w) => s.action.includes(w))),
    },
  ];
}

/**
 * Check if shortcut conflicts with existing
 */
export function hasConflict(keys: string, shortcuts: KeyboardShortcut[]): KeyboardShortcut | null {
  return shortcuts.find((s) => s.keys === keys) || null;
}

/**
 * Validate shortcut keys
 */
export function validateShortcutKeys(keys: string): {
  valid: boolean;
  error?: string;
} {
  const validModifiers = ["cmd", "ctrl", "alt", "shift", "meta"];
  const parts = keys.toLowerCase().split("+");

  // Must have at least 2 parts (modifier + key)
  if (parts.length < 2) {
    return {
      valid: false,
      error: "Shortcut must include at least one modifier key",
    };
  }

  // Check modifiers
  for (let i = 0; i < parts.length - 1; i++) {
    if (!validModifiers.includes(parts[i])) {
      return {
        valid: false,
        error: `Invalid modifier: ${parts[i]}`,
      };
    }
  }

  return { valid: true };
}
