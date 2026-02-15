import { z } from "zod";

export const CompanyIdentitySchema = z.object({
  name: z.string().min(2),
  roc: z.string().optional(),
  ein: z.string().optional(),
  officePhone: z.string().optional(),
  dispatchPhone: z.string().optional(),
  email: z.string().email(),
  website: z.string().url().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
  logos: z
    .object({
      primary: z.string().url().optional(),
      secondary: z.string().url().optional(),
      svg: z.string().url().optional(),
    })
    .optional(),
  colors: z
    .object({
      primary: z
        .string()
        .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
        .optional(),
      accent: z.string().optional(),
      highlight: z.string().optional(),
    })
    .optional(),
});

export const CredentialsInsuranceSchema = z.object({
  licenses: z
    .array(
      z.object({
        type: z.string(),
        number: z.string(),
        state: z.string(),
        expires_on: z.string().optional(),
      })
    )
    .optional(),
  insurance: z
    .object({
      gl_carrier: z.string().optional(),
      policy_no: z.string().optional(),
      pdf_url: z.string().url().optional(),
    })
    .optional(),
  manufacturer_certs: z.array(z.string()).optional(),
});

export const BrandingWizardSchema = z.object({
  identity: CompanyIdentitySchema,
  credentials: CredentialsInsuranceSchema.optional(),
  defaults: z
    .object({
      state: z.string().optional(),
      codeEdition: z.string().optional(),
      timezone: z.string().optional(),
      dateFormat: z.string().optional(),
    })
    .optional(),
});

export type BrandingWizard = z.infer<typeof BrandingWizardSchema>;
