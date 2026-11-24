// src/features/home/model/use-captain-home.ts
// Captain API is the source of truth for profile and verification data.
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCaptainProfile, getCaptainVerification } from '@/entities/captain/api/captain-api';
import type { CaptainProfile } from '@/entities/captain/model/captain-types';
import { getDocumentWarnings } from '@/entities/captain/lib/captain-alerts';
import { getGoOnlineBlockers } from '../model/go-online-blockers';
import { getTodaySummary, setAvailability } from '@/entities/home/api/home-api';
import { captainKeys } from '@/entities/captain/model/captain-query-keys';

const PROFILE_KEY = captainKeys.profile;
const VERIFICATION_KEY = captainKeys.verification;
const TODAY_KEY = captainKeys.today;

export function useCaptainHome() {
  const profile = useQuery({ queryKey: PROFILE_KEY, queryFn: getCaptainProfile });
  const verification = useQuery({
    queryKey: VERIFICATION_KEY,
    queryFn: getCaptainVerification,
  });
  const today = useQuery({ queryKey: TODAY_KEY, queryFn: getTodaySummary });

  const blockers = useMemo(
    () => (verification.data ? getGoOnlineBlockers(verification.data) : []),
    [verification.data]
  );

  // Valid documents that are close to expiry (not blockers)
  const warnings = useMemo(
    () => (verification.data ? getDocumentWarnings(verification.data) : []),
    [verification.data]
  );

  // Profile and verification are required. "Today" failing should not block Home.
  const summary =
    profile.data && verification.data
      ? {
          today: {
            earningsPiastres: today.data?.earningsPiastres ?? 0,
            goalPiastres: today.data?.goalPiastres ?? 0,
            trips: today.data?.trips ?? 0,
            rating: profile.data.rating > 0 ? profile.data.rating : null,
          },
          demandHint: today.data?.demandHint ?? null,
        }
      : undefined;

  return {
    summary,
    blockers,
    warnings,
    isOnline: profile.data?.availabilityStatus === 'ONLINE',
    isLoading: profile.isLoading || verification.isLoading,
    isError: profile.isError || verification.isError,
    refetch: () => Promise.all([profile.refetch(), verification.refetch(), today.refetch()]),
  };
}

export type CaptainHomeSummary = NonNullable<ReturnType<typeof useCaptainHome>['summary']>;

/** The server decides. We only copy its answer into the profile cache. */
export function useSetAvailability() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (online: boolean) => setAvailability(online),
    onSuccess: ({ isOnline }) => {
      client.setQueryData<CaptainProfile>(PROFILE_KEY, (old) =>
        old ? { ...old, availabilityStatus: isOnline ? 'ONLINE' : 'OFFLINE' } : old
      );
      client.invalidateQueries({ queryKey: PROFILE_KEY });
      client.invalidateQueries({ queryKey: VERIFICATION_KEY });
    },
  });
}

/** Light read of just the online flag (shares the cached profile query). */
export function useCaptainOnline() {
  const profile = useQuery({ queryKey: PROFILE_KEY, queryFn: getCaptainProfile });
  return profile.data?.availabilityStatus === 'ONLINE';
}
