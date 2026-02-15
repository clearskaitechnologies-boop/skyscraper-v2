/**
 * TASK 93: SMART FILTERS
 *
 * Intelligent filter suggestions, quick filters, and filter combinations.
 */

import prisma from "@/lib/prisma";

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "in"
  | "not_in"
  | "between"
  | "is_null"
  | "is_not_null";

export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface FilterGroup {
  id: string;
  name: string;
  rules: FilterRule[];
  logic: "AND" | "OR";
}

export interface SmartFilter {
  id: string;
  name: string;
  description?: string;
  entity: string;
  groups: FilterGroup[];
  isQuick?: boolean;
  isDefault?: boolean;
  usage: number;
}

/**
 * Get quick filters for entity
 */
export async function getQuickFilters(
  entity: string,
  organizationId: string
): Promise<SmartFilter[]> {
  const quickFilters: SmartFilter[] = [];

  switch (entity) {
    case "CLAIM":
      quickFilters.push(
        {
          id: "open-claims",
          name: "Open Claims",
          entity: "CLAIM",
          groups: [
            {
              id: "1",
              name: "Status Filter",
              rules: [
                {
                  field: "status",
                  operator: "in",
                  value: ["OPEN", "IN_PROGRESS"],
                  label: "Status is Open or In Progress",
                },
              ],
              logic: "AND",
            },
          ],
          isQuick: true,
          usage: 0,
        },
        {
          id: "recent-claims",
          name: "Recent Claims",
          entity: "CLAIM",
          groups: [
            {
              id: "1",
              name: "Date Filter",
              rules: [
                {
                  field: "createdAt",
                  operator: "greater_than",
                  value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  label: "Created in last 30 days",
                },
              ],
              logic: "AND",
            },
          ],
          isQuick: true,
          usage: 0,
        },
        {
          id: "high-value-claims",
          name: "High Value Claims",
          entity: "CLAIM",
          groups: [
            {
              id: "1",
              name: "Value Filter",
              rules: [
                {
                  field: "estimatedValue",
                  operator: "greater_than",
                  value: 50000,
                  label: "Estimated Value > $50,000",
                },
              ],
              logic: "AND",
            },
          ],
          isQuick: true,
          usage: 0,
        }
      );
      break;

    case "TASK":
      quickFilters.push(
        {
          id: "my-tasks",
          name: "My Tasks",
          entity: "TASK",
          groups: [
            {
              id: "1",
              name: "Assignment Filter",
              rules: [
                {
                  field: "assignedToId",
                  operator: "equals",
                  value: "{{currentUserId}}",
                  label: "Assigned to me",
                },
              ],
              logic: "AND",
            },
          ],
          isQuick: true,
          usage: 0,
        },
        {
          id: "overdue-tasks",
          name: "Overdue Tasks",
          entity: "TASK",
          groups: [
            {
              id: "1",
              name: "Due Date Filter",
              rules: [
                {
                  field: "dueDate",
                  operator: "less_than",
                  value: new Date(),
                  label: "Due date passed",
                },
                {
                  field: "status",
                  operator: "not_equals",
                  value: "COMPLETED",
                  label: "Not completed",
                },
              ],
              logic: "AND",
            },
          ],
          isQuick: true,
          usage: 0,
        }
      );
      break;
  }

  return quickFilters;
}

/**
 * Apply filters to query
 */
export function applyFilters(baseQuery: any, filters: SmartFilter): any {
  const whereClause: any = {};

  filters.groups.forEach((group) => {
    const groupConditions = group.rules.map((rule) => buildFilterCondition(rule));

    if (group.logic === "AND") {
      Object.assign(whereClause, ...groupConditions);
    } else {
      if (!whereClause.OR) whereClause.OR = [];
      whereClause.OR.push(...groupConditions);
    }
  });

  return { ...baseQuery, ...whereClause };
}

/**
 * Build filter condition for Prisma
 */
function buildFilterCondition(rule: FilterRule): any {
  const { field, operator, value } = rule;

  switch (operator) {
    case "equals":
      return { [field]: value };
    case "not_equals":
      return { [field]: { not: value } };
    case "contains":
      return { [field]: { contains: value, mode: "insensitive" } };
    case "not_contains":
      return { [field]: { not: { contains: value, mode: "insensitive" } } };
    case "starts_with":
      return { [field]: { startsWith: value, mode: "insensitive" } };
    case "ends_with":
      return { [field]: { endsWith: value, mode: "insensitive" } };
    case "greater_than":
      return { [field]: { gt: value } };
    case "less_than":
      return { [field]: { lt: value } };
    case "greater_than_or_equal":
      return { [field]: { gte: value } };
    case "less_than_or_equal":
      return { [field]: { lte: value } };
    case "in":
      return { [field]: { in: value } };
    case "not_in":
      return { [field]: { notIn: value } };
    case "between":
      return { [field]: { gte: value[0], lte: value[1] } };
    case "is_null":
      return { [field]: null };
    case "is_not_null":
      return { [field]: { not: null } };
    default:
      return {};
  }
}

/**
 * Get filter suggestions based on context
 */
export async function getFilterSuggestions(
  entity: string,
  organizationId: string,
  currentFilters?: FilterRule[]
): Promise<FilterRule[]> {
  const suggestions: FilterRule[] = [];

  // Get popular filter combinations
  const popularFilters = await getPopularFilters(entity, organizationId);

  popularFilters.forEach((filter) => {
    // Don't suggest filters already applied
    const alreadyApplied = currentFilters?.some(
      (cf) => cf.field === filter.field && cf.operator === filter.operator
    );

    if (!alreadyApplied) {
      suggestions.push(filter);
    }
  });

  return suggestions;
}

/**
 * Get popular filters (used by other users)
 */
async function getPopularFilters(entity: string, organizationId: string): Promise<FilterRule[]> {
  // TODO: Track filter usage in analytics
  return [];
}

/**
 * Save custom filter
 */
export async function saveCustomFilter(
  organizationId: string,
  userId: string,
  filter: Omit<SmartFilter, "id" | "usage">
): Promise<string> {
  const saved = await prisma.customFilter.create({
    data: {
      organizationId,
      userId,
      name: filter.name,
      description: filter.description,
      entity: filter.entity,
      config: filter as any,
      isQuick: filter.isQuick || false,
      isDefault: filter.isDefault || false,
    },
  });

  return saved.id;
}

/**
 * Get custom filters
 */
export async function getCustomFilters(
  organizationId: string,
  entity?: string,
  userId?: string
): Promise<SmartFilter[]> {
  const whereClause: any = { organizationId };
  if (entity) whereClause.entity = entity;
  if (userId) whereClause.userId = userId;

  const filters = await prisma.customFilter.findMany({
    where: whereClause,
    orderBy: { usage: "desc" },
  });

  return filters.map((f) => ({
    ...(f.config as any),
    id: f.id,
    usage: f.usage,
  }));
}

/**
 * Track filter usage
 */
export async function trackFilterUsage(filterId: string): Promise<void> {
  await prisma.customFilter.update({
    where: { id: filterId },
    data: { usage: { increment: 1 } },
  });
}

/**
 * Get filter field options
 */
export async function getFilterFieldOptions(
  entity: string,
  field: string,
  organizationId: string
): Promise<{ value: any; label: string; count: number }[]> {
  // Get unique values for field
  const options: { value: any; label: string; count: number }[] = [];

  switch (entity) {
    case "CLAIM":
      if (field === "status") {
        const statuses = await prisma.claims.groupBy({
          by: ["status"],
          where: { organizationId },
          _count: true,
        });

        return statuses.map((s) => ({
          value: s.status,
          label: s.status,
          count: s._count,
        }));
      }
      if (field === "claimType") {
        const types = await prisma.claims.groupBy({
          by: ["claimType"],
          where: { organizationId },
          _count: true,
        });

        return types.map((t) => ({
          value: t.claimType,
          label: t.claimType || "Unknown",
          count: t._count,
        }));
      }
      break;
  }

  return options;
}

/**
 * Validate filter
 */
export function validateFilter(filter: SmartFilter): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!filter.name) {
    errors.push("Filter name is required");
  }

  if (!filter.entity) {
    errors.push("Entity is required");
  }

  if (!filter.groups || filter.groups.length === 0) {
    errors.push("At least one filter group is required");
  }

  filter.groups.forEach((group, i) => {
    if (!group.rules || group.rules.length === 0) {
      errors.push(`Group ${i + 1} must have at least one rule`);
    }

    group.rules.forEach((rule, j) => {
      if (!rule.field) {
        errors.push(`Group ${i + 1}, Rule ${j + 1}: Field is required`);
      }
      if (!rule.operator) {
        errors.push(`Group ${i + 1}, Rule ${j + 1}: Operator is required`);
      }
      if (rule.value === undefined && !["is_null", "is_not_null"].includes(rule.operator)) {
        errors.push(`Group ${i + 1}, Rule ${j + 1}: Value is required`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export filter as JSON
 */
export function exportFilter(filter: SmartFilter): string {
  return JSON.stringify(filter, null, 2);
}

/**
 * Import filter from JSON
 */
export function importFilter(json: string): SmartFilter {
  const filter = JSON.parse(json);
  const validation = validateFilter(filter);

  if (!validation.valid) {
    throw new Error(`Invalid filter: ${validation.errors.join(", ")}`);
  }

  return filter;
}
