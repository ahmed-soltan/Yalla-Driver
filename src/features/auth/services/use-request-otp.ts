import { useMutation } from '@tanstack/react-query';

import { requestLoginOtp, requestSignupOtp } from '@/entities/user/api/user-api';

export function useRequestOtp(mode: 'signup' | 'login') {
  return useMutation({
    mutationFn: mode === 'login' ? requestLoginOtp : requestSignupOtp,
  });
}
