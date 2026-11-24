// src/entities/captain/api/captain-api.ts
// Your file, updated for the captain documents data model (YALLA_BACKEND_ERD_REVISED_1.md).
// Changes: shared `request`, new verification shape (expiry, renewal, vehicle photos) in the
// dev mock, `resubmitCaptainDocument` replaced by `submitCaptainDocument`, new
// `submitVehiclePhoto`, and the vehicle mock follows the new type.
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import type {
  CaptainDocumentType,
  CaptainProfile,
  CaptainRequiredDocument,
  CaptainVehicle,
  CaptainVehiclePhotoStatus,
  CaptainVerification,
  DocumentStatus,
  ExpiryState,
  ReviewStatus,
  SubmitCaptainDocumentInput,
  SubmitVehiclePhotoInput,
  UpdateCaptainProfileInput,
} from '../model/captain-types';
import { request } from '@/shared/api/client';

let mockProfile: CaptainProfile = {
  id: 'dev-captain-profile',
  user: {
    id: 'dev-captain-id',
    fullName: 'أحمد محمد',
    phoneNumber: '+201012345678',
    email: 'ahmed@example.com',
    avatarUrl: null,
  },
  dateOfBirth: '1995-05-15',
  rating: 0,
  ratingCount: 0,
  tripsCount: 0,
  // CHANGED: was UNDER_REVIEW; the mock verification below is VERIFIED, so keep them consistent
  verificationStatus: 'VERIFIED',
  availabilityStatus: 'ONLINE',
  createdAt: '2026-10-01T10:00:00Z',
  gender: 'MALE',
};

// ---------------- mock verification (dev only, stateful) ----------------
const WARNING_DAYS = 30;
const inDays = (n: number) => format(addDays(new Date(), n), 'yyyy-MM-dd');

type MockDocument = {
  type: CaptainDocumentType;
  vehicleId: string | null;
  isRequired: boolean;
  requiresExpiryDate: boolean;
  requiresBackSide: boolean;
  expiresAt: string | null;
  hasActive: boolean; // a VERIFIED, non-superseded document exists
  open: ReviewStatus | null; // PENDING / UNDER_REVIEW submission
  rejected: string | null;
  submittedAt: string | null;
};

// Covers every state the screens handle: valid, expiring soon, expired, missing.
const mockDocuments: MockDocument[] = [
  {
    type: 'NATIONAL_ID',
    vehicleId: null,
    isRequired: true,
    requiresExpiryDate: true,
    requiresBackSide: true,
    expiresAt: inDays(900),
    hasActive: true,
    open: null,
    rejected: null,
    submittedAt: null,
  },
  {
    type: 'DRIVING_LICENSE',
    vehicleId: null,
    isRequired: true,
    requiresExpiryDate: true,
    requiresBackSide: true,
    expiresAt: inDays(12),
    hasActive: true,
    open: null,
    rejected: null,
    submittedAt: null,
  },
  {
    type: 'VEHICLE_REGISTRATION',
    vehicleId: 'dev-vehicle',
    isRequired: true,
    requiresExpiryDate: true,
    requiresBackSide: true,
    expiresAt: inDays(3),
    hasActive: true,
    open: null,
    rejected: null,
    submittedAt: null,
  },
  {
    type: 'VEHICLE_INSURANCE',
    vehicleId: 'dev-vehicle',
    isRequired: true,
    requiresExpiryDate: true,
    requiresBackSide: false,
    expiresAt: null,
    hasActive: true,
    open: null,
    rejected: null,
    submittedAt: null,
  },
  {
    type: 'PROFILE_PHOTO',
    vehicleId: null,
    isRequired: true,
    requiresExpiryDate: false,
    requiresBackSide: false,
    expiresAt: null,
    hasActive: true,
    open: null,
    rejected: null,
    submittedAt: null,
  },
];

const mockPhotos: CaptainVehiclePhotoStatus[] = [
  { type: 'FRONT', status: 'VERIFIED', rejectionReason: null },
  { type: 'SIDE', status: 'VERIFIED', rejectionReason: null },
  { type: 'REAR', status: 'VERIFIED', rejectionReason: null },
];

function toRequiredDocument(d: MockDocument): CaptainRequiredDocument {
  const days = d.expiresAt
    ? differenceInCalendarDays(new Date(`${d.expiresAt}T00:00:00`), new Date())
    : null;

  let status: DocumentStatus;
  if (d.hasActive) status = days != null && days < 0 ? 'EXPIRED' : 'VERIFIED';
  else if (d.open) status = d.open;
  else if (d.rejected) status = 'REJECTED';
  else status = 'MISSING';

  let expiryState: ExpiryState = 'NOT_APPLICABLE';
  if (days != null)
    expiryState = days < 0 ? 'EXPIRED' : days <= WARNING_DAYS ? 'EXPIRING_SOON' : 'VALID';

  const submittedAt = d.submittedAt ?? new Date().toISOString();
  return {
    type: d.type,
    vehicleId: d.vehicleId,
    status,
    isRequired: d.isRequired,
    requiresExpiryDate: d.requiresExpiryDate,
    requiresBackSide: d.requiresBackSide,
    expiresAt: d.expiresAt,
    daysUntilExpiry: days,
    expiryState,
    rejectionReason: d.hasActive ? null : d.rejected,
    canReplace: d.open == null,
    replacement: d.open
      ? { status: d.open, submittedAt, rejectionReason: null }
      : d.hasActive && d.rejected
        ? { status: 'REJECTED', submittedAt, rejectionReason: d.rejected }
        : null,
  };
}

function buildMockVerification(): CaptainVerification {
  const documents = mockDocuments.map(toRequiredDocument);
  const photosOk = mockPhotos.every((p) => p.status === 'VERIFIED');
  const documentsOk = documents.every((d) => !d.isRequired || d.status === 'VERIFIED');
  return {
    status: 'VERIFIED',
    canGoOnline: photosOk && documentsOk,
    requiredDocuments: documents,
    vehicle: {
      status: 'VERIFIED',
      rejectionReason: null,
      photos: mockPhotos.map((p) => ({ ...p })),
    },
    rejectionReason: null,
    suspensionReason: null,
  };
}

const mockVehicle: CaptainVehicle = {
  id: 'dev-vehicle',
  type: 'CAR',
  make: 'تويوتا',
  model: 'كورولا',
  year: 2022,
  color: 'أبيض',
  plateNumber: 'أ ب ج 1234',
  isActive: true,
  verificationStatus: 'VERIFIED',
  rejectionReason: null,
};

// ---------------- API ----------------
export function getCaptainProfile() {
  if (__DEV__) return Promise.resolve(mockProfile);
  return request<CaptainProfile>({ method: 'GET', url: '/captain/profile' });
}

export function updateCaptainProfile(data: UpdateCaptainProfileInput) {
  if (__DEV__) {
    mockProfile = {
      ...mockProfile,
      user: {
        ...mockProfile.user,
        fullName: data.fullName,
        email: data.email ?? null,
        avatarUrl: data.avatarUrl ?? mockProfile.user.avatarUrl,
      },
      dateOfBirth: data.dateOfBirth ?? null,
      gender: data.gender ?? mockProfile.gender,
    };
    return Promise.resolve(mockProfile);
  }
  return request<CaptainProfile>({ method: 'PATCH', url: '/captain/profile', data });
}

export function getCaptainVerification() {
  if (__DEV__) return Promise.resolve(buildMockVerification());
  return request<CaptainVerification>({ method: 'GET', url: '/captain/verification' });
}

export function getCaptainVehicle() {
  if (__DEV__) return Promise.resolve(mockVehicle);
  return request<CaptainVehicle>({ method: 'GET', url: '/captain/vehicle' });
}

/**
 * REPLACES `resubmitCaptainDocument`. Submits a new document or a renewal; a renewal is
 * allowed while the current document is still VERIFIED. Contract: POST /captain/documents.
 */
export function submitCaptainDocument(input: SubmitCaptainDocumentInput) {
  if (__DEV__) {
    const doc = mockDocuments.find((d) => d.type === input.documentType);
    if (doc) {
      doc.open = 'UNDER_REVIEW';
      doc.rejected = null;
      doc.submittedAt = new Date().toISOString();
      if (!doc.hasActive && input.expiresAt) doc.expiresAt = input.expiresAt;
    }
    return Promise.resolve();
  }
  return request<void>({ method: 'POST', url: '/captain/documents', data: input });
}

/** NEW. Replaces one vehicle photo and resets its review. Contract: POST /captain/vehicle/photos. */
export function submitVehiclePhoto(input: SubmitVehiclePhotoInput) {
  if (__DEV__) {
    const photo = mockPhotos.find((p) => p.type === input.photoType);
    if (photo) {
      photo.status = 'UNDER_REVIEW';
      photo.rejectionReason = null;
    }
    return Promise.resolve();
  }
  return request<void>({ method: 'POST', url: '/captain/vehicle/photos', data: input });
}
