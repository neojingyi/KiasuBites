import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/UI';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';
import { ShoppingBag, Store } from 'lucide-react';
import { motion } from 'framer-motion';

const Register: React.FC = () => {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setIsSubmitting(true);
    try {
      // Mock registration is just login
      await login(email, role);
      toast.success('Account created!', {
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
      toast.error('Registration failed', {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join KiasuBites</h2>
        
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
              label="Full Name" 
              placeholder="John Doe"
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
            <Input 
              label="Password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
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