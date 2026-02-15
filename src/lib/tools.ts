// Central tool catalog for SkaiScraper platform
// Defines all AI tools, their costs, and quota enforcement

export type ToolKey = "weather_claim" | "mockup" | "dol_pull";

export interface ToolDefinition {
  key: ToolKey;
  name: string;
  description: string;
  tokenCost: number;
  category: "ai" | "data" | "compliance";
  icon?: string;
}

export const TOOL_CATALOG: Record<ToolKey, ToolDefinition> = {
  weather_claim: {
    key: "weather_claim",
    name: "Weather Claim Report",
    description: "Generate comprehensive weather claim reports with AI analysis",
    tokenCost: 25,
    category: "ai",
    icon: "🌦️",
  },
  mockup: {
    key: "mockup",
    name: "Property Mockup",
    description: "Create property damage mockups with AI-generated briefs",
    tokenCost: 15,
    category: "ai",
    icon: "🏠",
  },
  dol_pull: {
    key: "dol_pull",
    name: "DOL Data Pull",
    description: "Pull Department of Labor compliance data",
    tokenCost: 5,
    category: "data",
    icon: "📊",
  },
};

export const getToolDefinition = (key: ToolKey): ToolDefinition => {
  return TOOL_CATALOG[key];
};

export const getAllTools = (): ToolDefinition[] => {
  return Object.values(TOOL_CATALOG);
};

export const getToolsByCategory = (category: string): ToolDefinition[] => {
  return getAllTools().filter((tool) => tool.category === category);
};

export const calculateTokenCost = (toolKey: ToolKey, quantity: number = 1): number => {
  const tool = getToolDefinition(toolKey);
  return tool.tokenCost * quantity;
};
