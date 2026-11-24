import { useMutation } from '@tanstack/react-query';

import { verifyLoginOtp, verifySignupOtp } from '@/entities/user/api/user-api';

export function useVerifyOtp(mode: 'signup' | 'login') {
  return useMutation({
    mutationFn: mode === 'login' ? verifyLoginOtp : verifySignupOtp,
  });
}
