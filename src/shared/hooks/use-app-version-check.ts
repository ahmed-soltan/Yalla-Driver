import { useEffect, useState } from 'react';

import {
  checkForAppUpdate,
  type VersionUpdateState,
} from '@shared/services/app-version';

export function useAppVersionCheck(isAppReady: boolean) {
  const [updateState, setUpdateState] = useState<VersionUpdateState | null>(
    null
  );

  useEffect(() => {
    if (!isAppReady) {
      return;
    }

    let isMounted = true;

    checkForAppUpdate()
      .then((result) => {
        if (isMounted) {
          setUpdateState(result);
        }
      })
      .catch(() => {
        // Version checks are advisory. Network or server failures must fail open.
      });

    return () => {
      isMounted = false;
    };
  }, [isAppReady]);

  return updateState;
}
