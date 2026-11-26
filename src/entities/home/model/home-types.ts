// src/entities/captain/model/captain-home-types.ts
// New types only. Profile, verification, vehicle types stay in your captain-types.ts.

export type CaptainTodaySummary = {
  earningsPiastres: number;
  goalPiastres: number;
  trips: number;
  demandHint: string | null; // e.g. "طلب عالي في حي الأربعين"
};

/** Body of POST /captain/location. No captainId (from the token) and no timestamp (the server sets it). */
export type CaptainLocationPoint = {
  latitude: number;
  longitude: number;
  heading: number | null; // degrees 0-360, null when unknown
  speed: number | null; // meters per second as reported by the device, null when unknown
};