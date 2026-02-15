/**
 * Custom Fields System
 *
 * Dynamic custom fields for claims, jobs, contacts
 * Flexible field definitions with validation and UI rendering
 */

import prisma from "@/lib/prisma";

export type FieldType =
  | "TEXT"
  | "NUMBER"
  | "DATE"
  | "BOOLEAN"
  | "SELECT"
  | "MULTI_SELECT"
  | "EMAIL"
  | "PHONE"
  | "URL"
  | "CURRENCY"
  | "PERCENTAGE"
  | "TEXTAREA";

export type EntityType = "CLAIM" | "JOB" | "CONTACT" | "TASK" | "DOCUMENT";

export interface CustomField {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  entityType: EntityType;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For SELECT/MULTI_SELECT
  validation?: FieldValidation;
  metadata?: Record<string, any>;
  order: number;
  orgId: string;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  allowedValues?: string[];
}

export interface CustomFieldValue {
  fieldId: string;
  entityId: string;
  value: any;
}

/**
 * Create custom field
 */
export async function createCustomField(
  orgId: string,
  data: {
    name: string;
    type: FieldType;
    entityType: EntityType;
    required?: boolean;
    defaultValue?: any;
    options?: string[];
    validation?: FieldValidation;
  }
): Promise<CustomField> {
  try {
    // Generate key from name
    const key = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_");

    // Get next order
    const existingFields = await prisma.customFields.count({
      where: { orgId, entityType: data.entityType },
    });

    const field = (await prisma.customFields.create({
      data: {
        name: data.name,
        key,
        type: data.type,
        entityType: data.entityType,
        required: data.required || false,
        defaultValue: data.defaultValue,
        options: data.options,
        validation: data.validation || {},
        order: existingFields,
        orgId,
      },
    })) as any;

    return field;
  } catch (error) {
    console.error("Failed to create custom field:", error);
    throw error;
  }
}

/**
 * Get custom fields for entity type
 */
export async function getCustomFields(
  orgId: string,
  entityType: EntityType
): Promise<CustomField[]> {
  try {
    const fields = await prisma.customFields.findMany({
      where: { orgId, entityType },
      orderBy: { order: "asc" },
    });

    return fields as any[];
  } catch {
    return [];
  }
}

/**
 * Update custom field
 */
export async function updateCustomField(
  fieldId: string,
  data: Partial<CustomField>
): Promise<CustomField> {
  try {
    const field = (await prisma.customFields.update({
      where: { id: fieldId },
      data,
    })) as any;

    return field;
  } catch (error) {
    console.error("Failed to update custom field:", error);
    throw error;
  }
}

/**
 * Delete custom field
 */
export async function deleteCustomField(fieldId: string): Promise<boolean> {
  try {
    // Delete field values
    await prisma.customFieldValues.deleteMany({
      where: { fieldId },
    });

    // Delete field
    await prisma.customFields.delete({
      where: { id: fieldId },
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Set field value
 */
export async function setFieldValue(
  fieldId: string,
  entityId: string,
  value: any
): Promise<CustomFieldValue> {
  try {
    // Validate field exists
    const field = await prisma.customFields.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      throw new Error("Custom field not found");
    }

    // Validate value
    const validationResult = validateFieldValue(field as any, value);
    if (!validationResult.valid) {
      throw new Error(validationResult.error);
    }

    // Upsert value
    const fieldValue = (await prisma.customFieldValues.upsert({
      where: {
        fieldId_entityId: {
          fieldId,
          entityId,
        },
      },
      create: {
        fieldId,
        entityId,
        value,
      },
      update: {
        value,
      },
    })) as any;

    return fieldValue;
  } catch (error) {
    console.error("Failed to set field value:", error);
    throw error;
  }
}

/**
 * Get field values for entity
 */
export async function getFieldValues(
  entityId: string,
  entityType: EntityType,
  orgId: string
): Promise<Record<string, any>> {
  try {
    // Get fields
    const fields = await getCustomFields(orgId, entityType);

    // Get values
    const values = await prisma.customFieldValues.findMany({
      where: {
        entityId,
        fieldId: { in: fields.map((f) => f.id) },
      },
    });

    // Build result
    const result: Record<string, any> = {};

    for (const field of fields) {
      const value = values.find((v) => v.fieldId === field.id);
      result[field.key] = value?.value ?? field.defaultValue ?? null;
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Bulk set field values
 */
export async function bulkSetFieldValues(
  entityId: string,
  values: Record<string, any>,
  entityType: EntityType,
  orgId: string
): Promise<void> {
  try {
    const fields = await getCustomFields(orgId, entityType);

    for (const field of fields) {
      if (field.key in values) {
        await setFieldValue(field.id, entityId, values[field.key]);
      }
    }
  } catch (error) {
    console.error("Failed to bulk set field values:", error);
    throw error;
  }
}

/**
 * Validate field value
 */
export function validateFieldValue(
  field: CustomField,
  value: any
): { valid: boolean; error?: string } {
  // Required check
  if (field.required && (value === null || value === undefined || value === "")) {
    return { valid: false, error: `${field.name} is required` };
  }

  // Skip validation if empty and not required
  if (!field.required && (value === null || value === undefined || value === "")) {
    return { valid: true };
  }

  const validation = field.validation || {};

  // Type-specific validation
  switch (field.type) {
    case "TEXT":
    case "TEXTAREA":
      if (typeof value !== "string") {
        return { valid: false, error: `${field.name} must be text` };
      }
      if (validation.minLength && value.length < validation.minLength) {
        return {
          valid: false,
          error: `${field.name} must be at least ${validation.minLength} characters`,
        };
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return {
          valid: false,
          error: `${field.name} must be at most ${validation.maxLength} characters`,
        };
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return { valid: false, error: `${field.name} format is invalid` };
      }
      break;

    case "NUMBER":
    case "CURRENCY":
    case "PERCENTAGE":
      if (typeof value !== "number") {
        return { valid: false, error: `${field.name} must be a number` };
      }
      if (validation.min !== undefined && value < validation.min) {
        return { valid: false, error: `${field.name} must be at least ${validation.min}` };
      }
      if (validation.max !== undefined && value > validation.max) {
        return { valid: false, error: `${field.name} must be at most ${validation.max}` };
      }
      break;

    case "EMAIL":
      if (typeof value !== "string") {
        return { valid: false, error: `${field.name} must be text` };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: `${field.name} must be a valid email` };
      }
      break;

    case "PHONE":
      if (typeof value !== "string") {
        return { valid: false, error: `${field.name} must be text` };
      }
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(value)) {
        return { valid: false, error: `${field.name} must be a valid phone number` };
      }
      break;

    case "URL":
      if (typeof value !== "string") {
        return { valid: false, error: `${field.name} must be text` };
      }
      try {
        new URL(value);
      } catch {
        return { valid: false, error: `${field.name} must be a valid URL` };
      }
      break;

    case "DATE":
      if (!(value instanceof Date) && isNaN(Date.parse(value))) {
        return { valid: false, error: `${field.name} must be a valid date` };
      }
      break;

    case "BOOLEAN":
      if (typeof value !== "boolean") {
        return { valid: false, error: `${field.name} must be true or false` };
      }
      break;

    case "SELECT":
      if (!field.options || !field.options.includes(value)) {
        return {
          valid: false,
          error: `${field.name} must be one of: ${field.options?.join(", ")}`,
        };
      }
      break;

    case "MULTI_SELECT":
      if (!Array.isArray(value)) {
        return { valid: false, error: `${field.name} must be an array` };
      }
      if (field.options && value.some((v) => !field.options!.includes(v))) {
        return { valid: false, error: `${field.name} contains invalid options` };
      }
      break;
  }

  return { valid: true };
}

/**
 * Reorder custom fields
 */
export async function reorderCustomFields(
  orgId: string,
  entityType: EntityType,
  fieldIds: string[]
): Promise<void> {
  try {
    for (let i = 0; i < fieldIds.length; i++) {
      await prisma.customFields.update({
        where: { id: fieldIds[i] },
        data: { order: i },
      });
    }
  } catch (error) {
    console.error("Failed to reorder custom fields:", error);
    throw error;
  }
}

/**
 * Search entities by custom field value
 */
export async function searchByCustomField(
  orgId: string,
  entityType: EntityType,
  fieldKey: string,
  searchValue: any
): Promise<string[]> {
  try {
    // Get field
    const field = await prisma.customFields.findFirst({
      where: { orgId, entityType, key: fieldKey },
    });

    if (!field) {
      return [];
    }

    // Search values
    const values = await prisma.customFieldValues.findMany({
      where: {
        fieldId: field.id,
        // Note: Actual search implementation depends on database
        // This is a simplified version
      },
    });

    return values.map((v) => v.entityId);
  } catch {
    return [];
  }
}

/**
 * Get field usage statistics
 */
export async function getFieldUsageStats(fieldId: string): Promise<{
  totalValues: number;
  filledValues: number;
  emptyValues: number;
  uniqueValues: number;
  topValues: Array<{ value: any; count: number }>;
}> {
  try {
    const values = await prisma.customFieldValues.findMany({
      where: { fieldId },
    });

    const filledValues = values.filter(
      (v) => v.value !== null && v.value !== undefined && v.value !== ""
    );

    // Count unique values
    const uniqueValues = new Set(filledValues.map((v) => JSON.stringify(v.value))).size;

    // Top values
    const valueCounts: Record<string, number> = {};
    for (const value of filledValues) {
      const key = JSON.stringify(value.value);
      valueCounts[key] = (valueCounts[key] || 0) + 1;
    }

    const topValues = Object.entries(valueCounts)
      .map(([value, count]) => ({ value: JSON.parse(value), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalValues: values.length,
      filledValues: filledValues.length,
      emptyValues: values.length - filledValues.length,
      uniqueValues,
      topValues,
    };
  } catch (error) {
    console.error("Failed to get field usage stats:", error);
    throw error;
  }
}
