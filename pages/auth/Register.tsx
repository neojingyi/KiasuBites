import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/UI';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';
import { ShoppingBag, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import profilePic1 from '../../assets/1.png';
import profilePic2 from '../../assets/2.png';
import profilePic3 from '../../assets/3.png';
import profilePic4 from '../../assets/4.png';
import profilePic5 from '../../assets/5.png';
import profilePic6 from '../../assets/6.png';
import profilePic7 from '../../assets/7.png';
import profilePic8 from '../../assets/8.png';

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

const Register: React.FC = () => {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [selectedProfilePic, setSelectedProfilePic] = useState<number>(1);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !name || !email || !password) return;
    // For vendors, address is required
    if (role === UserRole.VENDOR && !address) {
      toast.error('Please enter your business address');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Use the actual imported image source (Vite will process this correctly)
      const selectedPic = profilePictures.find(pic => pic.id === selectedProfilePic);
      const profilePictureUrl = selectedPic?.src || profilePictures[0].src;
      console.log('Registering with profile picture:', profilePictureUrl);
      console.log('Profile picture URL type:', typeof profilePictureUrl);
      await register(email, password, name, role, profilePictureUrl, address);
      toast.success('Account created successfully!', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#1d1d1f',
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
        },
        iconTheme: {
          primary: '#dc2626',
          secondary: '#ffffff',
        },
        duration: 3000,
      });
      navigate(role === UserRole.VENDOR ? '/vendor/dashboard' : '/consumer/home');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      console.error('Registration error:', error);
      toast.error(errorMessage, {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#dc2626',
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join Kiasu<span className="text-primary-600">Bites</span></h2>
        
        {step === 'role' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-6 text-center">I want to</label>
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  type="button"
                  className="group relative py-6 px-6 rounded-2xl border-2 text-left bg-white border-gray-200 hover:border-primary-500 transition-all duration-200 overflow-hidden"
                  onClick={() => handleRoleSelect(UserRole.CONSUMER)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-50/0 group-hover:from-primary-50 group-hover:to-primary-100/50 transition-all duration-200" />
                  <div className="relative flex flex-col items-start gap-3">
                    <div className="p-3 rounded-xl bg-primary-100 group-hover:bg-primary-200 transition-colors">
                      <ShoppingBag className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Buy Food</h3>
                      <p className="text-sm text-gray-600">Browse surprise bags</p>
                    </div>
                  </div>
                </motion.button>
                <motion.button
                  type="button"
                  className="group relative py-6 px-6 rounded-2xl border-2 text-left bg-white border-gray-200 hover:border-primary-500 transition-all duration-200 overflow-hidden"
                  onClick={() => handleRoleSelect(UserRole.VENDOR)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-50/0 group-hover:from-primary-50 group-hover:to-primary-100/50 transition-all duration-200" />
                  <div className="relative flex flex-col items-start gap-3">
                    <div className="p-3 rounded-xl bg-primary-100 group-hover:bg-primary-200 transition-colors">
                      <Store className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Sell Surplus</h3>
                      <p className="text-sm text-gray-600">List your food bags</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('role');
                    setRole(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
                <span className="text-sm text-gray-600">
                  Signing up as <strong className="text-gray-900">{role === UserRole.CONSUMER ? 'Consumer' : 'Vendor'}</strong>
                </span>
              </div>
            </div>

            <Input 
              label={role === UserRole.VENDOR ? "Business Name" : "Full Name"} 
              placeholder={role === UserRole.VENDOR ? "My Bakery" : "John Doe"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input 
              label="Email Address" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {role === UserRole.VENDOR && (
              <Input 
                label="Business Address" 
                placeholder="123 Main Street, Singapore 123456"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            )}
            <Input 
              label="Password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Profile Picture Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 tracking-tight">
                Choose Your Profile Picture
              </label>
              <div className="grid grid-cols-4 gap-3">
                {profilePictures.map((pic) => (
                  <motion.button
                    key={pic.id}
                    type="button"
                    onClick={() => setSelectedProfilePic(pic.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedProfilePic === pic.id
                        ? 'border-primary-600 ring-2 ring-primary-200 ring-offset-2'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={pic.src}
                      alt={`Profile ${pic.id}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedProfilePic === pic.id && (
                      <motion.div
                        className="absolute inset-0 bg-primary-600/20 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Create Account
              </Button>
            </div>
          </form>
        )}
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;