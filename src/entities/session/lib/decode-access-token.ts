import type { AccessPayload } from "./types";

/**
 * Decodes the payload part of a JWT without verifying the signature.
 * Signature validation is always done server-side; this is only for
 * client-side routing decisions (next auth step, user data display).
 *
 * Returns null if the token is malformed or cannot be parsed.
 */
export function decodeAccessToken(token: string): AccessPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as AccessPayload;
  } catch {
    return null;
  }
}
