import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Store,
  LayoutDashboard,
  ListOrdered,
  Calendar,
  Star,
  Info,
  Settings,
  Heart,
  ShieldAlert,
  Map,
} from "lucide-react";
import { Button, Modal } from "./UI";
import { motion, AnimatePresence } from "framer-motion";
import bagLogo from "../assets/Untitled design (4).png";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./ui/resizable-navbar";

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/");
    setShowLogoutConfirm(false);
  };

  const getNavItems = () => {
    if (!user) {
      return [{ name: "Home", link: "/" }];
    }

    if (user.role === "consumer") {
      return [
        { name: "Browse", link: "/consumer/home" },
        { name: "Favorites", link: "/consumer/favorites" },
        { name: "Orders", link: "/consumer/orders" },
        { name: "Map", link: "/consumer/map" },
      ];
    }

    if (user.role === "vendor") {
      return [
        { name: "Dashboard", link: "/vendor/dashboard" },
        { name: "Bags", link: "/vendor/bags" },
        { name: "Orders", link: "/vendor/orders" },
        { name: "Reviews", link: "/vendor/reviews" },
        { name: "Availability", link: "/vendor/availability" },
        { name: "Financials", link: "/vendor/financials" },
      ];
    }

    return [];
  };

  return (
    <div className="min-h-screen bg-[#fefbf1] flex flex-col">
      {/* Verification Banner */}
      <AnimatePresence>
        {user?.role === "vendor" &&
          !user?.isVerified &&
          location.pathname !== "/vendor/verification" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-orange-50 border-b border-orange-200 px-4 py-3"
            >
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-orange-800">
                  <ShieldAlert size={20} />
                  <span className="text-sm font-semibold">
                    Verify your business: Enter your company's name and UEN to
                    start listing surprise bags.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white whitespace-nowrap"
                  onClick={() => navigate("/vendor/verification")}
                >
                  Verify Now
                </Button>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Resizable Navbar */}
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo logo={bagLogo} onClick={() => navigate("/")} />
          <NavItems
            items={getNavItems()}
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <NavbarButton variant="secondary" to="/login">
                  Login
                </NavbarButton>
                <NavbarButton variant="primary" to="/register">
                  Sign up
                </NavbarButton>
              </>
            ) : (
              <>
                {user.role === "consumer" && (
                  <Link
                    to="/consumer/profile"
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {user.name}
                    </span>
                  </Link>
                )}
                {user.role === "vendor" && (
                  <>
                    <Link
                      to="/vendor/settings"
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Settings size={18} />
                    </Link>
                    <span className="text-sm font-medium hidden md:inline">
                      {user.name}
                    </span>
                  </>
                )}
                <button
                  onClick={handleLogoutClick}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo logo={bagLogo} onClick={() => navigate("/")} />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {getNavItems().map((item, idx) => {
              const LinkComponent = item.link.startsWith("#") ? "a" : Link;
              const linkProps = item.link.startsWith("#")
                ? { href: item.link }
                : { to: item.link };

              return (
                <LinkComponent
                  key={`mobile-link-${idx}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300"
                  {...linkProps}
                >
                  <span className="block">{item.name}</span>
                </LinkComponent>
              );
            })}
            <div className="flex w-full flex-col gap-4">
              {!user ? (
                <>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                    to="/login"
                  >
                    Login
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                    to="/register"
                  >
                    Sign up
                  </NavbarButton>
                </>
              ) : (
                <>
                  {user.role === "consumer" && (
                    <NavbarButton
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="secondary"
                      className="w-full"
                      to="/consumer/profile"
                    >
                      Profile
                    </NavbarButton>
                  )}
                  {user.role === "vendor" && (
                    <NavbarButton
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="secondary"
                      className="w-full"
                      to="/vendor/settings"
                    >
                      Settings
                    </NavbarButton>
                  )}
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Main Content */}
      <main
        className={`flex-grow w-full ${
          location.pathname === "/"
            ? ""
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
        }`}
      >
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">
                KiasuBites
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Save food, save money. Join the fight against food waste.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                For Consumers
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    to="/consumer/home"
                    className="hover:text-primary-600 transition-colors"
                  >
                    Browse Bags
                  </Link>
                </li>
                <li>
                  <Link
                    to="/consumer/orders"
                    className="hover:text-primary-600 transition-colors"
                  >
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/consumer/favorites"
                    className="hover:text-primary-600 transition-colors"
                  >
                    Favorites
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Vendors</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    to="/vendor/dashboard"
                    className="hover:text-primary-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vendor/bags"
                    className="hover:text-primary-600 transition-colors"
                  >
                    Manage Bags
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vendor/orders"
                    className="hover:text-primary-600 transition-colors"
                  >
                    Orders
                  </Link>
                </li>
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

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to sign out? You'll need to log in again to
            access your account.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleLogoutConfirm}
              className="flex-1"
            >
              Yes, Sign Out
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
