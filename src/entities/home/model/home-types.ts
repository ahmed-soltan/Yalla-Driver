// src/entities/captain/model/captain-home-types.ts
// New types only. Profile, verification, vehicle types stay in your captain-types.ts.

export type CaptainTodaySummary = {
  earningsPiastres: number;
  goalPiastres: number;
  trips: number;
  demandHint: string | null; // e.g. "طلب عالي في حي الأربعين"
};

export type CaptainLocationPoint = {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  recordedAt: number; // ms epoch
};
