import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/UI';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('alexwang@gmail.com');
  const [username, setUsername] = useState('alexwang');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('credentials');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setIsSubmitting(true);
    try {
      const user = await login(email, role);
      const firstName = user.name.split(' ')[0]; // Extract first name
      toast.success(`Welcome back! Logged in as ${firstName}`, {
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
      toast.error('Login failed', {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Log in to KiasuBites</h2>
        
        {step === 'role' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="py-4 px-6 rounded-xl border-2 text-base font-medium bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 transition-all"
                  onClick={() => handleRoleSelect(UserRole.CONSUMER)}
                >
                  Consumer
                </button>
                <button
                  type="button"
                  className="py-4 px-6 rounded-xl border-2 text-base font-medium bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 transition-all"
                  onClick={() => handleRoleSelect(UserRole.VENDOR)}
                >
                  Vendor
                </button>
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
                  Logging in as <strong className="text-gray-900">{role === UserRole.CONSUMER ? 'Consumer' : 'Vendor'}</strong>
                </span>
              </div>
            </div>

            <Input 
              label="Username" 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="alexwang"
            />

            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Log In
              </Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Sign up</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;