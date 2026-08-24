/**
 * @tolt/tracking
 *
 * A typed wrapper around tolt.js, the browser script that records partner
 * clicks and turns them into customers. This package injects the script for
 * you and gives you typed access to the data and the signup call.
 */

const DEFAULT_SCRIPT_URL = "https://cdn.tolt.io/tolt.js";

/** The current referred visit, exposed by tolt.js on `window.tolt_data`. */
export type ToltData = {
  /** Unique id for this click. */
  click_id: string;
  /** The partner whose link was followed. */
  partner_id: string;
  /** The program the link belongs to. */
  program_id: string;
  /** Days the referral is remembered (your program's cookie window). */
  cookie_duration: number;
  /** Set once the visitor is signed up with {@link signup}; `null` before that. */
  customer_id: string | null;
};

/** What {@link signup} resolves to. */
export type ToltSignupResult = {
  click_id: string;
  customer_id: string;
  customer_identifier: string;
  partner_id: string;
  program_id: string;
  message: string;
};

declare global {
  interface Window {
    tolt_data?: ToltData | null;
    tolt?: {
      signup: (identifier: string) => Promise<ToltSignupResult>;
    };
  }
}

export type InitOptions = {
  /** Your public organization key (Settings -> Integrations). Safe for the browser. */
  publicKey: string;
  /** Override the script URL. Defaults to `https://cdn.tolt.io/tolt.js`. */
  scriptUrl?: string;
};

let loadPromise: Promise<void> | null = null;

/**
 * Inject the tolt.js script. Safe to call more than once (and a no-op on the
 * server); the script is only added the first time. Resolves once it has loaded.
 */
export function init(options: InitOptions): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (loadPromise) return loadPromise;

  const src = options.scriptUrl ?? DEFAULT_SCRIPT_URL;

  if (window.tolt || document.querySelector(`script[data-tolt-loaded="true"]`)) {
    loadPromise = Promise.resolve();
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-tolt", options.publicKey);
    script.setAttribute("data-tolt-loaded", "true");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Failed to load tolt.js")));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** The current referred visit, or `null` if this visit didn't come from a partner link. */
export function getData(): ToltData | null {
  if (typeof window === "undefined") return null;
  return window.tolt_data ?? null;
}

/** Whether this visit came from a partner link. */
export function isReferred(): boolean {
  return getData() !== null;
}

/**
 * Convert the referred visitor into a customer. Pass an identifier that is
 * stable for this user (their id or email), and use the same value when you
 * report their payments. Throws if tolt.js has not loaded yet.
 */
export function signup(identifier: string): Promise<ToltSignupResult> {
  if (typeof window === "undefined" || !window.tolt) {
    return Promise.reject(
      new Error("tolt.js is not loaded yet. Call init() (or render <ToltTracking />) first."),
    );
  }
  return window.tolt.signup(identifier);
}
