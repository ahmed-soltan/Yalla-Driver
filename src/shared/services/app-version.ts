import Constants from 'expo-constants';

import { apiRequest } from '@shared/api/client';
import { env } from '@shared/config/env';

export type AppVersionInfo = {
  latestVersion: string;
  minimumVersion: string;
  downloadUrl: string;
};

export type VersionUpdateState =
  | { status: 'up-to-date'; currentVersion: string }
  | { status: 'optional'; currentVersion: string; info: AppVersionInfo }
  | { status: 'mandatory'; currentVersion: string; info: AppVersionInfo };

let versionCheckPromise: Promise<VersionUpdateState> | null = null;

const mockVersionInfo: AppVersionInfo = {
  latestVersion: '1.0.0',
  minimumVersion: '1.0.0',
  downloadUrl:
    'https://expo.dev/artifacts/eas/Zjf9eZptB9OlWdWNBfg9ZR4t-lya9-5qKGi0aW32igI.apk',
};

function parseVersion(version: string) {
  const match = version
    .trim()
    .replace(/^v/i, '')
    .match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

export function compareVersions(left: string, right: string) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  if (!leftParts || !rightParts) {
    return null;
  }

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] > rightParts[index] ? 1 : -1;
    }
  }

  return 0;
}

function isValidVersionInfo(value: unknown): value is AppVersionInfo {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.latestVersion === 'string' &&
    typeof response.minimumVersion === 'string' &&
    typeof response.downloadUrl === 'string' &&
    response.downloadUrl.startsWith('https://') &&
    compareVersions(response.minimumVersion, response.latestVersion) !== null &&
    compareVersions(response.minimumVersion, response.latestVersion)! <= 0
  );
}

function getInstalledVersion() {
  const version = Constants.nativeAppVersion ?? Constants.expoConfig?.version;

  if (!version) {
    throw new Error('Installed app version is unavailable');
  }

  return version;
}

export function checkForAppUpdate(): Promise<VersionUpdateState> {
  if (versionCheckPromise) {
    return versionCheckPromise;
  }

  versionCheckPromise = (async () => {
    const currentVersion = getInstalledVersion();
    const info = __DEV__
      ? mockVersionInfo
      : await apiRequest<unknown>({
          method: 'GET',
          url: env.versionCheckPath,
          params: { platform: 'android', environment: env.environment },
        });

    if (!isValidVersionInfo(info)) {
      throw new Error('Invalid app version response');
    }

    const currentToLatest = compareVersions(currentVersion, info.latestVersion);
    const currentToMinimum = compareVersions(
      currentVersion,
      info.minimumVersion
    );

    if (
      currentToLatest === null ||
      currentToMinimum === null ||
      currentToLatest >= 0
    ) {
      return { status: 'up-to-date', currentVersion };
    }

    return currentToMinimum < 0
      ? { status: 'mandatory', currentVersion, info }
      : { status: 'optional', currentVersion, info };
  })();

  return versionCheckPromise;
}
