/**
 * TASK 90: EMAIL TEMPLATES
 *
 * Email template management with variables, previews, and MJML support.
 */

import prisma from "@/lib/prisma";

export type EmailTemplateType =
  | "WELCOME"
  | "PASSWORD_RESET"
  | "VERIFICATION"
  | "NOTIFICATION"
  | "INVOICE"
  | "RECEIPT"
  | "REMINDER"
  | "MARKETING"
  | "SYSTEM"
  | "CUSTOM";

export interface EmailTemplateData {
  name: string;
  type: EmailTemplateType;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables: string[];
  previewData?: Record<string, any>;
  active?: boolean;
  organizationId?: string;
}

/**
 * Create email template
 */
export async function createEmailTemplate(data: EmailTemplateData): Promise<string> {
  const template = await prisma.emailTemplate.create({
    data: {
      name: data.name,
      type: data.type,
      subject: data.subject,
      bodyHtml: data.bodyHtml,
      bodyText: data.bodyText,
      variables: data.variables,
      previewData: data.previewData || {},
      active: data.active !== false,
      organizationId: data.orgId,
    },
  });

  return template.id;
}

/**
 * Update email template
 */
export async function updateEmailTemplate(
  templateId: string,
  updates: Partial<EmailTemplateData>
): Promise<void> {
  await prisma.emailTemplate.update({
    where: { id: templateId },
    data: updates,
  });
}

/**
 * Get email template
 */
export async function getEmailTemplate(templateId: string): Promise<any> {
  const template = await prisma.emailTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error("Email template not found");
  }

  return template;
}

/**
 * List email templates
 */
export async function listEmailTemplates(
  organizationId?: string,
  type?: EmailTemplateType
): Promise<any[]> {
  const where: any = {};
  if (organizationId) where.orgId = organizationId;
  if (type) where.type = type;

  return await prisma.emailTemplate.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Render email template with data
 */
export async function renderEmailTemplate(
  templateId: string,
  data: Record<string, any>
): Promise<{ subject: string; html: string; text: string }> {
  const template = await getEmailTemplate(templateId);

  let subject = template.subject;
  let html = template.bodyHtml;
  let text = template.bodyText || "";

  // Replace variables
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    subject = subject.replace(regex, String(value));
    html = html.replace(regex, String(value));
    text = text.replace(regex, String(value));
  });

  return { subject, html, text };
}

/**
 * Preview email template
 */
export async function previewEmailTemplate(templateId: string): Promise<{
  subject: string;
  html: string;
  text: string;
}> {
  const template = await getEmailTemplate(templateId);
  return await renderEmailTemplate(templateId, template.previewData || {});
}

/**
 * Delete email template
 */
export async function deleteEmailTemplate(templateId: string): Promise<void> {
  await prisma.emailTemplate.delete({
    where: { id: templateId },
  });
}

/**
 * Duplicate email template
 */
export async function duplicateEmailTemplate(
  templateId: string,
  newName?: string
): Promise<string> {
  const original = await getEmailTemplate(templateId);

  const duplicate = await prisma.emailTemplate.create({
    data: {
      name: newName || `${original.name} (Copy)`,
      type: original.type,
      subject: original.subject,
      bodyHtml: original.bodyHtml,
      bodyText: original.bodyText,
      variables: original.variables,
      previewData: original.previewData,
      active: false,
      organizationId: original.orgId,
    },
  });

  return duplicate.id;
}

/**
 * Get template usage statistics
 */
export async function getTemplateStats(templateId: string): Promise<{
  totalSent: number;
  lastSent?: Date;
  averageOpenRate: number;
  averageClickRate: number;
}> {
  const emails = await prisma.emailLog.findMany({
    where: { templateId },
  });

  return {
    totalSent: emails.length,
    lastSent: emails.length > 0 ? emails[0].sentAt || undefined : undefined,
    averageOpenRate: 0, // TODO: Track opens
    averageClickRate: 0, // TODO: Track clicks
  };
}

// Built-in Templates

export const BUILT_IN_TEMPLATES = {
  WELCOME: {
    subject: "Welcome to {{companyName}}!",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome {{userName}}!</h1>
        <p>Thank you for joining {{companyName}}. We're excited to have you on board.</p>
        <p>Get started by logging in to your account:</p>
        <a href="{{loginUrl}}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Login Now
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          If you have any questions, please don't hesitate to contact us.
        </p>
      </div>
    `,
    variables: ["userName", "companyName", "loginUrl"],
  },

  PASSWORD_RESET: {
    subject: "Reset Your Password",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi {{userName}},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="{{resetUrl}}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666;">
          This link will expire in {{expiresIn}} hours.
        </p>
        <p style="color: #666; font-size: 12px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    variables: ["userName", "resetUrl", "expiresIn"],
  },

  INVOICE: {
    subject: "Invoice #{{invoiceNumber}} from {{companyName}}",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Invoice #{{invoiceNumber}}</h1>
        <p>Hi {{customerName}},</p>
        <p>Thank you for your business. Please find your invoice attached.</p>
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0;"><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
          <p style="margin: 0;"><strong>Date:</strong> {{invoiceDate}}</p>
          <p style="margin: 0;"><strong>Amount Due:</strong> ${{ amount }}</p>
          <p style="margin: 0;"><strong>Due Date:</strong> {{dueDate}}</p>
        </div>
        <a href="{{paymentUrl}}" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
          Pay Now
        </a>
      </div>
    `,
    variables: [
      "invoiceNumber",
      "companyName",
      "customerName",
      "invoiceDate",
      "amount",
      "dueDate",
      "paymentUrl",
    ],
  },

  REMINDER: {
    subject: "Reminder: {{taskName}}",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reminder</h1>
        <p>Hi {{userName}},</p>
        <p>This is a friendly reminder about:</p>
        <div style="background: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; font-size: 18px;"><strong>{{taskName}}</strong></p>
          <p style="margin: 10px 0 0 0;">Due: {{dueDate}}</p>
        </div>
        <a href="{{taskUrl}}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          View Task
        </a>
      </div>
    `,
    variables: ["userName", "taskName", "dueDate", "taskUrl"],
  },
};

/**
 * Initialize built-in templates for organization
 */
export async function initializeBuiltInTemplates(organizationId: string): Promise<void> {
  for (const [type, template] of Object.entries(BUILT_IN_TEMPLATES)) {
    const exists = await prisma.emailTemplate.findFirst({
      where: {
        organizationId,
        type: type as EmailTemplateType,
      },
    });

    if (!exists) {
      await createEmailTemplate({
        name: type.replace(/_/g, " ").toLowerCase(),
        type: type as EmailTemplateType,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        variables: template.variables,
        organizationId,
        active: true,
      });
    }
  }
}
