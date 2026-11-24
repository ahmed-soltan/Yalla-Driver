import type { VehicleType } from './vehicle-types';

import type {
  CaptainDocumentType,
  DocumentFileSide,
} from '@/entities/captain/model/captain-types';

export type VehicleDocument = CaptainDocumentType;

export type DocumentRequirement = {
  documentType: VehicleDocument;
  isRequired: boolean;
  requiresExpiryDate: boolean;
  requiresBackSide: boolean;
};

export type DocumentUploadKey = `${VehicleDocument}_${DocumentFileSide}`;

export const vehicleDocumentLabels: Record<VehicleDocument, string> = {
  NATIONAL_ID: 'بطاقة الرقم القومي',
  DRIVING_LICENSE: 'رخصة القيادة',
  VEHICLE_REGISTRATION: 'رخصة المركبة',
  VEHICLE_INSURANCE: 'تأمين المركبة',
  PROFILE_PHOTO: 'الصورة الشخصية',
};

export const vehicleDocumentRequirements: Record<VehicleType, DocumentRequirement[]> = {
  CAR: [
    { documentType: 'NATIONAL_ID', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'DRIVING_LICENSE', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'VEHICLE_REGISTRATION', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'VEHICLE_INSURANCE', isRequired: true, requiresExpiryDate: true, requiresBackSide: false },
    { documentType: 'PROFILE_PHOTO', isRequired: true, requiresExpiryDate: false, requiresBackSide: false },
  ],
  MOTORCYCLE: [
    { documentType: 'NATIONAL_ID', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'DRIVING_LICENSE', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'VEHICLE_REGISTRATION', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'VEHICLE_INSURANCE', isRequired: false, requiresExpiryDate: true, requiresBackSide: false },
    { documentType: 'PROFILE_PHOTO', isRequired: true, requiresExpiryDate: false, requiresBackSide: false },
  ],
  SCOOTER: [
    { documentType: 'NATIONAL_ID', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'DRIVING_LICENSE', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'VEHICLE_REGISTRATION', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'VEHICLE_INSURANCE', isRequired: false, requiresExpiryDate: true, requiresBackSide: false },
    { documentType: 'PROFILE_PHOTO', isRequired: true, requiresExpiryDate: false, requiresBackSide: false },
  ],
  BICYCLE: [
    { documentType: 'NATIONAL_ID', isRequired: true, requiresExpiryDate: true, requiresBackSide: true },
    { documentType: 'PROFILE_PHOTO', isRequired: true, requiresExpiryDate: false, requiresBackSide: false },
  ],
};
