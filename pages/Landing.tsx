import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { ShoppingBag, DollarSign, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bagImage from '../assets/Untitled design (4).png';

const Landing: React.FC = () => {
  const { user } = useAuth();
  const [showBag, setShowBag] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setShowBag(true);
  }, []);

  return (
    <div className="space-y-16 py-10">
      {/* Hero Section with Bouncing Bag */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        {/* Bouncing Bag Animation */}
        <div className="flex justify-center mb-8">
          <img 
            src={bagImage} 
            alt="KiasuBites Bag" 
            className={`w-32 h-32 md:w-40 md:h-40 ${showBag ? 'bounce-in' : 'opacity-0'}`}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
          Good food shouldn't <br/> <span className="text-primary-600">go to waste.</span>
        </h1>
        <p className="text-xl text-gray-600">
          Rescue delicious surplus food from your favorite local shops at a fraction of the price.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          {!user && (
            <>
              <Link to="/register">
                <Button size="lg" className="rounded-full px-8">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full px-8">Log In</Button>
              </Link>
            </>
          )}
          {user && (
             <Link to={user.role === 'vendor' ? "/vendor/dashboard" : "/consumer/home"}>
                <Button size="lg" className="rounded-full px-8">Go to Dashboard</Button>
             </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
          <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mx-auto">
            <DollarSign />
          </div>
          <h3 className="text-xl font-bold">Save Money</h3>
          <p className="text-gray-500">Get quality food for 50-70% off the original price. It's a steal.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag />
          </div>
          <h3 className="text-xl font-bold">Discover Food</h3>
          <p className="text-gray-500">Try new cafes, bakeries, and restaurants in your area with surprise bags.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
          <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mx-auto">
            <Leaf />
          </div>
          <h3 className="text-xl font-bold">Help the Planet</h3>
          <p className="text-gray-500">Every meal rescued is less CO2e emitted. Eat well, do good.</p>
        </div>
      </section>
      
      {/* Mock App Preview */}
      <section className="bg-primary-600 rounded-3xl p-8 md:p-16 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to rescue?</h2>
        <p className="text-primary-100 mb-8 max-w-xl mx-auto">Join thousands of foodies and vendors in the fight against food waste.</p>
        <Link to="/register">
           <button className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-8 rounded-full transition-colors">
             Join KiasuBites Free
           </button>
        </Link>
      </section>
    </div>
  );
};

export default Landing;