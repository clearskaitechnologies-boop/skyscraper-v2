// ITEM 25: Mobile responsiveness utilities

export const mobileBreakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export const isMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

export const isTablet = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
};

// Tailwind mobile-first classes helper
export const mobileClasses = {
  container: "px-4 md:px-6 lg:px-8",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  text: {
    h1: "text-2xl md:text-3xl lg:text-4xl font-bold",
    h2: "text-xl md:text-2xl lg:text-3xl font-bold",
    h3: "text-lg md:text-xl lg:text-2xl font-semibold",
    body: "text-sm md:text-base",
    small: "text-xs md:text-sm",
  },
  spacing: {
    section: "py-4 md:py-6 lg:py-8",
    card: "p-4 md:p-6",
  },
  layout: {
    sidebar: "hidden lg:block",
    mobileMenu: "block lg:hidden",
    stack: "flex flex-col space-y-4",
    row: "flex flex-col md:flex-row gap-4",
  },
};

// Generate responsive class string
export const responsive = (mobile: string, tablet?: string, desktop?: string) => {
  let classes = mobile;
  if (tablet) classes += ` md:${tablet}`;
  if (desktop) classes += ` lg:${desktop}`;
  return classes;
};
