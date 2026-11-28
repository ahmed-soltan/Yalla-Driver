// src/app-shell/captain-runtime.tsx
// Render ONCE inside app/(app)/_layout.tsx. Everything here must outlive any single screen.
import { CaptainLocationBridge } from './captain-location-bridge';
import { OrderHubBridge } from './order-hub-bridge';
import { PushBridge } from './push-bridge';

export function CaptainRuntime() {
  return (
    <>
      <OrderHubBridge />
      <CaptainLocationBridge />
      <PushBridge />
    </>
  );
}