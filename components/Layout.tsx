import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, Store, LayoutDashboard, ListOrdered, Calendar, Star, Info, Settings, Heart, ShieldAlert } from 'lucide-react';
import { Button } from './UI';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const renderNavLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">Log in</Link>
          <Link to="/register">
            <Button size="sm">Sign up</Button>
          </Link>
        </>
      );
    }

    if (user.role === 'consumer') {
      return (
        <>
          <Link to="/consumer/home" className={`flex items-center space-x-1 ${isActive('/consumer/home') ? 'text-primary-600' : 'text-gray-600'}`}>
            <ShoppingBag size={18} />
            <span>Browse</span>
          </Link>
          <Link to="/consumer/favorites" className={`flex items-center space-x-1 ${isActive('/consumer/favorites') ? 'text-primary-600' : 'text-gray-600'}`}>
            <Heart size={18} />
            <span>Favorites</span>
          </Link>
          <Link to="/consumer/orders" className={`flex items-center space-x-1 ${isActive('/consumer/orders') ? 'text-primary-600' : 'text-gray-600'}`}>
            <ListOrdered size={18} />
            <span>Orders</span>
          </Link>
          <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>
          <Link to="/consumer/profile" className="flex items-center space-x-2 text-gray-700 font-medium">
             <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                {user.name.charAt(0)}
             </div>
             <span className="hidden md:inline">{user.name}</span>
          </Link>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 ml-4">
            <LogOut size={18} />
          </button>
        </>
      );
    }

    if (user.role === 'vendor') {
      return (
        <>
          <Link to="/vendor/dashboard" className={`flex items-center space-x-1 ${isActive('/vendor/dashboard') ? 'text-primary-600' : 'text-gray-600'}`}>
            <LayoutDashboard size={18} />
            <span className="hidden lg:inline">Dashboard</span>
          </Link>
          <Link to="/vendor/bags" className={`flex items-center space-x-1 ${isActive('/vendor/bags') ? 'text-primary-600' : 'text-gray-600'}`}>
            <ShoppingBag size={18} />
            <span className="hidden lg:inline">Bags</span>
          </Link>
          <Link to="/vendor/availability" className={`flex items-center space-x-1 ${isActive('/vendor/availability') ? 'text-primary-600' : 'text-gray-600'}`}>
            <Calendar size={18} />
            <span className="hidden lg:inline">Availability</span>
          </Link>
          <Link to="/vendor/orders" className={`flex items-center space-x-1 ${isActive('/vendor/orders') ? 'text-primary-600' : 'text-gray-600'}`}>
            <ListOrdered size={18} />
            <span className="hidden lg:inline">Orders</span>
          </Link>
          <Link to="/vendor/reviews" className={`flex items-center space-x-1 ${isActive('/vendor/reviews') ? 'text-primary-600' : 'text-gray-600'}`}>
            <Star size={18} />
            <span className="hidden lg:inline">Reviews</span>
          </Link>
           <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>
           <Link to="/vendor/tips" className="text-gray-600 hover:text-primary-600">
             <Info size={18} />
           </Link>
           <Link to="/vendor/settings" className="text-gray-600 hover:text-primary-600">
             <Settings size={18} />
           </Link>
           <div className="flex items-center space-x-2 text-gray-700 ml-2">
             <span className="font-medium hidden md:inline">{user.name}</span>
           </div>
           <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 ml-2">
            <LogOut size={18} />
          </button>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fefbf1] flex flex-col">
      {/* Verification Banner */}
      {user?.role === 'vendor' && !user?.isVerified && location.pathname !== '/vendor/verification' && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
             <div className="flex items-center gap-2 text-orange-800">
               <ShieldAlert size={20} />
               <span className="text-sm font-medium">Verify your business: Enter your company’s name and UEN to start listing surprise bags.</span>
             </div>
             <Button size="sm" variant="outline" className="bg-white whitespace-nowrap" onClick={() => navigate('/vendor/verification')}>
               Verify Now
             </Button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
               <div className="bg-primary-500 rounded-lg p-1.5 mr-2">
                 <ShoppingBag className="text-white w-5 h-5" />
               </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Kiasu<span className="text-primary-600">Bites</span></span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {renderNavLinks()}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3 flex flex-col shadow-lg animate-in slide-in-from-top-2 duration-200">
             {renderNavLinks()}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} KiasuBites. Save food, save money.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
