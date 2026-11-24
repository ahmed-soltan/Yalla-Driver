import { useQuery } from '@tanstack/react-query';

import { getCaptainVehicle } from '@/entities/captain/api/captain-api';
import { queryKeys } from '@/shared/api/query-client';

export function useCaptainVehicle() {
  return useQuery({ queryKey: queryKeys.captain.vehicle, queryFn: getCaptainVehicle });
}
