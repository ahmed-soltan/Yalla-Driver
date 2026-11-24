// src/entities/captain/model/captain-types.ts
// Your existing file, updated to match YALLA_BACKEND_ERD_REVISED_1.md.
// Lines marked CHANGED / NEW differ from your previous version.

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

// NEW: the status vocabulary stored for documents, vehicles and vehicle photos (ReviewStatus enum).
export type ReviewStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

// CHANGED: effective status computed by the API. MISSING (no row) and EXPIRED (past expiresAt)
// are never stored, only returned.
export type DocumentStatus = ReviewStatus | 'MISSING' | 'EXPIRED';
export type VehicleStatus = ReviewStatus | 'MISSING';

// NEW: enums from the ERD
export type CaptainDocumentType =
  | 'NATIONAL_ID'
  | 'DRIVING_LICENSE'
  | 'VEHICLE_REGISTRATION'
  | 'VEHICLE_INSURANCE'
  | 'PROFILE_PHOTO';
export type DocumentFileSide = 'FRONT' | 'BACK' | 'SINGLE';
export type ExpiryState = 'NOT_APPLICABLE' | 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'SCOOTER' | 'BICYCLE';
export type VehiclePhotoType = 'FRONT' | 'SIDE' | 'REAR';

export const documentTypeLabels: Record<string, string> = {
  NATIONAL_ID: 'بطاقة الرقم القومي',
  DRIVING_LICENSE: 'رخصة القيادة',
  VEHICLE_REGISTRATION: 'استمارة المركبة',
  VEHICLE_INSURANCE: 'تأمين المركبة',
  PROFILE_PHOTO: 'الصورة الشخصية',
};

// NEW
export const vehiclePhotoLabels: Record<VehiclePhotoType, string> = {
  FRONT: 'الأمامية',
  SIDE: 'الجانبية',
  REAR: 'الخلفية',
};

export type CaptainProfile = {
  id: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    avatarUrl: string | null;
  };
  dateOfBirth: string | null;
  nationality?: string | null;
  rating: number;
  ratingCount: number; // CHANGED: ERD name
  tripsCount: number; // CHANGED: was totalTrips (ERD name)
  verificationStatus: VerificationStatus;
  availabilityStatus: 'OFFLINE' | 'ONLINE';
  gender: 'MALE' | 'FEMALE';
  createdAt: string;
};

// NEW: a renewal that is waiting for review, or was rejected
export type CaptainDocumentReplacement = {
  status: ReviewStatus;
  submittedAt: string;
  rejectionReason: string | null;
};

// NEW: one document slot (replaces `{ type, status }`). Optional documents are included
// with `isRequired: false`; they never block going online.
export type CaptainRequiredDocument = {
  type: CaptainDocumentType;
  vehicleId: string | null; // set for registration and insurance
  status: DocumentStatus;
  isRequired: boolean;
  requiresExpiryDate: boolean;
  requiresBackSide: boolean;
  expiresAt: string | null; // yyyy-MM-dd (active document, else the latest submission)
  daysUntilExpiry: number | null; // negative once expired
  expiryState: ExpiryState;
  rejectionReason: string | null;
  canReplace: boolean; // false while a submission is already open
  replacement: CaptainDocumentReplacement | null;
};

export type CaptainVehiclePhotoStatus = {
  type: VehiclePhotoType;
  status: ReviewStatus | 'MISSING';
  rejectionReason: string | null;
};

export type CaptainVerification = {
  status: VerificationStatus;
  canGoOnline: boolean;
  requiredDocuments: CaptainRequiredDocument[]; // CHANGED shape
  vehicle: {
    status: VehicleStatus;
    rejectionReason: string | null; // NEW
    photos: CaptainVehiclePhotoStatus[]; // NEW
  };
  rejectionReason: string | null;
  suspensionReason: string | null; // NEW: ERD CAPTAIN.suspensionReason, set when SUSPENDED
};

// CHANGED: was `{ documentType, fileId }`. A document has 1 or 2 photos and an expiry date.
export type SubmitCaptainDocumentInput = {
  documentType: CaptainDocumentType;
  vehicleId?: string | null;
  expiresAt?: string; // yyyy-MM-dd, required when requiresExpiryDate
  issuedAt?: string;
  documentNumber?: string;
  files: { side: DocumentFileSide; fileId: string }[];
};
/** @deprecated old name; the shape changed, update the call sites. */
export type ResubmitCaptainDocumentInput = SubmitCaptainDocumentInput;

// NEW
export type SubmitVehiclePhotoInput = { photoType: VehiclePhotoType; fileId: string };

export type CaptainVehicle = {
  id: string;
  type: VehicleType; // CHANGED: BICYCLE added
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string | null; // CHANGED: null for BICYCLE
  isActive: boolean; // NEW
  verificationStatus: VehicleStatus; // CHANGED: was `status` (ERD name)
  rejectionReason?: string | null; // NEW
};

export type UpdateCaptainProfileInput = {
  fullName: string;
  email?: string;
  avatarUrl?: string | null;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
};
