import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { CheckoutAPI } from "./checkout.api";
import { BookingAPI } from "../booking/booking.api";
import { setClient, setMode, setAppointmentId } from "../booking/bookingSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { ServicesAPI } from "../landing/services.api";
import BackBar from "../../components/ui/BackBar";
import FormField from "../../components/forms/FormField";
import { useAuth } from "../../app/AuthContext";
import PageTransition from "../../components/ui/PageTransition";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const booking = useSelector((s) => s.booking);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [service, setService] = useState(null);
  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[k]) {
      setErrors({ ...errors, [k]: "" });
    }
  };

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        notes: "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (booking.serviceId) ServicesAPI.get(booking.serviceId).then(setService);
  }, [booking.serviceId]);

  function validateForm() {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^[\d\s\-\+\(\)]+$/.test(form.phone) ||
      form.phone.replace(/\D/g, "").length < 10
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit(mode) {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    dispatch(setMode(mode));
    dispatch(setClient(form));
    setLoading(true);
    try {
      // Prepare booking data with userId if user is logged in
      const bookingData = {
        beauticianId: booking.any ? undefined : booking.beauticianId,
        any: booking.any,
        serviceId: booking.serviceId,
        variantName: booking.variantName,
        startISO: booking.startISO,
        client: form,
        mode: mode === "pay_in_salon" ? "pay_in_salon" : mode,
        ...(user ? { userId: user._id } : {}), // Add userId if logged in
      };

      if (mode === "pay_in_salon") {
        const res = await BookingAPI.reserveWithoutPayment(bookingData);
        if (res?.appointmentId) dispatch(setAppointmentId(res.appointmentId));
        navigate("/confirmation");
      } else {
        const res = await CheckoutAPI.createSession(bookingData);
        if (res?.url) window.location.href = res.url;
      }
    } catch (e) {
      toast.error(e.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <BackBar onBack={() => navigate(-1)} />
      <Card className="shadow-md p-6 space-y-6">
        <h1 className="text-3xl font-serif font-bold text-center mb-2 tracking-wide">
          Checkout
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="font-semibold text-lg mb-2">Your Details</div>
            <FormField label="Name" error={errors.name} required htmlFor="name">
              <Input
                id="name"
                placeholder="Name"
                value={form.name}
                onChange={update("name")}
                className={errors.name ? "border-red-500" : ""}
              />
            </FormField>
            <FormField
              label="Email"
              error={errors.email}
              required
              htmlFor="email"
            >
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={update("email")}
                className={errors.email ? "border-red-500" : ""}
              />
            </FormField>
            <FormField
              label="Phone"
              error={errors.phone}
              required
              htmlFor="phone"
            >
              <Input
                id="phone"
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={update("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
            </FormField>
            <FormField label="Notes" htmlFor="notes" hint="Optional">
              <Textarea
                id="notes"
                placeholder="Any special requests or notes"
                value={form.notes}
                onChange={update("notes")}
              />
            </FormField>

            {/* Sign-in prompt for guests */}
            {!user && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">ℹ️</span>
                  <div>
                    <span className="text-gray-700">
                      <Link
                        to="/login"
                        state={{ from: location.pathname }}
                        className="text-brand-600 hover:text-brand-700 font-medium underline"
                      >
                        Sign in
                      </Link>{" "}
                      or{" "}
                      <Link
                        to="/register"
                        state={{ from: location.pathname }}
                        className="text-brand-600 hover:text-brand-700 font-medium underline"
                      >
                        create an account
                      </Link>{" "}
                      to track your bookings and easily rebook in the future.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Cancellation Policy Link */}
            <div className="mt-3 text-xs text-gray-600 flex items-center gap-1.5">
              <span>📋</span>
              <span>Review our</span>
              <Link
                to="/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 underline font-medium"
              >
                cancellation policy
              </Link>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                disabled={loading}
                loading={loading}
                onClick={() => submit("pay_now")}
                variant="brand"
                className="w-full"
              >
                Pay now
              </Button>
              <Button
                disabled={loading}
                onClick={() => submit("deposit")}
                variant="default"
                className="w-full"
              >
                Pay deposit
              </Button>
              {/* <Button
                disabled={loading}
                onClick={() => submit("pay_in_salon")}
                variant="outline"
                className="w-full"
              >
                Pay at salon
              </Button> */}
            </div>
          </div>
          <div>
            <Card className="p-5 bg-gray-50 border-0 rounded-2xl shadow-none">
              <div className="font-semibold mb-3 text-lg">Summary</div>
              <div className="text-sm text-gray-600">Service</div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  {service?.name} — {booking.variantName}
                </div>
                <div className="font-semibold">
                  £{Number(booking.price || 0).toFixed(2)}
                </div>
              </div>
              {booking.startISO && (
                <>
                  <div className="text-sm text-gray-600 mt-3">Time</div>
                  <div>{new Date(booking.startISO).toLocaleString()}</div>
                </>
              )}
            </Card>
          </div>
        </div>
      </Card>
    </PageTransition>
  );
}
