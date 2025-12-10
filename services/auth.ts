import { supabase } from "./supabase";

/**
 * Trigger Google OAuth flow via Supabase.
 * Redirects back to the client-side callback route.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  // Redirect back into the current origin; AuthProvider will hydrate the session and router will handle redirect.
  // On production this will be your deployed origin; on dev it will be localhost with the current port.
  const redirectTo = window.location.origin + "/#/login";
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
