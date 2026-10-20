import { useCallback, useEffect, useState } from "react";
import {
  getData,
  init,
  ready as whenReady,
  signup as vanillaSignup,
  type InitOptions,
  type ToltData,
  type ToltSignupResult,
} from "./index";

export type ToltTrackingProps = InitOptions;

/**
 * Drop this once near the root of your app to load tolt.js. Renders nothing.
 *
 * ```tsx
 * <ToltTracking publicKey="YOUR_PUBLIC_ORG_KEY" />
 * ```
 */
export function ToltTracking({ publicKey, scriptUrl }: ToltTrackingProps): null {
  useEffect(() => {
    init({ publicKey, scriptUrl }).catch((error) => {
      console.error("[@tolt/tracking]", error);
    });
  }, [publicKey, scriptUrl]);

  return null;
}

export type UseTolt = {
  /** The current referred visit, or `null` if not referred. */
  data: ToltData | null;
  /** Whether tolt.js has loaded and recorded this visit's click. Until then `data` is `null`. */
  ready: boolean;
  /** Convert the referred visitor into a customer. */
  signup: (identifier: string) => Promise<ToltSignupResult>;
};

/**
 * Access the live tracking data and the signup call from a component.
 *
 * ```tsx
 * const { ready, signup } = useTolt();
 * // after your own signup succeeds, once `ready` is true:
 * const result = await signup(user.id);
 * if (result?.customer_id) saveToltCustomerId(result.customer_id);
 * ```
 */
export function useTolt(): UseTolt {
  const [data, setData] = useState<ToltData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // window.tolt exists as soon as the script runs, but the click is recorded
    // asynchronously; wait for it so `data` isn't null on the landing page.
    const poll = () => {
      if (cancelled) return;
      if (typeof window !== "undefined" && window.tolt) {
        whenReady().catch(() => null).then((tracking) => {
          if (cancelled) return;
          setData(tracking ?? getData());
          setReady(true);
        });
        return;
      }
      window.setTimeout(poll, 300);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (identifier: string) => {
    const result = await vanillaSignup(identifier);
    setData(getData());
    return result;
  }, []);

  return { data, ready, signup };
}
