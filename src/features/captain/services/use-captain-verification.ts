import { useQuery } from '@tanstack/react-query';

import { getCaptainVerification } from '@/entities/captain/api/captain-api';
import { queryKeys } from '@/shared/api/query-client';

export function useCaptainVerification() {
  return useQuery({
    queryKey: queryKeys.captain.verification,
    queryFn: getCaptainVerification,
  });
}
