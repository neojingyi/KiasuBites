import React from "react";
import { Button } from "./UI";
import { signInWithGoogle } from "../services/auth";
import { UserRole } from "../types";

interface GoogleButtonProps {
  role?: UserRole;
  /**
   * Optional explicit path to land on after OAuth completes.
   * If not provided, we fall back to role-based defaults.
   */
  nextPath?: string;
}

export const GoogleSignInButton: React.FC<GoogleButtonProps> = ({
  role = UserRole.CONSUMER,
  nextPath,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Persist intent so the callback knows which flow (consumer vs vendor) to send the user to.
      const defaultNext =
        nextPath ||
        (role === UserRole.VENDOR ? "/register/vendor" : "/register/consumer");
      localStorage.setItem(
        "kiasuAuthIntent",
        JSON.stringify({ role, nextPath: defaultNext })
      );
      localStorage.setItem("preferredRole", role);
      await signInWithGoogle();
    } catch (err: any) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleClick}
        className="w-full bg-primary-600 text-white border border-primary-600 hover:bg-primary-700"
        isLoading={isLoading}
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            className="h-5 w-5"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.51 0 6.63 1.21 9.1 3.59l6.79-6.79C35.9 2.49 30.47 0 24 0 14.62 0 6.51 5.44 2.56 13.34l7.92 6.15C12.23 13.12 17.63 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24.5c0-1.64-.15-3.22-.43-4.75H24v9.02h12.65c-.55 2.97-2.22 5.49-4.74 7.18l7.63 5.92C43.93 37.68 46.5 31.59 46.5 24.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.48 28.49c-.49-1.44-.77-2.98-.77-4.49 0-1.56.27-3.07.75-4.48l-7.9-6.15C.88 16.47 0 20.11 0 24c0 3.83.86 7.44 2.4 10.63l8.08-6.14z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.92-2.13 15.89-5.79l-7.63-5.92c-2.13 1.43-4.86 2.28-8.26 2.28-6.36 0-11.75-3.6-13.91-8.86l-7.95 6.13C6.57 42.51 14.64 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          <span>Sign in with Google</span>
        </div>
      </Button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
};
