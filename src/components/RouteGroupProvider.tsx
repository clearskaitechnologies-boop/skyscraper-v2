"use client";

import { createContext, useContext } from "react";

type RouteGroup = "marketing" | "app";

const RouteGroupContext = createContext<RouteGroup>("marketing");

interface RouteGroupProviderProps {
  group: RouteGroup;
  children: React.ReactNode;
}

export function RouteGroupProvider({ group, children }: RouteGroupProviderProps) {
  return <RouteGroupContext.Provider value={group}>{children}</RouteGroupContext.Provider>;
}

export function useRouteGroup() {
  return useContext(RouteGroupContext);
}
