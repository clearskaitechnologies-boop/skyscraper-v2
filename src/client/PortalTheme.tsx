import { createContext, useContext } from "react";

export type PortalTheme = {
  brandName?: string;
  logoUrl?: string;
  accent?: string;
  contactLine?: string;
};

const defaultTheme: PortalTheme = {
  brandName: "ClearSKai Roofing",
  accent: "from-sky-500 to-blue-600",
  contactLine: "(480) 000-0000 • clearskairoofing.com",
};

const PortalThemeContext = createContext<PortalTheme>(defaultTheme);

export const PortalThemeProvider = PortalThemeContext.Provider;

export const usePortalTheme = () => useContext(PortalThemeContext);
