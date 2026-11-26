// src/shared/lib/polyline.ts
// Google's encoded polyline format (precision 5), plus the small geometry the route line needs.
export type LatLng = { latitude: number; longitude: number };

export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  const readValue = () => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    lat += readValue();
    lng += readValue();
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

function encodeInt(value: number): string {
  let n = value < 0 ? ~(value << 1) : value << 1;
  let out = '';
  while (n >= 0x20) {
    out += String.fromCharCode((0x20 | (n & 0x1f)) + 63);
    n >>= 5;
  }
  return out + String.fromCharCode(n + 63);
}

export function encodePolyline(points: LatLng[]): string {
  let prevLat = 0;
  let prevLng = 0;
  let out = '';
  for (const p of points) {
    const lat = Math.round(p.latitude * 1e5);
    const lng = Math.round(p.longitude * 1e5);
    out += encodeInt(lat - prevLat) + encodeInt(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  }
  return out;
}

/** Straight-line distance in meters (haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Distance from a point to the nearest vertex of the line (vertices are dense on real routes). */
export function minDistanceToPolyline(point: LatLng, line: LatLng[]): number {
  let min = Infinity;
  for (const p of line) {
    const d = distanceMeters(point, p);
    if (d < min) min = d;
  }
  return min;
}
