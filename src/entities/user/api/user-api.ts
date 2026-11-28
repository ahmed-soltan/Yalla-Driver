import { apiRequest, withErrorHandling } from '@/shared/api/client';
import type { AuthTokens, CaptainUser, RefreshedAuthTokens } from '../model/types';

type OtpRequest = { verificationId: string; expiresAt?: string };

const mockVerificationId = 'dev-verification-id';
const mockAccessToken = 'dev-access-token';
const mockRefreshToken = 'dev-refresh-token';

let mockUser: CaptainUser = {
  id: 1,
  phoneNumber: '01028114679',
  fullName: 'Ahmed Sultan',
  email: 'ahmed.sultan@example.com',
  avatarUrl: null,
  dateOfBirth: '2004-02-21',
  gender: 'MALE',
  role: 'CAPTAIN',
};

const request = <T>(config: Parameters<typeof apiRequest>[0]) =>
  withErrorHandling(apiRequest<T>(config));

export function requestSignupOtp(phoneNumber: string) {
  if (__DEV__) {
    mockUser = {
      ...mockUser,
      phoneNumber,
      fullName: null,
      email: null,
      avatarUrl: null,
      dateOfBirth: null,
      gender: null,
    };
    return Promise.resolve<OtpRequest>({ verificationId: mockVerificationId });
  }

  return request<OtpRequest>({
    method: 'POST',
    url: '/auth/signup/request-otp',
    data: { phoneNumber, accountType: 'PASSENGER' },
  });
}

export function requestLoginOtp(phoneNumber: string) {
  if (__DEV__) {
    mockUser = {
      ...mockUser,
      phoneNumber,
      fullName: mockUser.fullName ?? 'مستخدم تجريبي',
    };
    return Promise.resolve<OtpRequest>({ verificationId: mockVerificationId });
  }

  return request<OtpRequest>({
    method: 'POST',
    url: '/auth/login/request-otp',
    data: { phoneNumber, accountType: 'PASSENGER' },
  });
}

export function verifySignupOtp(input: { phoneNumber: string; code: string }) {
  if (__DEV__) {
    return Promise.resolve<AuthTokens>({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      requiresProfileCompletion: mockUser.fullName === null,
      user: mockUser,
    });
  }

  return request<AuthTokens>({
    method: 'POST',
    url: '/auth/signup/verify-otp',
    data: { ...input, accountType: 'PASSENGER' },
  });
}

export function verifyLoginOtp(input: { phoneNumber: string; code: string }) {
  if (__DEV__) {
    return Promise.resolve<AuthTokens>({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      requiresProfileCompletion: false,
      user: mockUser,
    });
  }

  return request<AuthTokens>({
    method: 'POST',
    url: '/auth/login/verify-otp',
    data: { ...input, accountType: 'PASSENGER' },
  });
}

export function fetchCurrentUser() {
  if (__DEV__) {
    return Promise.resolve(mockUser);
  }

  return request<CaptainUser>({ method: 'GET', url: '/auth/me' });
}

export function completeCaptainProfile(data: {
  fullName: string;
  email?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender: 'MALE' | 'FEMALE';
  vehicle: {
    type: 'CAR' | 'MOTORCYCLE' | 'SCOOTER' | 'BICYCLE';
    make: string;
    model: string | null;
    year: number | null;
    color: string | null;
    plateNumber: string | null;
  };
  vehiclePhotos: {
    photoType: 'FRONT' | 'SIDE' | 'REAR';
    fileUploadId: string;
  }[];
  documents: {
    documentType:
      | 'NATIONAL_ID'
      | 'DRIVING_LICENSE'
      | 'VEHICLE_REGISTRATION'
      | 'VEHICLE_INSURANCE'
      | 'PROFILE_PHOTO';
    documentNumber?: string;
    issuedAt?: string;
    expiresAt?: string;
    files: {
      side: 'FRONT' | 'BACK' | 'SINGLE';
      fileUploadId: string;
    }[];
  }[];
}) {
  if (__DEV__) {
    mockUser = {
      ...mockUser,
      fullName: data.fullName,
      email: data.email ?? null,
      avatarUrl: data.avatarUrl ?? null,
      dateOfBirth: data.dateOfBirth ?? null,
      gender: data.gender,
    };
    return Promise.resolve(mockUser);
  }

  return request<CaptainUser>({ method: 'POST', url: '/auth/complete-profile', data });
}

export function refreshAuthTokens(refreshToken: string) {
  if (__DEV__) {
    return Promise.resolve<RefreshedAuthTokens>({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    });
  }

  return request<RefreshedAuthTokens>({
    method: 'POST',
    url: '/auth/refresh',
    data: { refreshToken, accountType: 'PASSENGER' },
  });
}

export function logout(refreshToken: string) {
  if (__DEV__) {
    return Promise.resolve();
  }

  return request<void>({
    method: 'POST',
    url: '/auth/logout',
    data: { refreshToken },
  });
}
