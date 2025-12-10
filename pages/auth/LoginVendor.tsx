import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button, Input, Card } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import toast from "react-hot-toast";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";

const LoginVendor: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("LoginVendor render", { isLoading, user });
    if (!isLoading && user) {
      navigate("/vendor/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const user = await login(email, password, UserRole.VENDOR);
      const firstName = user.name.split(" ")[0];
      toast.success(`Welcome back, ${firstName}!`);

      const from = (location.state as any)?.from;
      if (from) navigate(from);
      else navigate("/vendor/dashboard");
    } catch (error) {
      console.error("Email login failed", error);
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Vendor Login
        </h2>

        <GoogleSignInButton role={UserRole.VENDOR} />
        <div className="my-6 flex items-center text-gray-500 text-sm">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3">or continue with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Log In
            </Button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}

        <p className="mt-6 text-center text-sm text-gray-600">
          Not a vendor?{" "}
          <Link to="/login" className="text-primary-600 hover:underline">
            Choose a different role
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginVendor;
