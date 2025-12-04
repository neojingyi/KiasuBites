import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, Store, LayoutDashboard, ListOrdered, Calendar, Star, Info, Settings, Heart, ShieldAlert, Map } from 'lucide-react';
import { Button } from './UI';
import { motion, AnimatePresence } from 'framer-motion';
import bagLogo from '../assets/Untitled design (4).png';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; mobileLabel?: string }> = ({ 
    to, icon, label, mobileLabel 
  }) => {
    const active = isActive(to);
    return (
      <Link to={to} className="relative group">
        <motion.div
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-colors ${
            active 
              ? 'text-primary-600 bg-primary-50' 
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-sm">{mobileLabel || label}</span>
        </motion.div>
        {active && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
            layoutId="activeIndicator"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  const renderNavLinks = () => {
    if (!user) {
      return (
        <>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/login" 
              className="text-gray-700 hover:text-primary-600 font-semibold text-sm transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Log in
            </Link>
          </motion.div>
          <Link to="/register">
            <Button size="sm">Sign up</Button>
          </Link>
        </>
      );
    }

    if (user.role === 'consumer') {
      return (
        <>
          <NavLink to="/consumer/home" icon={<ShoppingBag size={18} />} label="Browse" />
          <NavLink to="/consumer/favorites" icon={<Heart size={18} />} label="Favorites" />
          <NavLink to="/consumer/orders" icon={<ListOrdered size={18} />} label="Orders" />
          <NavLink to="/consumer/map" icon={<Map size={18} />} label="Map" />
          <div className="border-l border-gray-200 h-8 mx-2 hidden md:block"></div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/consumer/profile" className="flex items-center space-x-2 text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
                {user.name.charAt(0)}
              </div>
              <span className="hidden md:inline text-sm">{user.name}</span>
            </Link>
          </motion.div>
          <motion.button 
            onClick={handleLogout} 
            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <LogOut size={18} />
          </motion.button>
        </>
      );
    }

    if (user.role === 'vendor') {
      return (
        <>
          <NavLink to="/vendor/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" mobileLabel="Dashboard" />
          <NavLink to="/vendor/bags" icon={<ShoppingBag size={18} />} label="Bags" mobileLabel="Bags" />
          <NavLink to="/vendor/availability" icon={<Calendar size={18} />} label="Availability" mobileLabel="Availability" />
          <NavLink to="/vendor/orders" icon={<ListOrdered size={18} />} label="Orders" mobileLabel="Orders" />
          <NavLink to="/vendor/reviews" icon={<Star size={18} />} label="Reviews" mobileLabel="Reviews" />
          <div className="border-l border-gray-200 h-8 mx-2 hidden md:block"></div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link to="/vendor/tips" className="text-gray-600 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Info size={18} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link to="/vendor/settings" className="text-gray-600 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings size={18} />
            </Link>
          </motion.div>
          <div className="flex items-center space-x-2 text-gray-700 ml-2">
            <span className="font-semibold text-sm hidden md:inline">{user.name}</span>
          </div>
          <motion.button 
            onClick={handleLogout} 
            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-50 transition-colors ml-2"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <LogOut size={18} />
          </motion.button>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fefbf1] flex flex-col">
      {/* Verification Banner */}
      <AnimatePresence>
        {user?.role === 'vendor' && !user?.isVerified && location.pathname !== '/vendor/verification' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200/50 px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-orange-800">
                <ShieldAlert size={20} />
                <span className="text-sm font-semibold">Verify your business: Enter your company's name and UEN to start listing surprise bags.</span>
              </div>
              <Button size="sm" variant="outline" className="bg-white whitespace-nowrap" onClick={() => navigate('/vendor/verification')}>
                Verify Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <motion.nav
        className={`bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'shadow-lg shadow-black/5' : 'shadow-sm'
        }`}
        initial={false}
        animate={{
          boxShadow: scrolled 
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center cursor-pointer" 
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img 
                src={bagLogo} 
                alt="KiasuBites Logo" 
                className="h-10 w-10 mr-3 object-contain"
              />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Kiasu<span className="text-primary-600">Bites</span>
              </span>
            </motion.div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              {renderNavLinks()}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <motion.button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-50"
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {renderNavLinks()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">KiasuBites</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Save food, save money. Join the fight against food waste.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Consumers</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/consumer/home" className="hover:text-primary-600 transition-colors">Browse Bags</Link></li>
                <li><Link to="/consumer/orders" className="hover:text-primary-600 transition-colors">My Orders</Link></li>
                <li><Link to="/consumer/favorites" className="hover:text-primary-600 transition-colors">Favorites</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Vendors</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/vendor/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link></li>
                <li><Link to="/vendor/bags" className="hover:text-primary-600 transition-colors">Manage Bags</Link></li>
                <li><Link to="/vendor/orders" className="hover:text-primary-600 transition-colors">Orders</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} KiasuBites. Save food, save money.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
