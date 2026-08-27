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


export function getLocalTime(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    dateStyle: 'full',
    timeStyle: 'long'
  }).format(new Date());
}


export function  getLocalTimeAsDate(timezone: string): Date {
  const now = new Date();

  // Get the time parts in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const values: any = {};
  parts.forEach(p => {
    if (p.type !== 'literal') values[p.type] = p.value;
  });

  // Create a Date using those components (in the browser's local timezone)
  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
}



export function getRealLocalHour(timezone: string): string {
  const now = new Date(); // ← this is the real current moment

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute:'2-digit', 
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const v: Record<string, string> = {};
  
  parts.forEach(p => {
    if (p.type !== 'literal') {
      v[p.type] = p.value;
    }
  });

  // Return the formatted datetime string
  return `${v["year"]}-${v["month"]}-${v["day"]}T${v["hour"]}:${v["minute"]}`;
}

