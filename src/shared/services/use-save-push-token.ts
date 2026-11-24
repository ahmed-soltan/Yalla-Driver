import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useSavePushToken() {
  const mutation = useMutation({
    mutationFn: async ({ token, platform }: { token: string; platform: string }) => {
      const response = await apiClient.post('/push-tokens', {
        token,
        platform,
      });
      return response.data;
    },
  });

  return mutation;
}
