// Unified UI Theme Tokens (Light + Dark)
// All color usage must flow through these semantic maps.
// No component may hard-code raw color classes outside these tokens.
export const uiTheme = {
  light: {
    bg: {
      page: "bg-[#f2f4f7]",
      card: "bg-white",
      sidebar: "bg-white",
    },
    selection: {
      bg: "bg-slate-100",
      active: "bg-slate-200",
      outline: "ring-2 ring-slate-300",
    },
    text: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
    },
    border: {
      default: "border-slate-200",
      sidebar: "border-slate-200",
    },
    header: {
      wrapper: "border-b border-slate-200",
      title: "text-slate-900",
      subtitle: "text-slate-600",
    },
    sidebar: {
      sectionLabel:
        "text-[13px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-3 pt-4 pb-1",
      item: {
        base: "flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all",
        idle: "text-slate-600 hover:bg-blue-50 hover:text-slate-900",
        active: "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 font-semibold",
        icon: "w-4 h-4",
      },
    },
  },
  dark: {
    bg: {
      page: "bg-background",
      card: "bg-card",
      sidebar: "bg-background",
    },
    selection: {
      bg: "bg-card",
      active: "bg-secondary",
      outline: "ring-2 ring-slate-600",
    },
    text: {
      primary: "text-slate-50",
      secondary: "text-slate-400",
    },
    border: {
      default: "border-slate-700/50",
      sidebar: "border-slate-700/50",
    },
    header: {
      wrapper: "border-b border-slate-700",
      title: "text-slate-50",
      subtitle: "text-slate-400",
    },
    sidebar: {
      sectionLabel:
        "text-[13px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent px-3 pt-4 pb-1",
      item: {
        base: "flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all",
        idle: "text-slate-300 hover:bg-slate-700/50 hover:text-slate-50",
        active: "bg-slate-700/60 text-blue-300 border-l-[3px] border-blue-400 font-semibold",
        icon: "w-4 h-4",
      },
    },
  },
};

export type UiThemeMode = "light" | "dark";
export function getUiTheme(mode: UiThemeMode) {
  return mode === "dark" ? uiTheme.dark : uiTheme.light;
}
