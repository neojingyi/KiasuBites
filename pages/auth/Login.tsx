import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/UI';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('user@example.com');
  const [role, setRole] = useState<UserRole>(UserRole.CONSUMER);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, role);
      toast.success(`Welcome back! Logged in as ${role}`);
      navigate(role === UserRole.VENDOR ? '/vendor/dashboard' : '/consumer/home');
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Log in to KiasuBites</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`py-2 px-4 rounded-md border text-sm font-medium ${role === UserRole.CONSUMER ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setRole(UserRole.CONSUMER)}
              >
                Consumer
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-md border text-sm font-medium ${role === UserRole.VENDOR ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setRole(UserRole.VENDOR)}
              >
                Vendor
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Log In
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Sign up</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;