/** Wallistan custom PHP backend config (server-side only). */

export type WallistanConfig = {
  apiUrl: string;
};

export function getWallistanConfig(): WallistanConfig | null {
  // Server-side: read from process.env
  const url =
    (typeof process !== "undefined" && process.env?.STORE_API_URL?.trim()) || "";
  if (!url) return null;
  return { apiUrl: url.replace(/\/$/, "") };
}

/** Client-side: build-time flag. Server-side: full config present. */
export function isWallistanEnabled(): boolean {
  if (typeof window === "undefined") return getWallistanConfig() !== null;
  return import.meta.env.VITE_STORE_ENABLED === "true";
}
