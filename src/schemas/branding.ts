import { z } from "zod";

export const BrandingSchema = z.object({
  company_name: z.string().min(2, "Company name required"),
  phone: z.string().min(7, "Phone required"),
  email: z.string().email(),
  azroc: z.string().min(2, "AZROC required"),
  website: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  street: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  postal_code: z.string().optional(),
  color_primary: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Hex color"),
  color_accent: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Hex color"),
  logo_url: z.string().optional(),
  team_photo_url: z.string().optional(),
  service_areas: z.array(z.string()).optional(),
});
export type BrandingInput = z.infer<typeof BrandingSchema>;
