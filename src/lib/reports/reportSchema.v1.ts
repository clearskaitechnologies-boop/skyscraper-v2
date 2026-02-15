import { z } from "zod";

export const ReportSchemaVersion = "report-schema-v1" as const;
export type ReportSchemaVersion = typeof ReportSchemaVersion;

export const ReportSchemaV1Z = z.object({
  schemaVersion: z.literal(ReportSchemaVersion),

  CompanyBranding: z.object({
    companyName: z.string(),
    dbaName: z.string().optional(),
    rocNumber: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    logoUrl: z.string().url().optional(),
  }),

  ClientAndClaim: z.object({
    clientName: z.string().optional(),
    clientPhone: z.string().optional(),
    clientEmail: z.string().optional(),

    propertyAddress: z.string().optional(),

    claimNumber: z.string().optional(),
    policyNumber: z.string().optional(),
    carrierName: z.string().optional(),

    lossType: z.string().optional(),
    dateOfLoss: z.string().optional(),
    inspectionDate: z.string().optional(),
  }),

  AssignedEmployee: z.object({
    employeeName: z.string().optional(),
    title: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    licenseOrAdjusterId: z.string().optional(),
  }),

  ReportPurposeAndSummary: z.object({
    reportType: z.string().optional(),
    purposeText: z.string().optional(),
    executiveSummary: z.string().optional(),
  }),

  DamageFindings: z.object({
    findings: z
      .array(
        z.object({
          component: z.string().optional(),
          condition: z.string().optional(),
          damageType: z.string().optional(),
          severity: z.string().optional(),
          action: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .default([]),
  }),

  PhotoSummary: z.object({
    photos: z
      .array(
        z.object({
          url: z.string().optional(),
          caption: z.string().optional(),
          locationTag: z.string().optional(),
          dateTaken: z.string().optional(),
        })
      )
      .default([]),
  }),

  WeatherVerification: z.object({
    quickDOL: z
      .object({
        source: z.string().optional(),
        dateRange: z.string().optional(),
        hail: z.string().optional(),
        wind: z.string().optional(),
        notes: z.string().optional(),
      })
      .optional(),
    fullWeatherReport: z
      .object({
        provider: z.string().optional(),
        link: z.string().optional(),
        keyMetrics: z.array(z.string()).default([]),
        conclusion: z.string().optional(),
      })
      .optional(),
  }),

  ScopeAndLineItems: z.object({
    scopeItems: z
      .array(
        z.object({
          item: z.string().optional(),
          quantity: z.number().optional(),
          unit: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .default([]),
    estimateTotals: z
      .object({
        rcv: z.number().optional(),
        acv: z.number().optional(),
        depreciation: z.number().optional(),
        deductible: z.number().optional(),
      })
      .optional(),
  }),

  Recommendations: z.object({
    immediateActions: z.array(z.string()).default([]),
    longTermActions: z.array(z.string()).default([]),
  }),

  Appendix: z.object({
    disclaimers: z.array(z.string()).default([]),
    signatures: z
      .object({
        preparedBy: z.string().optional(),
        date: z.string().optional(),
      })
      .optional(),
  }),
});

export type ReportSchemaV1 = z.infer<typeof ReportSchemaV1Z>;
