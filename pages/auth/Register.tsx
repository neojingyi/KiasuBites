import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/UI';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CONSUMER);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Mock registration is just login
      await login(email, role);
      toast.success('Account created!');
      navigate(role === UserRole.VENDOR ? '/vendor/dashboard' : '/consumer/home');
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join KiasuBites</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Full Name" 
            placeholder="John Doe"
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
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`py-2 px-4 rounded-md border text-sm font-medium ${role === UserRole.CONSUMER ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setRole(UserRole.CONSUMER)}
              >
                Buy Food
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-md border text-sm font-medium ${role === UserRole.VENDOR ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setRole(UserRole.VENDOR)}
              >
                Sell Surplus
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create Account
            </Button>
          </div>
        </form>
         <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;