// src/app/services/mapHelper.ts  (or wherever it is)

/** Contiguous USA + reasonable Alaska & Hawaii */
export const US_BOUNDS = {
  // Contiguous US is roughly 24.5 → 49.4
  // We open it a bit for Alaska & Hawaii
  north: 71.5,    // northern Alaska
  south: 18.8,    // southern Hawaii
  west: -179.2,   // western Alaska
  east: -66.9     // eastern Maine
};

/**
 * More accurate check.
 * First does a fast bounding-box test, then optionally you can add more logic later.
 */
export function isInsideUSA(lat: number, lng: number): boolean {
  // Fast reject
  if (
    lat < US_BOUNDS.south ||
    lat > US_BOUNDS.north ||
    lng < US_BOUNDS.west ||
    lng > US_BOUNDS.east
  ) {
    return false;
  }

  // Extra protection: reject the big Canadian area that falls inside the box
  // (roughly lat > 49 and lng between -125 and -95)
  if (lat > 49.0 && lng > -125 && lng < -95) {
    return false; // Canada
  }

  return true;
}