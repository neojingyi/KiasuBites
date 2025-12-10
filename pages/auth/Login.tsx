import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { ShoppingBag, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '../../types';

const Login: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Log in to Kiasu<span className="text-primary-600">Bites</span></h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-6 text-center">I am a</label>
            <div className="grid grid-cols-1 gap-4">
              <motion.div
                className="group relative py-6 px-6 rounded-2xl border-2 text-left bg-white border-gray-200 hover:border-primary-500 transition-all duration-200 overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/login/${UserRole.CONSUMER}`} className="block relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-50/0 group-hover:from-primary-50 group-hover:to-primary-100/50 transition-all duration-200" />
                  <div className="relative flex flex-col items-start gap-3">
                    <div className="p-3 rounded-xl bg-primary-100 group-hover:bg-primary-200 transition-colors">
                      <ShoppingBag className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Consumer</h3>
                      <p className="text-sm text-gray-600">Email sign-in for consumers</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
              <motion.div
                className="group relative py-6 px-6 rounded-2xl border-2 text-left bg-white border-gray-200 hover:border-primary-500 transition-all duration-200 overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/login/${UserRole.VENDOR}`} className="block relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-50/0 group-hover:from-primary-50 group-hover:to-primary-100/50 transition-all duration-200" />
                  <div className="relative flex flex-col items-start gap-3">
                    <div className="p-3 rounded-xl bg-primary-100 group-hover:bg-primary-200 transition-colors">
                      <Store className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Vendor</h3>
                      <p className="text-sm text-gray-600">Email sign-in for vendors</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Sign up</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
