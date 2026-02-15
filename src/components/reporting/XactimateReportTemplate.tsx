"use client";

import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Cloud,
  DollarSign,
  Droplet,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  Package,
  Phone,
  Sparkles,
  ThermometerSun,
  TrendingUp,
  Wind} from "lucide-react";
import React from "react";

/**
 * XACTIMATE-STYLE REPORT TEMPLATE FOUNDATION
 * 
 * Professional, high-density report structure matching Xactimate PDF standards.
 * Ready to accept data from all platform sources for final PDF generation.
 * 
 * Phase VI - Master Prompt #40
 */

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface ClientInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
}

export interface ClaimInfo {
  claimNumber: string;
  policyNumber?: string;
  dateOfLoss: string;
  inspectionDate: string;
  carrier: string;
  adjusterName?: string;
  adjusterPhone?: string;
}

export interface PropertyInfo {
  address: string;
  propertyType: string; // "Residential", "Commercial", etc.
  squareFootage?: number;
  yearBuilt?: number;
  stories?: number;
  roofType?: string;
  roofAge?: number;
}

export interface WeatherData {
  dateOfLoss: string;
  temperature?: number;
  windSpeed?: number;
  gustSpeed?: number;
  precipitation?: number;
  conditions: string;
  source: string; // "NOAA", "WeatherStack", etc.
}

export interface AISummary {
  damageAssessment: string; // AI-generated damage summary
  recommendedScope: string; // AI-recommended work scope
  estimatedValue: number; // AI value recommendation
  confidenceScore: number; // 0-100 confidence in assessment
  riskFactors: string[]; // Array of identified risk factors
  aiModel: string; // "Dominus Vision", "GPT-4", etc.
  analysisDate: string;
}

export interface DamagePhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption: string; // AI-generated caption
  aiTags: string[]; // ["roof damage", "missing shingles", etc.]
  timestamp: string;
  location?: string; // "Front elevation", "Roof NE corner", etc.
  severity?: "Low" | "Medium" | "High" | "Critical";
}

export interface MaterialLineItem {
  id: string;
  category: string; // "Roofing", "Siding", etc.
  description: string;
  vendor?: string; // "GAF", "SRS Distribution", etc.
  productName?: string;
  quantity: number;
  unit: string; // "SQ", "LF", "EA", etc.
  unitPrice: number;
  totalPrice: number;
  rcv: number;
  acv?: number;
  depreciation?: number;
  notes?: string;
}

export interface ReportData {
  // Header Block
  client: ClientInfo;
  claim: ClaimInfo;
  property: PropertyInfo;
  
  // Weather Block (Optional)
  weather?: WeatherData;
  
  // AI Summary Block
  aiSummary: AISummary;
  
  // Visual Evidence Block
  photos: DamagePhoto[];
  
  // Material Breakdown Block
  materials: MaterialLineItem[];
  
  // Financial Summary
  totalRCV: number;
  totalACV?: number;
  totalDepreciation?: number;
  
  // Report Metadata
  reportGeneratedBy: string;
  reportDate: string;
  reportVersion?: string;
}

// ========================================
// COMPONENT
// ========================================

interface XactimateReportTemplateProps {
  data: ReportData;
  mode?: "pdf" | "preview"; // PDF export or screen preview
  showWatermark?: boolean;
}

export default function XactimateReportTemplate({
  data,
  mode = "preview",
  showWatermark = false,
}: XactimateReportTemplateProps) {
  const isPDF = mode === "pdf";

  // Category-grouped materials
  const materialsByCategory = data.materials.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MaterialLineItem[]>);

  const categories = Object.keys(materialsByCategory).sort();

  return (
    <div className={`${isPDF ? "bg-white text-black" : "bg-[var(--bg)] text-[color:var(--text)]"} mx-auto max-w-[1200px] font-sans`}>
      {showWatermark && (
        <div className="pointer-events-none fixed inset-0 flex rotate-[-45deg] items-center justify-center text-9xl font-black text-gray-400 opacity-10">
          DRAFT
        </div>
      )}

      {/* ========================================
          HEADER BLOCK - Client & Claim Details
          ======================================== */}
      <section className="mb-6 border-4 border-gray-900 p-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column: Client Info */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-blue-700">
              <Building2 className="h-6 w-6" />
              PROPERTY OWNER
            </h2>
            <div className="space-y-2">
              <p className="text-xl font-bold">{data.client.name}</p>
              <p className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  {data.client.address}<br />
                  {data.client.city}, {data.client.state} {data.client.zip}
                </span>
              </p>
              {data.client.phone && (
                <p className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {data.client.phone}
                </p>
              )}
              {data.client.email && (
                <p className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {data.client.email}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Claim Info */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-orange-700">
              <FileText className="h-6 w-6" />
              CLAIM INFORMATION
            </h2>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold">Claim Number:</span>
                <span className="font-black text-blue-700">{data.claim.claimNumber}</span>
              </div>
              {data.claim.policyNumber && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold">Policy Number:</span>
                  <span>{data.claim.policyNumber}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold">Carrier:</span>
                <span className="font-semibold text-blue-700">{data.claim.carrier}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold">Date of Loss:</span>
                <span className="font-bold text-red-700">{new Date(data.claim.dateOfLoss).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold">Inspection Date:</span>
                <span>{new Date(data.claim.inspectionDate).toLocaleDateString()}</span>
              </div>
              {data.claim.adjusterName && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold">Adjuster:</span>
                  <span>{data.claim.adjusterName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Details Row */}
        <div className="mt-6 border-t-2 border-gray-300 pt-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-purple-700">
            <Building2 className="h-5 w-5" />
            PROPERTY DETAILS
          </h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-xs font-bold uppercase text-gray-600">Type</span>
              <span className="font-bold">{data.property.propertyType}</span>
            </div>
            {data.property.squareFootage && (
              <div>
                <span className="block text-xs font-bold uppercase text-gray-600">Square Footage</span>
                <span className="font-bold">{data.property.squareFootage.toLocaleString()} SF</span>
              </div>
            )}
            {data.property.yearBuilt && (
              <div>
                <span className="block text-xs font-bold uppercase text-gray-600">Year Built</span>
                <span className="font-bold">{data.property.yearBuilt}</span>
              </div>
            )}
            {data.property.roofType && (
              <div>
                <span className="block text-xs font-bold uppercase text-gray-600">Roof Type</span>
                <span className="font-bold">{data.property.roofType} {data.property.roofAge && `(${data.property.roofAge} yrs)`}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================
          WEATHER BLOCK (Optional)
          ======================================== */}
      {data.weather && (
        <section className="mb-6 border-2 border-blue-500 bg-blue-50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-blue-800">
            <Cloud className="h-6 w-6" />
            WEATHER CONDITIONS - DATE OF LOSS
          </h2>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <ThermometerSun className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-xs font-bold uppercase text-gray-600">Temp</div>
                <div className="text-lg font-black">{data.weather.temperature}°F</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs font-bold uppercase text-gray-600">Wind</div>
                <div className="text-lg font-black">{data.weather.windSpeed} mph</div>
              </div>
            </div>
            {data.weather.gustSpeed && (
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-xs font-bold uppercase text-gray-600">Gusts</div>
                  <div className="text-lg font-black text-red-700">{data.weather.gustSpeed} mph</div>
                </div>
              </div>
            )}
            {data.weather.precipitation !== undefined && (
              <div className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xs font-bold uppercase text-gray-600">Precip</div>
                  <div className="text-lg font-black">{data.weather.precipitation}"</div>
                </div>
              </div>
            )}
            <div>
              <div className="text-xs font-bold uppercase text-gray-600">Conditions</div>
              <div className="font-bold">{data.weather.conditions}</div>
              <div className="mt-1 text-xs text-gray-500">Source: {data.weather.source}</div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================
          AI SUMMARY BLOCK
          ======================================== */}
      <section className="mb-6 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-purple-800">
          <Sparkles className="h-6 w-6" />
          AI-POWERED DAMAGE ASSESSMENT
        </h2>
        
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-purple-300 bg-white p-4 shadow-sm">
            <div className="mb-1 text-xs font-bold uppercase text-gray-600">Estimated Value</div>
            <div className="flex items-center gap-2 text-3xl font-black text-green-700">
              <DollarSign className="h-6 w-6" />
              {data.aiSummary.estimatedValue.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border border-purple-300 bg-white p-4 shadow-sm">
            <div className="mb-1 text-xs font-bold uppercase text-gray-600">Confidence Score</div>
            <div className={`flex items-center gap-2 text-3xl font-black ${
              data.aiSummary.confidenceScore >= 80 ? "text-green-700" :
              data.aiSummary.confidenceScore >= 60 ? "text-yellow-700" :
              "text-red-700"
            }`}>
              <TrendingUp className="h-6 w-6" />
              {data.aiSummary.confidenceScore}%
            </div>
          </div>
          <div className="rounded-lg border border-purple-300 bg-white p-4 shadow-sm">
            <div className="mb-1 text-xs font-bold uppercase text-gray-600">AI Model</div>
            <div className="mt-2 text-lg font-black text-purple-700">{data.aiSummary.aiModel}</div>
            <div className="text-xs text-gray-500">{new Date(data.aiSummary.analysisDate).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-purple-300 bg-white p-4">
          <h3 className="mb-2 text-sm font-black uppercase text-gray-700">Damage Assessment</h3>
          <p className="text-sm leading-relaxed text-gray-800">{data.aiSummary.damageAssessment}</p>
        </div>

        <div className="mb-4 rounded-lg border border-purple-300 bg-white p-4">
          <h3 className="mb-2 text-sm font-black uppercase text-gray-700">Recommended Scope</h3>
          <p className="text-sm leading-relaxed text-gray-800">{data.aiSummary.recommendedScope}</p>
        </div>

        {data.aiSummary.riskFactors.length > 0 && (
          <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              Risk Factors Identified
            </h3>
            <ul className="space-y-1 text-sm text-yellow-900">
              {data.aiSummary.riskFactors.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ========================================
          VISUAL EVIDENCE BLOCK
          ======================================== */}
      <section className="mb-6 border-2 border-gray-900 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
          <ImageIcon className="h-6 w-6 text-blue-700" />
          VISUAL DOCUMENTATION ({data.photos.length} Photos)
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {data.photos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg">
              <div className="relative aspect-video bg-gray-200">
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption}
                  className="h-full w-full object-cover"
                />
                {photo.severity && (
                  <div className={`absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-black ${
                    photo.severity === "Critical" ? "bg-red-600 text-white" :
                    photo.severity === "High" ? "bg-orange-500 text-white" :
                    photo.severity === "Medium" ? "bg-yellow-500 text-black" :
                    "bg-green-500 text-white"
                  }`}>
                    {photo.severity}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="mb-2 text-sm font-bold text-gray-900">{photo.caption}</p>
                {photo.location && (
                  <p className="mb-2 flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    {photo.location}
                  </p>
                )}
                {photo.aiTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {photo.aiTags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">{new Date(photo.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================
          MATERIAL BREAKDOWN BLOCK
          ======================================== */}
      <section className="mb-6 border-4 border-gray-900">
        <div className="bg-gray-900 p-4 text-white">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <Package className="h-6 w-6" />
            MATERIAL BREAKDOWN & SPECIFICATIONS
          </h2>
        </div>

        {categories.map((category) => {
          const categoryItems = materialsByCategory[category];
          const categoryRCV = categoryItems.reduce((sum, item) => sum + item.rcv, 0);
          const categoryACV = categoryItems.reduce((sum, item) => sum + (item.acv || 0), 0);

          return (
            <div key={category} className="border-b-2 border-gray-300 last:border-b-0">
              <div className="flex items-center justify-between bg-gray-100 px-4 py-3 text-lg font-black text-gray-900">
                <span>{category}</span>
                <span className="text-blue-700">${categoryRCV.toLocaleString()}</span>
              </div>
              
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-black uppercase">Description</th>
                    <th className="px-3 py-2 text-center text-xs font-black uppercase">Qty</th>
                    <th className="px-3 py-2 text-center text-xs font-black uppercase">Unit</th>
                    <th className="px-3 py-2 text-right text-xs font-black uppercase">Unit $</th>
                    <th className="px-3 py-2 text-right text-xs font-black uppercase">Total $</th>
                    {categoryACV > 0 && <th className="px-3 py-2 text-right text-xs font-black uppercase">ACV $</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categoryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="font-bold">{item.description}</div>
                        {item.vendor && (
                          <div className="mt-1 text-xs text-gray-600">
                            {item.vendor} {item.productName && `- ${item.productName}`}
                          </div>
                        )}
                        {item.notes && (
                          <div className="mt-1 text-xs italic text-gray-500">{item.notes}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-bold">{item.quantity}</td>
                      <td className="px-3 py-2 text-center font-semibold">{item.unit}</td>
                      <td className="px-3 py-2 text-right font-semibold">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-black text-blue-700">${item.totalPrice.toLocaleString()}</td>
                      {categoryACV > 0 && (
                        <td className="px-3 py-2 text-right font-black text-green-700">
                          ${(item.acv || 0).toLocaleString()}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-black">
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-right">Subtotal ({category}):</td>
                    <td className="px-3 py-3 text-right text-lg text-blue-700">${categoryRCV.toLocaleString()}</td>
                    {categoryACV > 0 && (
                      <td className="px-3 py-3 text-right text-lg text-green-700">${categoryACV.toLocaleString()}</td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}

        {/* Grand Total */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 text-white">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="mb-2 text-sm font-bold uppercase">Total RCV</div>
              <div className="text-4xl font-black">${data.totalRCV.toLocaleString()}</div>
            </div>
            {data.totalACV !== undefined && data.totalACV > 0 && (
              <>
                <div>
                  <div className="mb-2 text-sm font-bold uppercase">Total Depreciation</div>
                  <div className="text-4xl font-black text-orange-300">
                    ${(data.totalDepreciation || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-bold uppercase">Total ACV</div>
                  <div className="text-4xl font-black text-green-300">${data.totalACV.toLocaleString()}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========================================
          FOOTER - Report Metadata
          ======================================== */}
      <footer className="space-y-1 border-t-2 border-gray-300 pb-8 pt-4 text-center text-xs text-gray-600">
        <p className="font-bold">Report Generated By: {data.reportGeneratedBy}</p>
        <p>Report Date: {new Date(data.reportDate).toLocaleString()}</p>
        {data.reportVersion && <p>Version: {data.reportVersion}</p>}
        <p className="mt-4 italic">
          This report contains AI-assisted analysis. All findings should be verified by a licensed professional.
        </p>
      </footer>
    </div>
  );
}

// ========================================
// SAMPLE DATA FOR TESTING
// ========================================

export const SAMPLE_REPORT_DATA: ReportData = {
  client: {
    name: "John & Jane Homeowner",
    address: "1234 Main Street",
    city: "Dallas",
    state: "TX",
    zip: "75201",
    phone: "(214) 555-0100",
    email: "homeowner@example.com"
  },
  claim: {
    claimNumber: "CLM-2024-001234",
    policyNumber: "POL-9876543",
    dateOfLoss: "2024-01-15",
    inspectionDate: "2024-01-20",
    carrier: "State Farm Insurance",
    adjusterName: "Mike Adjuster",
    adjusterPhone: "(214) 555-0200"
  },
  property: {
    address: "1234 Main Street, Dallas, TX 75201",
    propertyType: "Single Family Residential",
    squareFootage: 2500,
    yearBuilt: 2010,
    stories: 2,
    roofType: "Architectural Shingles",
    roofAge: 8
  },
  weather: {
    dateOfLoss: "2024-01-15",
    temperature: 42,
    windSpeed: 45,
    gustSpeed: 65,
    precipitation: 0.5,
    conditions: "Severe Thunderstorm with Hail",
    source: "NOAA"
  },
  aiSummary: {
    damageAssessment: "AI Vision analysis identified extensive hail damage across 85% of the roof surface, with impact marks measuring 1-1.5 inches in diameter. Multiple missing shingles observed on north and east elevations. Gutter damage consistent with severe weather event. No structural damage to decking detected.",
    recommendedScope: "Full roof replacement recommended due to extent of hail damage exceeding insurance threshold. Recommend GAF Timberline HDZ architectural shingles to match existing. Include ridge vent replacement, starter strip, and drip edge. Gutter system repair on north elevation.",
    estimatedValue: 18500,
    confidenceScore: 92,
    riskFactors: [
      "Age of roof (8 years) may affect coverage",
      "Hail damage pattern suggests multiple weather events",
      "Potential for hidden decking damage requiring further inspection"
    ],
    aiModel: "Dominus Vision AI",
    analysisDate: "2024-01-20T10:30:00Z"
  },
  photos: [
    {
      id: "photo-1",
      url: "/uploads/damage-1.jpg",
      caption: "Roof Overview - North Elevation showing extensive hail damage and missing shingles",
      aiTags: ["hail damage", "missing shingles", "roof damage"],
      timestamp: "2024-01-20T10:00:00Z",
      location: "Roof - North Elevation",
      severity: "High"
    },
    {
      id: "photo-2",
      url: "/uploads/damage-2.jpg",
      caption: "Close-up of hail impact marks on shingle surface, measuring 1-1.5 inches",
      aiTags: ["hail impact", "shingle damage"],
      timestamp: "2024-01-20T10:15:00Z",
      location: "Roof - East Corner",
      severity: "Critical"
    }
  ],
  materials: [
    {
      id: "item-1",
      category: "Roofing",
      description: "Architectural Shingles - GAF Timberline HDZ",
      vendor: "GAF",
      productName: "Timberline HDZ Charcoal",
      quantity: 28,
      unit: "SQ",
      unitPrice: 385.50,
      totalPrice: 10794,
      rcv: 10794,
      acv: 8635.20,
      depreciation: 2158.80
    },
    {
      id: "item-2",
      category: "Roofing",
      description: "Ridge Vent - Pro Cut III",
      vendor: "GAF",
      quantity: 45,
      unit: "LF",
      unitPrice: 12.50,
      totalPrice: 562.50,
      rcv: 562.50
    },
    {
      id: "item-3",
      category: "Gutters",
      description: "6\" K-Style Gutter Replacement",
      vendor: "SRS Distribution",
      quantity: 25,
      unit: "LF",
      unitPrice: 18.75,
      totalPrice: 468.75,
      rcv: 468.75
    }
  ],
  totalRCV: 18500,
  totalACV: 14800,
  totalDepreciation: 3700,
  reportGeneratedBy: "SkaiScrape AI Platform",
  reportDate: "2024-01-21T14:30:00Z",
  reportVersion: "1.0"
};
