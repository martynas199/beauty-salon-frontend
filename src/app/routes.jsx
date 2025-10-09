import { Routes, Route, Navigate, Link } from "react-router-dom";
import ServicesPage from "../features/services/ServicesPage";
import StaffPicker from "../features/staff/StaffPicker";
import TimeSlots from "../features/availability/TimeSlots";
import CheckoutPage from "../features/checkout/CheckoutPage";
import ConfirmationPage from "../features/booking/ConfirmationPage";

import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import AdminAppointments from "../admin/pages/Appointments";
import AdminServices from "../admin/pages/Services";
import AdminStaff from "../admin/pages/Staff";
import Hours from "../admin/pages/Hours";
import TimeOff from "../admin/pages/TimeOff";
import Settings from "../admin/pages/Settings";

export default function AppRoutes() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">Beauty Salon</Link>
          <nav className="text-sm space-x-4">
            <Link to="/">Book</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ServicesPage />} />
          <Route path="/staff" element={<StaffPicker />} />
          <Route path="/times" element={<TimeSlots />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="hours" element={<Hours />} />
            <Route path="timeoff" element={<TimeOff />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
