import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitCaptainDocument } from '@/entities/captain/api/captain-api';
import type { SubmitCaptainDocumentInput } from '@/entities/captain/model/captain-types';
import { queryKeys } from '@/shared/api/query-client';

export function useResubmitCaptainDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitCaptainDocumentInput) => submitCaptainDocument(input),
    onSuccess: (verification) => {
      queryClient.setQueryData(queryKeys.captain.verification, verification);
    },
  });
}
