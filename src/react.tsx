import { useCallback, useEffect, useState } from "react";
import {
  getData,
  init,
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
  /** Whether tolt.js has finished loading. */
  ready: boolean;
  /** Convert the referred visitor into a customer. */
  signup: (identifier: string) => Promise<ToltSignupResult>;
};

/**
 * Access the live tracking data and the signup call from a component.
 *
 * ```tsx
 * const { data, signup } = useTolt();
 * // on your signup handler:
 * if (data && !data.customer_id) await signup(user.id);
 * ```
 */
export function useTolt(): UseTolt {
  const [data, setData] = useState<ToltData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      if (cancelled) return;
      if (typeof window !== "undefined" && window.tolt) {
        setReady(true);
        setData(getData());
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
