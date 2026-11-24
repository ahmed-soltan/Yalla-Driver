import { AxiosRequestConfig, create, isAxiosError } from 'axios';

import { env } from '@shared/config/env';
import { secureStorage, storageKeys } from '@shared/lib/storage';

export const apiClient = create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const filesApiClient = create({
  baseURL: 'https://api.yalla.it/api', // <-- the different base URL
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  },
});

type AuthRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _skipAuth?: boolean;
};

type RefreshedTokens = {
  accessToken: string;
  refreshToken: string;
};

let refreshPromise: Promise<RefreshedTokens | null> | null = null;
let onAuthSessionExpired: (() => void) | undefined;

export function registerAuthSessionExpiredHandler(handler: () => void) {
  onAuthSessionExpired = handler;
}

/**
 * Normalized error shape that the rest of the application can rely on.
 */
export type ApiError = {
  status: number | null;
  message: string;
  code?: string;
};

/**
 * Convert Axios/backend errors into a predictable application error.
 */
export function toApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const err = error;

    return {
      status: err.response?.status ?? null,
      message:
        err.response?.data?.error ??
        err.response?.data?.message ??
        err.message ??
        'Something went wrong',
      code: err.response?.data?.code,
    };
  }

  if (error instanceof Error) {
    return {
      status: null,
      message: error.message,
    };
  }

  return {
    status: null,
    message: 'Something went wrong',
  };
}

/**
 * Request interceptor.
 *
 * Attach the persisted access token to every API request.
 */
apiClient.interceptors.request.use(async (config) => {
  if ((config as AuthRequestConfig)._skipAuth) return config;

  const accessToken = await secureStorage.get(storageKeys.accessToken);

  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
/**
 * Response interceptor.
 *
 * Do not perform navigation here.
 * A 401 is handled by the auth/navigation layer.
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const original = error.config as AuthRequestConfig | undefined;
    const refreshToken = await secureStorage.get(storageKeys.refreshToken);
    if (
      error.response?.status === 401 &&
      refreshToken &&
      original &&
      !original._skipAuth &&
      !original._retry
    ) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = apiClient
          .post<RefreshedTokens>('/auth/refresh', { refreshToken }, {
            _skipAuth: true,
          } as AuthRequestConfig)
          .then(async ({ data }) => {
            await Promise.all([
              secureStorage.set(storageKeys.accessToken, data.accessToken),
              secureStorage.set(storageKeys.refreshToken, data.refreshToken),
            ]);
            return data;
          })
          .catch(async () => {
            await Promise.all([
              secureStorage.remove(storageKeys.accessToken),
              secureStorage.remove(storageKeys.refreshToken),
            ]);
            onAuthSessionExpired?.();
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const tokens = await refreshPromise;
      if (tokens) return apiClient(original);
    }

    return Promise.reject(error);
  }
);

/**
 * Typed request helper.
 */
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient({
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  return response.data as T;
};

/**
 * Error handling wrapper.
 */
export const withErrorHandling = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise;
  } catch (error: unknown) {
    throw toApiError(error);
  }
};

export const request = <T>(config: Parameters<typeof apiRequest>[0]) =>
  withErrorHandling(apiRequest<T>(config));

export default apiClient;
