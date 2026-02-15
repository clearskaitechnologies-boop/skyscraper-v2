/**
 * PHASE 16.1 — STORM EVENT LISTENER
 * 24/7/365 Real-time storm detection and tracking
 * Integrates with NOAA, NWS, and radar feeds
 */

import { getDelegate } from "@/lib/db/modelAliases";
import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

// ============================================
// NOAA/NWS API INTEGRATION
// ============================================

interface NOAAStormReport {
  eventId: string;
  eventType: 'HAIL' | 'WIND' | 'TORNADO' | 'LIGHTNING' | 'FLOOD';
  severity: number;
  lat: number;
  lng: number;
  radius: number;
  startTime: Date;
  endTime?: Date;
  hailSize?: number;
  windSpeed?: number;
  tornadoRating?: string;
  rainfall?: number;
  affectedZipCodes: string[];
  affectedCities: string[];
}

// Service areas to monitor
const MONITORED_ZIPCODES = [
  // Arizona
  '86301', '86303', '86305', // Prescott
  '86323', // Chino Valley
  '86327', // Dewey-Humboldt
  '86001', '86004', // Flagstaff
  '85001', '85003', '85004', '85006', // Phoenix
  '85250', '85251', '85254', '85255', // Scottsdale
  '86326', // Cottonwood
  // Add all service areas
];

const MONITORED_CITIES = [
  'Prescott', 'Chino Valley', 'Dewey', 'Flagstaff',
  'Phoenix', 'Scottsdale', 'Cottonwood', 'Sedona',
];

export async function fetchActiveStorms(): Promise<NOAAStormReport[]> {
  // In production, this would call:
  // - NOAA Storm Events Database API
  // - National Weather Service API
  // - RadarScope API
  // - Hail report databases
  
  try {
    // Mock implementation - replace with real API calls
    const response = await fetch('https://api.weather.gov/alerts/active?zone=AZ');
    const data = await response.json();
    
    const storms: NOAAStormReport[] = [];
    
    for (const alert of data.features || []) {
      const props = alert.properties;
      
      // Filter for relevant storm types
      if (props.event?.includes('Severe Thunderstorm') ||
          props.event?.includes('Tornado') ||
          props.event?.includes('Hail')) {
        
        const geometry = alert.geometry;
        const coords = geometry?.coordinates?.[0]?.[0] || [0, 0];
        
        storms.push({
          eventId: props.id,
          eventType: determineEventType(props.event),
          severity: calculateSeverity(props),
          lat: coords[1],
          lng: coords[0],
          radius: estimateRadius(geometry),
          startTime: new Date(props.onset || props.sent),
          endTime: props.expires ? new Date(props.expires) : undefined,
          hailSize: extractHailSize(props.description),
          windSpeed: extractWindSpeed(props.description),
          affectedZipCodes: props.geocode?.UGC || [],
          affectedCities: [props.areaDesc || ''],
        });
      }
    }
    
    return storms;
  } catch (error) {
    console.error('Failed to fetch active storms:', error);
    return [];
  }
}

function determineEventType(eventName: string): NOAAStormReport['eventType'] {
  if (eventName.includes('Hail')) return 'HAIL';
  if (eventName.includes('Tornado')) return 'TORNADO';
  if (eventName.includes('Wind')) return 'WIND';
  if (eventName.includes('Lightning')) return 'LIGHTNING';
  if (eventName.includes('Flood')) return 'FLOOD';
  return 'WIND';
}

function calculateSeverity(props: any): number {
  // 1-10 scale based on severity
  const severity = props.severity;
  const urgency = props.urgency;
  
  if (severity === 'Extreme' || urgency === 'Immediate') return 10;
  if (severity === 'Severe') return 8;
  if (severity === 'Moderate') return 5;
  return 3;
}

function estimateRadius(geometry: any): number {
  // Calculate approximate radius from geometry
  // This is simplified - production would use proper geospatial calculations
  return 10; // miles
}

function extractHailSize(description: string): number | undefined {
  // Extract hail size from description text
  const hailMatch = description?.match(/(\d+\.?\d*)\s*inch\s*hail/i);
  return hailMatch ? parseFloat(hailMatch[1]) : undefined;
}

function extractWindSpeed(description: string): number | undefined {
  // Extract wind speed from description text
  const windMatch = description?.match(/(\d+)\s*mph/i);
  return windMatch ? parseInt(windMatch[1]) : undefined;
}

// ============================================
// STORM DETECTION ENGINE
// ============================================

export async function detectStormsInServiceArea(orgId: string): Promise<string[]> {
  const activeStorms = await fetchActiveStorms();
  const newStormIds: string[] = [];
  
  for (const storm of activeStorms) {
    // Check if storm affects monitored areas
    const affectsServiceArea = storm.affectedZipCodes.some(zip => 
      MONITORED_ZIPCODES.includes(zip)
    ) || storm.affectedCities.some(city => 
      MONITORED_CITIES.some(monitored => 
        city.toLowerCase().includes(monitored.toLowerCase())
      )
    );
    
    if (!affectsServiceArea) continue;
    
    // Check if we've already logged this event
    const existing = await getDelegate('stormEvent').findFirst({
      where: {
        orgId,
        noaaEventId: storm.eventId,
      },
    });
    
    if (existing) continue;
    
    // Create new storm event
    const stormEventId = await createStormEvent(orgId, storm);
    newStormIds.push(stormEventId);
  }
  
  return newStormIds;
}

export async function createStormEvent(
  orgId: string,
  stormData: NOAAStormReport
): Promise<string> {
  // Calculate impact area
  const propertiesInArea = await estimatePropertiesInRadius(
    stormData.lat,
    stormData.lng,
    stormData.radius
  );
  
  // AI analysis
  const impactAnalysis = await analyzeStormImpact(stormData, propertiesInArea);
  
  const stormEvent = await getDelegate('stormEvent').create({
    data: {
      orgId,
      eventType: stormData.eventType,
      severity: stormData.severity,
      noaaEventId: stormData.eventId,
      
      centerLat: stormData.lat,
      centerLng: stormData.lng,
      radiusMiles: stormData.radius,
      affectedZipCodes: stormData.affectedZipCodes,
      affectedCities: stormData.affectedCities,
      
      hailSizeMin: stormData.hailSize ? stormData.hailSize * 0.8 : undefined,
      hailSizeMax: stormData.hailSize ? stormData.hailSize * 1.2 : undefined,
      hailSizeAvg: stormData.hailSize,
      windSpeedMax: stormData.windSpeed,
      tornadoRating: stormData.tornadoRating,
      
      stormStartTime: stormData.startTime,
      stormEndTime: stormData.endTime,
      
      estimatedPropertiesImpacted: propertiesInArea.total,
      highRiskProperties: propertiesInArea.highRisk,
      mediumRiskProperties: propertiesInArea.mediumRisk,
      lowRiskProperties: propertiesInArea.lowRisk,
      
      impactSummary: impactAnalysis.summary,
      damageProjection: impactAnalysis.damageProjection,
      deploymentRecommendation: impactAnalysis.deploymentRecommendation,
      aiConfidence: impactAnalysis.confidence,
      
      status: 'DETECTED',
    },
  });
  
  // Log activity
  await prisma.activities.create({
    data: {
      orgId,
      type: 'storm_detected',
      title: 'Storm Detected',
      userId: "system",
      userName: "System",
      description: `🌪️ ${stormData.eventType} event detected: ${stormData.affectedCities.join(', ')}`,
      metadata: {
        stormEventId: stormEvent.id,
        severity: stormData.severity,
        hailSize: stormData.hailSize,
        windSpeed: stormData.windSpeed,
        estimatedImpact: propertiesInArea.total,
      },
    },
  });
  
  console.log(`✅ Storm event created: ${stormEvent.id}`);
  
  return stormEvent.id;
}

// ============================================
// PROPERTY IMPACT CALCULATOR
// ============================================

interface PropertyEstimate {
  total: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

async function estimatePropertiesInRadius(
  lat: number,
  lng: number,
  radiusMiles: number
): Promise<PropertyEstimate> {
  // In production, this would:
  // 1. Query property databases
  // 2. Use GIS systems
  // 3. Cross-reference with census data
  // 4. Calculate properties within radius
  
  // Simplified calculation based on population density
  const avgHouseholdsPerSqMile = 100; // Adjust per region
  const area = Math.PI * radiusMiles * radiusMiles;
  const estimated = Math.round(area * avgHouseholdsPerSqMile);
  
  return {
    total: estimated,
    highRisk: Math.round(estimated * 0.15), // 15% high risk
    mediumRisk: Math.round(estimated * 0.35), // 35% medium risk
    lowRisk: Math.round(estimated * 0.50), // 50% low risk
  };
}

// ============================================
// AI IMPACT ANALYSIS
// ============================================

interface ImpactAnalysis {
  summary: string;
  damageProjection: string;
  deploymentRecommendation: string;
  confidence: number;
}

async function analyzeStormImpact(
  storm: NOAAStormReport,
  properties: PropertyEstimate
): Promise<ImpactAnalysis> {
  let summary = '';
  let damageProjection = '';
  let deploymentRecommendation = '';
  let confidence = 0;
  
  // Hail analysis
  if (storm.eventType === 'HAIL' && storm.hailSize) {
    if (storm.hailSize >= 1.75) {
      summary = `SEVERE HAIL EVENT: ${storm.hailSize}" hail reported in ${storm.affectedCities.join(', ')}. High probability of roof damage across ${properties.total.toLocaleString()} properties.`;
      damageProjection = `Estimated ${properties.highRisk} homes with severe damage, ${properties.mediumRisk} with moderate damage. Projected claim value: $${(properties.highRisk * 15000 + properties.mediumRisk * 8000).toLocaleString()}.`;
      deploymentRecommendation = `🚨 IMMEDIATE DEPLOYMENT RECOMMENDED. Activate CAT response. Deploy ${Math.ceil(properties.highRisk / 15)} inspection teams. Priority canvassing in high-risk zones.`;
      confidence = 95;
    } else if (storm.hailSize >= 1.0) {
      summary = `MODERATE HAIL EVENT: ${storm.hailSize}" hail in ${storm.affectedCities.join(', ')}. Potential damage to ${properties.total.toLocaleString()} properties.`;
      damageProjection = `Estimated ${properties.highRisk} homes with moderate damage. Projected claim value: $${(properties.highRisk * 10000).toLocaleString()}.`;
      deploymentRecommendation = `Deploy inspection teams within 24-48 hours. Focus on older roofs and high-value properties.`;
      confidence = 80;
    }
  }
  
  // Wind analysis
  if (storm.eventType === 'WIND' && storm.windSpeed) {
    if (storm.windSpeed >= 70) {
      summary = `SEVERE WIND EVENT: ${storm.windSpeed} mph winds in ${storm.affectedCities.join(', ')}. Likely structural damage.`;
      damageProjection = `Estimated ${properties.highRisk} homes with wind damage (shingles, flashing, gutters).`;
      deploymentRecommendation = `Deploy teams for wind damage assessment. Focus on exposed properties and older roofs.`;
      confidence = 85;
    }
  }
  
  return {
    summary,
    damageProjection,
    deploymentRecommendation,
    confidence,
  };
}

// ============================================
// STORM LISTENER SERVICE (RUNS 24/7)
// ============================================

export async function runStormListener(orgId: string): Promise<string[]> {
  console.log('🌪️ Storm listener active...');
  
  try {
    return await detectStormsInServiceArea(orgId);
  } catch (error) {
    console.error('Storm listener error:', error);
    return [];
  }
}

// Run every 5 minutes
export function startStormListenerService(orgId: string): NodeJS.Timeout {
  const interval = setInterval(() => {
    runStormListener(orgId);
  }, 5 * 60 * 1000); // 5 minutes
  
  // Run immediately
  runStormListener(orgId);
  
  return interval;
}
