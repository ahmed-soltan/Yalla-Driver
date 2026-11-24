// src/features/profile/model/use-captain-profile.ts
// Captain API is the source of truth for profile, verification, vehicle, and document data.
import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  getCaptainProfile,
  getCaptainVerification,
  getCaptainVehicle,
  submitCaptainDocument,
  submitVehiclePhoto,
  updateCaptainProfile,
} from '@/entities/captain/api/captain-api';
import type {
  SubmitCaptainDocumentInput,
  SubmitVehiclePhotoInput,
  UpdateCaptainProfileInput,
} from '@/entities/captain/model/captain-types';
// ASSUMPTION: same session module as the hub and chat sockets. It must wipe the stored tokens.
import { authHref } from '@/shared/lib/routes';
import { captainKeys } from '@/entities/captain/model/captain-query-keys';
import { setAvailability } from '@/entities/home/api/home-api';
import { useAuthStore } from '@/shared/hooks/auth-store';

export const useProfile = () =>
  useQuery({ queryKey: captainKeys.profile, queryFn: getCaptainProfile });
export const useVerification = () =>
  useQuery({ queryKey: captainKeys.verification, queryFn: getCaptainVerification });
export const useVehicle = () =>
  useQuery({ queryKey: captainKeys.vehicle, queryFn: getCaptainVehicle });

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCaptainProfileInput) => updateCaptainProfile(input),
    onSuccess: () => client.invalidateQueries({ queryKey: captainKeys.profile }),
  });
}

/** Submit a new document or a renewal (works even while the current one is VERIFIED). */
export function useSubmitDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitCaptainDocumentInput) => submitCaptainDocument(input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: captainKeys.verification });
      client.invalidateQueries({ queryKey: captainKeys.profile });
    },
  });
}

export function useSubmitVehiclePhoto() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitVehiclePhotoInput) => submitVehiclePhoto(input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: captainKeys.verification });
      client.invalidateQueries({ queryKey: captainKeys.vehicle });
    },
  });
}

/** Goes offline (best effort), clears the session and all cached data, then leaves the app area. */
export function useLogout() {
  const client = useQueryClient();
  const signOut = useAuthStore((s) => s.signOut);
  return useCallback(async () => {
    try {
      await setAvailability(false);
    } catch {
      // The server will time the captain out; do not block logout on it.
    }
    await signOut();
    client.clear();
    router.replace(authHref);
  }, [client, signOut]);
}
