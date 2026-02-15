/**
 * Task 221: Geospatial Analytics Engine
 *
 * Implements location-based queries, proximity search, geofencing,
 * route optimization, and spatial indexing.
 */

import prisma from "@/lib/prisma";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoFence {
  id: string;
  name: string;
  shape: "circle" | "polygon";
  center?: GeoPoint;
  radius?: number; // meters
  vertices?: GeoPoint[];
  active: boolean;
  metadata: Record<string, any>;
}

export interface LocationEvent {
  id: string;
  entityId: string;
  location: GeoPoint;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Find nearby points
 */
export async function findNearby(
  center: GeoPoint,
  radius: number,
  limit?: number
): Promise<LocationEvent[]> {
  const events = await prisma.locationEvent.findMany({
    take: limit || 100,
    orderBy: { timestamp: "desc" },
  });

  return events
    .filter((event) => {
      const distance = calculateDistance(center, event.location);
      return distance <= radius;
    })
    .map((e) => e as LocationEvent);
}

/**
 * Create geofence
 */
export async function createGeoFence(
  name: string,
  shape: "circle" | "polygon",
  options: {
    center?: GeoPoint;
    radius?: number;
    vertices?: GeoPoint[];
    metadata?: Record<string, any>;
  }
): Promise<GeoFence> {
  const fence = await prisma.geoFence.create({
    data: {
      name,
      shape,
      center: options.center,
      radius: options.radius,
      vertices: options.vertices,
      active: true,
      metadata: options.metadata || {},
    },
  });

  return fence as GeoFence;
}

/**
 * Check if point is inside geofence
 */
export function isInsideGeoFence(point: GeoPoint, fence: GeoFence): boolean {
  if (fence.shape === "circle" && fence.center && fence.radius) {
    const distance = calculateDistance(point, fence.center);
    return distance <= fence.radius;
  }

  if (fence.shape === "polygon" && fence.vertices) {
    return isPointInPolygon(point, fence.vertices);
  }

  return false;
}

/**
 * Point in polygon algorithm
 */
function isPointInPolygon(point: GeoPoint, vertices: GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].latitude,
      yi = vertices[i].longitude;
    const xj = vertices[j].latitude,
      yj = vertices[j].longitude;

    const intersect =
      yi > point.longitude !== yj > point.longitude &&
      point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Track location event
 */
export async function trackLocation(
  entityId: string,
  location: GeoPoint,
  metadata?: Record<string, any>
): Promise<LocationEvent> {
  const event = await prisma.locationEvent.create({
    data: {
      entityId,
      location,
      timestamp: new Date(),
      metadata,
    },
  });

  // Check geofence triggers
  await checkGeoFenceTriggers(entityId, location);

  return event as LocationEvent;
}

/**
 * Check geofence triggers
 */
async function checkGeoFenceTriggers(entityId: string, location: GeoPoint): Promise<void> {
  const fences = await prisma.geoFence.findMany({
    where: { active: true },
  });

  for (const fence of fences) {
    if (isInsideGeoFence(location, fence as GeoFence)) {
      await prisma.geoFenceTrigger.create({
        data: {
          entityId,
          fenceId: fence.id,
          location,
          timestamp: new Date(),
        },
      });
    }
  }
}

/**
 * Optimize route
 */
export function optimizeRoute(waypoints: GeoPoint[]): GeoPoint[] {
  // Simplified nearest neighbor algorithm
  if (waypoints.length <= 2) return waypoints;

  const optimized: GeoPoint[] = [waypoints[0]];
  const remaining = waypoints.slice(1);

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let minDistance = Infinity;

    remaining.forEach((point, index) => {
      const distance = calculateDistance(current, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    optimized.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }

  return optimized;
}

export { GeoFence, GeoPoint, LocationEvent };
