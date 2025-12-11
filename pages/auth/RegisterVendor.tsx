import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Card } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import toast from "react-hot-toast";
import profilePic1 from "../../assets/1.png";
import profilePic2 from "../../assets/2.png";
import profilePic3 from "../../assets/3.png";
import profilePic4 from "../../assets/4.png";
import profilePic5 from "../../assets/5.png";
import profilePic6 from "../../assets/6.png";
import profilePic7 from "../../assets/7.png";
import profilePic8 from "../../assets/8.png";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";

const profilePictures = [
  { id: 1, src: profilePic1 },
  { id: 2, src: profilePic2 },
  { id: 3, src: profilePic3 },
  { id: 4, src: profilePic4 },
  { id: 5, src: profilePic5 },
  { id: 6, src: profilePic6 },
  { id: 7, src: profilePic7 },
  { id: 8, src: profilePic8 },
];

const RegisterVendor: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [selectedProfilePic, setSelectedProfilePic] = useState<number>(1);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timeout helper so we never spin forever if Supabase is slow/unreachable
  const withTimeout = <T,>(promise: Promise<T>, ms = 15000) =>
    Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), ms)
      ),
    ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error("Please enter your business address");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPic = profilePictures.find((pic) => pic.id === selectedProfilePic);
      const profilePictureUrl = selectedPic?.src || profilePictures[0].src;
      await withTimeout(
        register(email, password, name, UserRole.VENDOR, profilePictureUrl, address)
      );
      toast.success("Vendor account created!");
      navigate("/vendor/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Join KiasuBites as Vendor
        </h2>

        <GoogleSignInButton role={UserRole.VENDOR} nextPath="/register/vendor" />
        <div className="my-6 flex items-center text-gray-500 text-sm">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3">or continue with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Business Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Business Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
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
          />

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Choose a profile picture</p>
            <div className="grid grid-cols-4 gap-3">
              {profilePictures.map((pic) => (
                <button
                  type="button"
                  key={pic.id}
                  onClick={() => setSelectedProfilePic(pic.id)}
                  className={`rounded-2xl overflow-hidden border-2 ${
                    selectedProfilePic === pic.id ? "border-primary-500" : "border-transparent"
                  }`}
                >
                  <img src={pic.src} alt={`Profile ${pic.id}`} className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create Vendor Account
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Not a vendor?{" "}
          <Link to="/register" className="text-primary-600 hover:underline">
            Choose a different role
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterVendor;
