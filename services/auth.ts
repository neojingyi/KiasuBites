import { supabase } from "./supabase";

// Build a redirect base that works in dev (localhost) and production (e.g. Vercel).
// Prefers NEXT_PUBLIC_SITE_URL but falls back to the current origin in-browser.
const baseUrl =
  // Next.js-style env var for deployed + local environments
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : undefined) ??
  // Vite-style env var if present
  (import.meta as any)?.env?.VITE_SITE_URL ??
  // Fallback to the current origin when running in the browser
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

/**
 * Trigger Google OAuth flow via Supabase.
 * Redirects back to the client-side callback route.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  // Redirect back into the app (auth callback). Using baseUrl keeps localhost in dev and Vercel URL in prod.
  // HashRouter expects the callback route after #/. Supabase will append tokens after this hash.
  const redirectTo = `${baseUrl}/#/auth/callback`;
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
