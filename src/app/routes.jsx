import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../lib/apiClient";
import logo from "../assets/logo.svg";
import LandingPage from "../features/landing/LandingPage";
import SalonDetails from "../features/salon/SalonDetails";
import TimeSlots from "../features/availability/TimeSlots";
import CheckoutPage from "../features/checkout/CheckoutPage";
import ConfirmationPage from "../features/booking/ConfirmationPage";
import SuccessPage from "../features/checkout/SuccessPage";
import CancelPage from "../features/checkout/CancelPage";
import FAQPage from "../features/faq/FAQPage";
import CartSidebar from "../features/cart/CartSidebar";
import { toggleCart } from "../features/cart/cartSlice";
import ProductsPage from "../features/products/ProductsPage";
import ProductCheckoutPage from "../features/orders/ProductCheckoutPage";
import OrderSuccessPage from "../features/orders/OrderSuccessPage";
import ShopSuccessPage from "../features/orders/ShopSuccessPage";
import ShopCancelPage from "../features/orders/ShopCancelPage";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import AuthSuccessPage from "../features/auth/AuthSuccessPage";
import ProfilePage from "../features/profile/ProfilePage";
import ProfileEditPage from "../features/profile/ProfileEditPage";
import BeauticianSelectionPage from "../features/beauticians/BeauticianSelectionPage";
import AboutUsPage from "../features/about/AboutUsPage";
import TokenDebugPage from "../features/auth/TokenDebugPage";
import { useAuth } from "./AuthContext";

import AdminLayout from "../admin/AdminLayout";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLogin from "../admin/pages/Login";
import ScrollToTop from "../components/ScrollToTop";
import CurrencySelector from "../components/CurrencySelector";

// Lazy load admin pages for better performance (code splitting)
const Dashboard = lazy(() => import("../admin/pages/Dashboard"));
const AdminAppointments = lazy(() => import("../admin/pages/Appointments"));
const AdminOrders = lazy(() => import("../admin/pages/Orders"));
const AdminServices = lazy(() => import("../admin/pages/Services"));
const AdminStaff = lazy(() => import("../admin/pages/Staff"));
const Hours = lazy(() => import("../admin/pages/Hours"));
const WorkingHoursCalendar = lazy(() =>
  import("../admin/pages/WorkingHoursCalendar")
);
const Settings = lazy(() => import("../admin/pages/Settings"));
const Revenue = lazy(() => import("../admin/pages/Revenue"));
const ProfitAnalytics = lazy(() => import("../admin/pages/ProfitAnalytics"));
const Profile = lazy(() => import("../admin/pages/Profile"));
const CancellationPolicy = lazy(() =>
  import("../admin/pages/CancellationPolicy")
);
const TimeOff = lazy(() => import("../admin/pages/TimeOff"));
const HeroSections = lazy(() => import("../admin/pages/HeroSections"));
const AboutUsManagement = lazy(() =>
  import("../admin/pages/AboutUsManagement")
);
const Products = lazy(() => import("../admin/pages/Products"));
const ProductsHero = lazy(() => import("../admin/pages/ProductsHero"));
const AdminBeauticianLink = lazy(() =>
  import("../admin/pages/AdminBeauticianLink")
);
const StripeConnect = lazy(() => import("../admin/pages/StripeConnect"));
const Subscription = lazy(() => import("../admin/pages/Subscription"));
const OnboardingComplete = lazy(() =>
  import("../admin/pages/OnboardingComplete")
);
const ReauthOnboarding = lazy(() => import("../admin/pages/ReauthOnboarding"));
const ShippingRates = lazy(() => import("../admin/pages/ShippingRates"));

function CustomerLayout() {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [salonName, setSalonName] = useState("Beauty Salon");
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    api
      .get("/salon")
      .then((r) => {
        if (r.data?.name) {
          setSalonName(r.data.name);
        }
      })
      .catch(() => {
        // Keep default name if fetch fails
      });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Left Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-8 flex-1">
              <Link
                to="/"
                className="text-sm font-serif font-medium text-gray-700 hover:text-brand-600 transition-colors tracking-wide"
              >
                Home
              </Link>
              <Link
                to="/beauticians"
                className="text-sm font-serif font-medium text-gray-700 hover:text-brand-600 transition-colors tracking-wide"
              >
                Book Now
              </Link>
              <Link
                to="/products"
                className="text-sm font-serif font-medium text-gray-700 hover:text-brand-600 transition-colors tracking-wide"
              >
                Catalog
              </Link>
              <Link
                to="/about"
                className="text-sm font-serif font-medium text-gray-700 hover:text-brand-600 transition-colors tracking-wide"
              >
                About
              </Link>
              <Link
                to="/salon"
                className="text-sm font-serif font-medium text-gray-700 hover:text-brand-600 transition-colors tracking-wide"
              >
                Contact
              </Link>
            </nav>

            {/* Center Logo */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1"
            >
              <img
                src={logo}
                alt={salonName}
                className="h-36 w-36 md:h-44 md:w-64 object-contain mt-4"
              />
            </Link>

            {/* Right Icons - Desktop */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
              <button
                className="p-2 text-gray-700 hover:text-brand-600 transition-colors"
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={() => setProfileMenuOpen(true)}
                  onMouseLeave={() => setProfileMenuOpen(false)}
                >
                  <button
                    className="p-2 text-gray-700 hover:text-brand-600 transition-colors"
                    aria-label="Profile"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>

                  {/* Profile Dropdown with elegant animation */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 z-[100] animate-fade-in">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[220px]">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 leading-tight whitespace-normal break-words">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 whitespace-normal break-all">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-all duration-200 whitespace-nowrap"
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 whitespace-nowrap"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-serif font-medium text-gray-700 hover:text-brand-600 transition-colors tracking-wide"
                >
                  Sign In
                </Link>
              )}
              {/* Currency Selector */}
              <CurrencySelector />
              <button
                onClick={() => dispatch(toggleCart())}
                className="p-2 text-gray-700 hover:text-brand-600 transition-colors relative"
                aria-label="Cart"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Cart & Hamburger Buttons */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile Currency Selector */}
              <CurrencySelector className="scale-90" />
              {/* Mobile Cart Button */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors relative"
                aria-label="Cart"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu with slide animation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 tracking-wide"
                >
                  Home
                </Link>
                <Link
                  to="/beauticians"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 tracking-wide"
                >
                  Book Now
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 tracking-wide"
                >
                  Catalog
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 tracking-wide"
                >
                  About
                </Link>
                <Link
                  to="/salon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 tracking-wide"
                >
                  Contact
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    dispatch(toggleCart());
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 flex items-center justify-between tracking-wide"
                >
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle">
                      {cartItemCount}
                    </span>
                  )}
                </button>
                {user ? (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 tracking-wide"
                  >
                    Profile ({user.name})
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 tracking-wide"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-serif font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-250 tracking-wide"
                >
                  Admin
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/beauticians" element={<BeauticianSelectionPage />} />
          <Route path="/times" element={<TimeSlots />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/salon" element={<SalonDetails />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/product-checkout" element={<ProductCheckoutPage />} />
          <Route path="/shop/success" element={<ShopSuccessPage />} />
          <Route path="/shop/cancel" element={<ShopCancelPage />} />
          <Route
            path="/order-success/:orderNumber"
            element={<OrderSuccessPage />}
          />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/token-debug" element={<TokenDebugPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Routes>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* OAuth Success Page (must be before CustomerLayout catch-all) */}
        <Route path="/auth/success" element={<AuthSuccessPage />} />

        {/* Admin Login (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="appointments"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminAppointments />
              </Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminOrders />
              </Suspense>
            }
          />
          <Route
            path="revenue"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Revenue />
              </Suspense>
            }
          />
          <Route
            path="profit-analytics"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ProfitAnalytics />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminServices />
              </Suspense>
            }
          />
          <Route
            path="staff"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminStaff />
              </Suspense>
            }
          />
          <Route
            path="hours"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Hours />
              </Suspense>
            }
          />
          <Route
            path="schedule"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <WorkingHoursCalendar />
              </Suspense>
            }
          />
          <Route
            path="timeoff"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <TimeOff />
              </Suspense>
            }
          />
          <Route
            path="hero-sections"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <HeroSections />
              </Suspense>
            }
          />
          <Route
            path="about-us"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AboutUsManagement />
              </Suspense>
            }
          />
          <Route
            path="products"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Products />
              </Suspense>
            }
          />
          <Route
            path="products-hero"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ProductsHero />
              </Suspense>
            }
          />
          <Route
            path="admin-links"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminBeauticianLink />
              </Suspense>
            }
          />
          <Route
            path="stripe-connect"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <StripeConnect />
              </Suspense>
            }
          />
          <Route
            path="subscription"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Subscription />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="settings/onboarding-complete"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <OnboardingComplete />
              </Suspense>
            }
          />
          <Route
            path="settings/reauth"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ReauthOnboarding />
              </Suspense>
            }
          />
          <Route
            path="shipping-rates"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ShippingRates />
              </Suspense>
            }
          />
          <Route
            path="cancellation"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <CancellationPolicy />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Profile />
              </Suspense>
            }
          />
        </Route>

        {/* Customer Routes */}
        <Route path="*" element={<CustomerLayout />} />
      </Routes>
    </>
  );
}
