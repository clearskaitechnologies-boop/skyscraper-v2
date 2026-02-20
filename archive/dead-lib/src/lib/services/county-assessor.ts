/**
 * County Assessor API Integration Service
 * Integrates with Attom Data Solutions and CoreLogic APIs
 * to fetch property data, assessments, and public records
 */

import { fetchSafe } from '@/lib/fetchSafe';
import { logger } from "@/lib/logger";

interface AttomPropertyData {
  address: {
    line1: string;
    line2?: string;
    locality: string;
    countrySubd: string;
    postal1: string;
  };
  lot: {
    lotSize1?: number;
  };
  building: {
    size: {
      universalSize?: number;
      bldgSize?: number;
    };
    rooms: {
      beds?: number;
      bathsTotal?: number;
    };
    summary: {
      yearBuilt?: number;
      stories?: number;
      propType?: string;
    };
  };
  utilities: {
    heatingType?: string;
    coolingType?: string;
  };
  assessment: {
    assessed: {
      assdTtlValue?: number;
    };
    market: {
      mktTtlValue?: number;
    };
  };
}

interface PropertyDataResponse {
  success: boolean;
  data?: {
    squareFootage?: number;
    lotSize?: number;
    yearBuilt?: number;
    numBedrooms?: number;
    numBathrooms?: number;
    numStories?: number;
    propertyType?: string;
    hvacType?: string;
    assessedValue?: number;
    marketValue?: number;
  };
  error?: string;
}

/**
 * Fetch property data from Attom Data API
 */
export async function fetchAttomPropertyData(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<PropertyDataResponse> {
  const attomApiKey = process.env.ATTOM_API_KEY;

  if (!attomApiKey) {
    return {
      success: false,
      error: "Attom API key not configured",
    };
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      address: `${address}, ${city}, ${state} ${zipCode}`,
    });

    // Call Attom API
    const response = await fetchSafe(
      `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${params}`,
      {
        headers: {
          apikey: attomApiKey,
          Accept: "application/json",
        },
        label: 'attom-property'
      }
    );
    if (!response || !response.ok) {
      throw new Error(`Attom API error: ${response.status}`);
    }

    const data = await response.json();
    const property = data.property?.[0] as AttomPropertyData;

    if (!property) {
      return {
        success: false,
        error: "Property not found in Attom database",
      };
    }

    // Map Attom data to our schema
    return {
      success: true,
      data: {
        squareFootage: property.building?.size?.universalSize || property.building?.size?.bldgSize,
        lotSize: property.lot?.lotSize1,
        yearBuilt: property.building?.summary?.yearBuilt,
        numBedrooms: property.building?.rooms?.beds,
        numBathrooms: property.building?.rooms?.bathsTotal,
        numStories: property.building?.summary?.stories,
        propertyType: property.building?.summary?.propType,
        hvacType: property.utilities?.heatingType,
        assessedValue: property.assessment?.assessed?.assdTtlValue,
        marketValue: property.assessment?.market?.mktTtlValue,
      },
    };
  } catch (error) {
    logger.error("Attom API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch property data",
    };
  }
}

/**
 * Fetch property data from CoreLogic API (alternative provider)
 */
export async function fetchCoreLogicPropertyData(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<PropertyDataResponse> {
  const coreLogicApiKey = process.env.CORELOGIC_API_KEY;

  if (!coreLogicApiKey) {
    return {
      success: false,
      error: "CoreLogic API key not configured",
    };
  }

  try {
    // CoreLogic API implementation
    // Note: This is a placeholder - actual endpoint varies by subscription
    const response = await fetchSafe(
      `https://api.corelogic.com/property/v1/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${coreLogicApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: {
            streetAddress: address,
            city,
            state,
            zipCode,
          },
        }),
        label: 'corelogic-property'
      }
    );
    if (!response || !response.ok) {
      throw new Error(`CoreLogic API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        squareFootage: data.livingArea,
        lotSize: data.lotSize,
        yearBuilt: data.yearBuilt,
        numBedrooms: data.bedrooms,
        numBathrooms: data.bathrooms,
        numStories: data.stories,
        propertyType: data.propertyType,
        assessedValue: data.assessedValue,
        marketValue: data.marketValue,
      },
    };
  } catch (error) {
    logger.error("CoreLogic API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch property data",
    };
  }
}

/**
 * Auto-populate property profile with county assessor data
 * Tries Attom first, falls back to CoreLogic if needed
 */
export async function enrichPropertyProfile(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<PropertyDataResponse> {
  // Try Attom first
  let result = await fetchAttomPropertyData(address, city, state, zipCode);

  // If Attom fails, try CoreLogic
  if (!result.success && process.env.CORELOGIC_API_KEY) {
    logger.debug("Attom failed, trying CoreLogic...");
    result = await fetchCoreLogicPropertyData(address, city, state, zipCode);
  }

  return result;
}

/**
 * Fetch permit history from county records
 */
export async function fetchPermitHistory(
  address: string,
  city: string,
  state: string,
  county?: string
): Promise<any> {
  // This would integrate with county-specific permit databases
  // Each county has different APIs/systems, so this is a placeholder
  
  // Example: Austin, TX uses SmartyStreets + Austin's permit API
  // Example: LA County uses PIMS (Permit Information Management System)
  
  return {
    success: false,
    error: "Permit history integration not yet implemented for this county",
  };
}

/**
 * Get property tax information
 */
export async function fetchPropertyTaxInfo(
  address: string,
  city: string,
  state: string,
  county?: string
): Promise<any> {
  // This would query county tax assessor databases
  // Most counties provide public tax records via APIs or web scraping
  
  return {
    success: false,
    error: "Tax info integration not yet implemented for this county",
  };
}
