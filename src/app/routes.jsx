import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../lib/apiClient";
import ServicesPage from "../features/services/ServicesPage";
import SalonDetails from "../features/salon/SalonDetails";
import TimeSlots from "../features/availability/TimeSlots";
import CheckoutPage from "../features/checkout/CheckoutPage";
import ConfirmationPage from "../features/booking/ConfirmationPage";
import SuccessPage from "../features/checkout/SuccessPage";
import CancelPage from "../features/checkout/CancelPage";

import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import AdminAppointments from "../admin/pages/Appointments";
import AdminServices from "../admin/pages/Services";
import AdminStaff from "../admin/pages/Staff";
import Hours from "../admin/pages/Hours";
import Settings from "../admin/pages/Settings";
import Revenue from "../admin/pages/Revenue";

function CustomerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [salonName, setSalonName] = useState("Beauty Salon");

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
    <div className="min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 hover:text-brand-600 transition-colors"
            >
              <span className="text-xl sm:text-2xl">✨</span>
              <span className="bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                {salonName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-all"
              >
                Services
              </Link>
              <Link
                to="/salon"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-all"
              >
                About
              </Link>
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-all"
              >
                Admin
              </Link>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-all"
                >
                  Services
                </Link>
                <Link
                  to="/salon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-all"
                >
                  About
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-all text-center"
                >
                  Admin
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ServicesPage />} />
          <Route path="/times" element={<TimeSlots />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/salon" element={<SalonDetails />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="hours" element={<Hours />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<CustomerLayout />} />
    </Routes>
  );
}
