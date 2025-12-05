import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Consumer Pages
import ConsumerHome from './pages/consumer/Home';
import ConsumerOrders from './pages/consumer/Orders';
import ConsumerProfile from './pages/consumer/Profile';
import BagDetails from './pages/consumer/BagDetails';
import ConsumerFavorites from './pages/consumer/Favorites';
import Map from './pages/consumer/Map';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorBags from './pages/vendor/Bags';
import VendorOrders from './pages/vendor/Orders';
import VendorVerification from './pages/vendor/Verification';
import VendorAvailability from './pages/vendor/Availability';
import VendorReviews from './pages/vendor/Reviews';
import VendorTips from './pages/vendor/Tips';
import VendorSettings from './pages/vendor/Settings';
import VendorFinancials from './pages/vendor/Financials';

import Layout from './components/Layout';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }: { children?: React.ReactNode, allowedRole?: 'consumer' | 'vendor' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'vendor' ? '/vendor/dashboard' : '/consumer/home'} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout><Landing /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />

            {/* Consumer Routes */}
            <Route path="/consumer" element={<ProtectedRoute allowedRole="consumer"><Layout /></ProtectedRoute>}>
              <Route path="home" element={<ConsumerHome />} />
              <Route path="bags/:id" element={<BagDetails />} />
              <Route path="orders" element={<ConsumerOrders />} />
              <Route path="profile" element={<ConsumerProfile />} />
              <Route path="favorites" element={<ConsumerFavorites />} />
              <Route path="map" element={<Map />} />
            </Route>

            {/* Vendor Routes */}
            <Route path="/vendor" element={<ProtectedRoute allowedRole="vendor"><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="bags" element={<VendorBags />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="verification" element={<VendorVerification />} />
              <Route path="availability" element={<VendorAvailability />} />
              <Route path="reviews" element={<VendorReviews />} />
              <Route path="tips" element={<VendorTips />} />
              <Route path="settings" element={<VendorSettings />} />
              <Route path="financials" element={<VendorFinancials />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            className: '',
            style: {
              background: '#ffffff',
              color: '#1d1d1f',
              borderRadius: '16px',
              padding: '14px 20px',
              fontSize: '15px',
              fontWeight: '500',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontFamily: "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            },
            success: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            duration: 3000,
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
