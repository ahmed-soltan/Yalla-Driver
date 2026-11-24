import { useCallback, useRef, useState } from 'react';

import Toast from 'react-native-toast-message';

import { UploadStatus } from '../types/file-types';
import { validateFile } from '../lib/file-upload';
import { NativeFile } from '../ui/file-upload/file-uploader';
import { secureStorage, storageKeys } from '../lib/storage';
import { filesApiClient } from '../api/client';

interface UploadResponse {
  fileId: string;
  fileType: string;
  url: string;
  originalName: string;
  size: number;
}

interface UseUploadOptions {
  maxSizeBytes?: number;
  accept?: string;
  maxRetries?: number;
  uploadEndpoint?: string;
  folder?: string;
  name?: string;
  embedding?: {
    enabled: boolean;
  };
  token?: string;
}

interface UseUploadReturn {
  uploadFile: (file: NativeFile) => Promise<{ fileId: string; url: string; fileName: string }>;
  progress: number;
  status: UploadStatus;
  error: Error | null;
  cancel: () => void;
  reset: () => void;
}

async function uploadFileToBackend(
  file: NativeFile,
  endpoint: string,
  options: {
    folder?: string;
    name?: string;
    embedding?: { enabled: boolean };
  },
  setProgress: (progress: number) => void,
  abortSignal?: AbortSignal
): Promise<UploadResponse> {
  const formData = new FormData();

  formData.append('File', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as any);

  if (options.folder) {
    formData.append('Folder', options.folder);
  }

  if (options.name) {
    formData.append('Name', options.name);
  }

  if (options.embedding) {
    formData.append('Embedding.Enabled', String(options.embedding.enabled));
  }

  const accessToken = await secureStorage.get(storageKeys.accessToken);

  // Dedicated instance with its own baseURL — separate from the shared apiClient.
  const response = await filesApiClient.post<UploadResponse>(endpoint, formData, {
    signal: abortSignal,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (!event.total) return;

      const percent = Math.round((event.loaded * 100) / event.total);

      setProgress(percent);
    },
  });

  const data = response.data;

  if (!data) {
    Toast.show({
      type: 'error',
      text1: 'خطأ في رفع الملف',
      text2: 'فشل في رفع الملف. يرجى المحاولة مرة أخرى.',
    });

    throw new Error('فشل في رفع الملف');
  }

  return data;
}

export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
  const {
    maxSizeBytes,
    accept,
    maxRetries = 3,
    uploadEndpoint = '/files/upload',
    folder,
    name,
    embedding,
  } = options;

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(
    async (
      file: NativeFile
    ): Promise<{
      fileId: string;
      url: string;
      fileName: string;
    }> => {
      setProgress(0);
      setStatus('uploading');
      setError(null);

      abortControllerRef.current = new AbortController();

      const { signal } = abortControllerRef.current;

      const validation = validateFile(file, {
        maxSizeBytes,
        accept,
      });

      if (!validation.valid) {
        const err = new Error(validation.error);

        setError(err);
        setStatus('failed');

        throw err;
      }

      if (__DEV__) {
        setProgress(100);
        setStatus('ready');

        return {
          fileId: `dev-file-${Date.now()}`,
          url: file.uri,
          fileName: file.name,
        };
      }

      let lastError: Error | null = null;
      let retryCount = 0;

      while (retryCount <= maxRetries) {
        try {
          if (signal.aborted) {
            throw new Error('تم إلغاء الرفع');
          }

          const response = await uploadFileToBackend(
            file,
            uploadEndpoint,
            {
              folder,
              name,
              embedding,
            },
            setProgress,
            signal
          );

          setProgress(100);
          setStatus('ready');

          return {
            fileId: response.fileId,
            url: response.url,
            fileName: response.originalName,
          };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('حدث خطأ غير متوقع');

          if (signal.aborted || lastError.message === 'تم إلغاء الرفع') {
            setStatus('failed');
            setError(lastError);

            throw lastError;
          }

          retryCount++;

          if (retryCount <= maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));

            setProgress(0);
          }
        }
      }

      setStatus('failed');
      setError(lastError);

      throw lastError ?? new Error('فشل رفع الملف');
    },
    [maxSizeBytes, accept, maxRetries, uploadEndpoint, folder, name, embedding]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setStatus('idle');
    setProgress(0);
  }, []);

  const reset = useCallback(() => {
    cancel();
    setError(null);
  }, [cancel]);

  return {
    uploadFile,
    progress,
    status,
    error,
    cancel,
    reset,
  };
}
