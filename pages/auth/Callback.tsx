import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          setStatus("error");
          setErrorMessage(
            "Supabase is not configured. Please add your env keys."
          );
          return;
        }

        console.log("=== AUTH CALLBACK START ===");
        console.log("Full URL:", window.location.href);
        console.log("Hash:", window.location.hash);
        console.log("Search:", window.location.search);

        // First, try to let Supabase automatically detect and set the session
        // Supabase has detectSessionInUrl: true, so it should handle this
        console.log("Step 1: Checking if Supabase auto-detected session...");
        const { data: autoSession, error: autoError } =
          await supabase.auth.getSession();

        if (autoSession?.session) {
          console.log("✅ Session auto-detected by Supabase!");
          console.log("User ID:", autoSession.session.user.id);
          console.log("Email:", autoSession.session.user.email);

          // Session is set, proceed to wait for AuthContext
          // Skip to navigation logic below
        } else {
          console.log(
            "❌ No auto-detected session, attempting manual extraction..."
          );
          console.log("Auto error:", autoError);

          // --- FIX: Handle malformed URLs with %23access_token ---
          let currentUrl = window.location.href;
          let needsUrlFix = false;
          let fixedUrl = currentUrl;

          // Check if URL has %23 (encoded #) anywhere
          if (currentUrl.includes("%23")) {
            console.log("Detected %23 in URL, fixing...");
            fixedUrl = fixedUrl.replace(/(https?:\/\/[^\/]+)#/, "$1/#");
            fixedUrl = fixedUrl.replace(/%23/g, "#");
            needsUrlFix = true;
          }

          // Apply the URL fix if needed
          if (needsUrlFix) {
            try {
              const urlObj = new URL(fixedUrl);
              const newUrl =
                urlObj.origin + (urlObj.pathname || "/") + urlObj.hash;
              window.history.replaceState({}, "", newUrl);
              console.log("URL fixed:", window.location.href);
            } catch (e) {
              console.error("Error fixing URL:", e);
            }
          }

          // Manual extraction - only if auto-detection failed
          let hash = window.location.hash;
          console.log("Step 2: Manual token extraction from hash:", hash);

          // Extract from hash - handle formats like:
          // #access_token=...&refresh_token=...
          // #/auth/callback#access_token=...
          // #code=...

          let code: string | null = null;
          let access_token: string | null = null;
          let refresh_token: string | null = null;

          // Try extracting directly from hash
          const hashMatch = hash.match(/#(?:access_token|refresh_token|code)=/);
          if (hashMatch) {
            // Extract the part after the first # that contains tokens
            const tokenString =
              hash
                .split("#")
                .find(
                  (part) =>
                    part.includes("access_token") ||
                    part.includes("refresh_token") ||
                    part.includes("code=")
                ) || hash.replace(/^#/, "").replace(/^\/?auth\/callback/, "");

            console.log("Token string found:", tokenString.substring(0, 100));

            try {
              const params = new URLSearchParams(tokenString);
              code = params.get("code");
              access_token = params.get("access_token");
              refresh_token = params.get("refresh_token");
            } catch (e) {
              // Fallback to regex
              code = hash.match(/[#&]code=([^&]+)/)?.[1] || null;
              access_token =
                hash.match(/[#&]access_token=([^&]+)/)?.[1] || null;
              refresh_token =
                hash.match(/[#&]refresh_token=([^&]+)/)?.[1] || null;
            }
          }

          console.log("Extracted:", {
            hasCode: !!code,
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token,
          });

          let sessionSet = false;

          // Try exchangeCodeForSession first
          if (code) {
            console.log("Step 3: Exchanging code for session...");
            try {
              if (typeof supabase.auth.exchangeCodeForSession === "function") {
                const { data, error } =
                  await supabase.auth.exchangeCodeForSession(code);
                if (!error && data?.session) {
                  sessionSet = true;
                  console.log("✅ Session set via exchangeCodeForSession");
                } else {
                  console.error("exchangeCodeForSession error:", error);
                }
              }
            } catch (err) {
              console.error("exchangeCodeForSession failed:", err);
            }
          }

          // Try setSession with tokens
          if (!sessionSet && access_token && refresh_token) {
            console.log("Step 4: Setting session with tokens...");
            try {
              const { error: setError, data } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              if (!setError && data.session) {
                sessionSet = true;
                console.log("✅ Session set via setSession");
              } else {
                console.error("setSession error:", setError);
              }
            } catch (err) {
              console.error("setSession failed:", err);
            }
          }

          if (!sessionSet) {
            throw new Error(
              "Could not establish session. No valid tokens found."
            );
          }
        }

        // Final verification
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData?.session) {
          console.error("❌ Session verification failed:", sessionError);
          setStatus("error");
          setErrorMessage("No session found. Please try signing in again.");
          return;
        }

        // Read stored intent to decide where to route (consumer vs vendor)
        const rawIntent = localStorage.getItem("kiasuAuthIntent");
        let intent: { role?: string; nextPath?: string } | null = null;
        if (rawIntent) {
          try {
            intent = JSON.parse(rawIntent);
          } catch (e) {
            console.warn("Failed to parse kiasuAuthIntent", e);
          }
        }

        const intentRole = intent?.role;
        const targetRole =
          intentRole ||
          user?.role ||
          sessionData.session.user.user_metadata?.role ||
          localStorage.getItem("preferredRole") ||
          "consumer";

        // Default to role-specific destinations; allow intent override via nextPath
        const targetPath =
          intent?.nextPath ||
          (targetRole === "vendor" ? "/vendor/dashboard" : "/consumer/home");

        // Keep preferredRole in sync so AuthContext maps metadata consistently
        localStorage.setItem("preferredRole", targetRole);
        console.log("Auth intent", { intent, targetRole, targetPath });
        localStorage.removeItem("kiasuAuthIntent");

        console.log(
          "✅ Session verified! User:",
          sessionData.session.user.email
        );

        // Give AuthContext a moment to process the session change
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Wait for AuthContext to load user profile (max 3 seconds)
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds

        const checkAndNavigate = setInterval(() => {
          attempts++;

          // If auth finished loading and we have a user, navigate immediately
          if (!authLoading && user) {
            clearInterval(checkAndNavigate);
            const redirectPath = targetPath;
            console.log("User loaded, navigating to:", redirectPath);
            navigate(redirectPath, { replace: true });
            return;
          }

          // If auth finished loading but no user after 2 seconds, redirect anyway
          if (!authLoading && attempts >= 20 && !user) {
            clearInterval(checkAndNavigate);
            console.log(
              "Session exists but user profile not loaded yet - redirecting to targetPath"
            );
            navigate(targetPath, { replace: true });
            return;
          }

          // Timeout after 3 seconds
          if (attempts >= maxAttempts) {
            clearInterval(checkAndNavigate);
            console.log("Timeout waiting for user - redirecting anyway to targetPath");
            navigate(targetPath, { replace: true });
          }
        }, 100);
      } catch (err: any) {
        console.error("Unexpected error in auth callback:", err);
        setStatus("error");
        setErrorMessage(err?.message ?? "Unexpected error during sign-in");
      }
    };

    handleAuthCallback();
  }, [navigate, user, authLoading]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-gray-900">
            Completing sign in…
          </p>
          <p className="text-sm text-gray-600">
            Checking your session and redirecting you back to the app.
          </p>
        </div>
      </div>
    );
  }

  // Error UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4 max-w-md px-4">
        <h2 className="text-xl font-semibold text-gray-900">Sign in failed</h2>
        <p className="text-sm text-gray-600">
          {errorMessage || "Something went wrong while logging you in."}
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default AuthCallback;
