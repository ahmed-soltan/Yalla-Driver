import { useMutation } from '@tanstack/react-query';

import { completeCaptainProfile } from '@/entities/user/api/user-api';

export function useCompleteCaptainProfile() {
  return useMutation({
    mutationFn: completeCaptainProfile,
  });
}
