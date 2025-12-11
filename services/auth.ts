import { supabase } from "./supabase";

// Build a single SITE_URL that works in dev (localhost) and prod (Vercel).
// If an env var is set to localhost but we are running on a non-localhost origin (e.g., production),
// prefer the runtime origin to avoid redirecting to localhost.
const runtimeOrigin =
  typeof window !== "undefined" ? window.location.origin : undefined;
const envSiteUrl =
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : undefined) ??
  (typeof import.meta !== "undefined" ? (import.meta as any)?.env?.VITE_SITE_URL : undefined);

// Prefer the current origin (where the user actually is); fall back to env, then localhost.
export const SITE_URL = runtimeOrigin ?? envSiteUrl ?? "http://localhost:3000";

/**
 * Trigger Google OAuth flow via Supabase.
 * Redirects back to the client-side callback route.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  // Redirect back into the app (auth callback). Using baseUrl keeps localhost in dev and Vercel URL in prod.
  // HashRouter expects the callback route after #/. Supabase will append tokens after this hash.
  const redirectTo = `${SITE_URL}/#/auth/callback`;
  console.log("Initiating Google OAuth with redirectTo:", redirectTo);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    console.error("Google sign-in failed:", error);
    throw error;
  }
}

/**
 * Sign the current user out.
 */
export async function signOut(): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.auth.signOut({ scope: "local" });
  const storageKey = (supabase as any)?.auth?.storageKey;
  if (storageKey) {
    localStorage.removeItem(storageKey);
  }
  if (error) {
    console.error("Sign out failed:", error);
    throw error;
  }
}

/**
 * Fetch the current authenticated user (if any).
 */
export async function getCurrentUser() {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Get user failed:", error);
    throw error;
  }
  return data.user;
}
