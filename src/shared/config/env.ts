import Constants from 'expo-constants';

/**
 * Central place to read environment/runtime config.
 *
 * For real secrets/URLs, wire these up via `app.config.ts` `extra` fields
 * (per environment) and EAS `env` vars. Kept as simple placeholders here so
 * the app boots out of the box; replace with your real API base URL.
 */
type Extra = {
  apiBaseUrl?: string;
  versionCheckPath?: string;
  environment?: 'development' | 'staging' | 'production';
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const env = {
  apiBaseUrl: extra.apiBaseUrl ?? 'https://api.nabrahq.com/api/student',
  versionCheckPath: extra.versionCheckPath ?? '/app/version',
  environment: extra.environment ?? (__DEV__ ? 'development' : 'production'),
  appDomain: Constants.expoConfig?.extra?.appDomain ?? 'students.nabrahq.com',
  protocol: Constants.expoConfig?.extra?.protocol ?? 'https',
} as const;
