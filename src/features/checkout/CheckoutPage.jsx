import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { CheckoutAPI } from "./checkout.api";
import { BookingAPI } from "../booking/booking.api";
import { setClient, setMode, setAppointmentId } from "../booking/bookingSlice";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { ServicesAPI } from "../services/services.api";
import BackBar from "../../components/ui/BackBar";

export default function CheckoutPage() {
  const booking = useSelector((s) => s.booking);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      if (mode === "pay_in_salon") {
        const res = await BookingAPI.reserveWithoutPayment({
          beauticianId: booking.any ? undefined : booking.beauticianId,
          any: booking.any,
          serviceId: booking.serviceId,
          variantName: booking.variantName,
          startISO: booking.startISO,
          client: form,
          mode: "pay_in_salon",
        });
        if (res?.appointmentId) dispatch(setAppointmentId(res.appointmentId));
        navigate("/confirmation");
      } else {
        const res = await CheckoutAPI.createSession({
          beauticianId: booking.any ? undefined : booking.beauticianId,
          any: booking.any,
          serviceId: booking.serviceId,
          variantName: booking.variantName,
          startISO: booking.startISO,
          client: form,
          mode,
        });
        if (res?.url) window.location.href = res.url;
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <BackBar onBack={() => navigate(-1)} />
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-2">Checkout</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="font-semibold text-lg mb-2">Your Details</div>
            <div>
              <Input
                placeholder="Name *"
                value={form.name}
                onChange={update("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={update("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Phone *"
                value={form.phone}
                onChange={update("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <Textarea
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={update("notes")}
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                disabled={loading}
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
              <Button
                disabled={loading}
                onClick={() => submit("pay_in_salon")}
                variant="outline"
                className="w-full"
              >
                Pay at salon
              </Button>
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
      </div>
    </div>
  );
}
