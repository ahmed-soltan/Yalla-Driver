import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getCaptainProfile,
  updateCaptainProfile,
} from '@/entities/captain/api/captain-api';
import { queryKeys } from '@/shared/api/query-client';

export function useCaptainProfile() {
  return useQuery({ queryKey: queryKeys.captain.profile, queryFn: getCaptainProfile });
}

export function useUpdateCaptainProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCaptainProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.captain.profile, profile);
    },
  });
}
