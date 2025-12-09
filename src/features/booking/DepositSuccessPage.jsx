import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import Button from "../../components/ui/Button";
import { motion } from "framer-motion";

export default function DepositSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if this is a booking fee payment from URL parameter
  const searchParams = new URLSearchParams(window.location.search);
  const isBookingFee = searchParams.get("type") === "booking_fee";

  useEffect(() => {
    if (id) {
      loadAppointment();

      // Poll for payment confirmation (webhook might take a few seconds)
      const pollInterval = setInterval(async () => {
        try {
          const response = await api.get(`/appointments/${id}`);
          const appt = response.data || response;
          console.log(
            "Polling - status:",
            appt?.status,
            "payment status:",
            appt?.payment?.status
          );

          if (
            appt?.status === "confirmed" &&
            appt?.payment?.status === "succeeded"
          ) {
            // Payment confirmed, stop polling
            console.log("✓ Payment confirmed by webhook!");
            setAppointment(appt);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Poll error:", error);
        }
      }, 3000); // Check every 3 seconds

      // Clean up after 60 seconds
      const timeout = setTimeout(() => {
        console.log("Polling timeout - webhook may not have fired");
        clearInterval(pollInterval);
      }, 60000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    }
  }, [id]);

  const loadAppointment = async () => {
    try {
      const response = await api.get(`/appointments/${id}`);
      console.log("Deposit success - loaded appointment:", response);
      const appt = response.data || response;
      setAppointment(appt);
    } catch (error) {
      console.error("Failed to load appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount) => {
    if (!amount) return "£0.00";
    return `£${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Appointment Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find this appointment.
          </p>
          <Button onClick={() => navigate("/")} variant="primary">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Calculate payment details based on payment mode
  const paymentMode = appointment.payment?.mode;
  const isBookingFeePayment = paymentMode === "booking_fee" || isBookingFee;

  const platformFee = 50; // £0.50 in pence
  const totalPaid = appointment.payment?.amountTotal || 0; // Total in pence
  const totalPrice = (appointment.price || 0) * 100; // Convert price to pence

  // For booking fee: full service price is remaining
  // For deposit: calculate deposit and remaining balance
  const depositAmount = isBookingFeePayment ? 0 : totalPaid - platformFee;
  const remainingBalance = isBookingFeePayment
    ? totalPrice
    : totalPrice - depositAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Success Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isBookingFeePayment
              ? "Booking Fee Paid Successfully!"
              : "Deposit Paid Successfully!"}
          </h1>
          <p className="text-gray-600">Your appointment is now confirmed</p>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Appointment Details
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-semibold text-gray-900">
                  {appointment.service?.name || "Service"}
                  {appointment.variantName && ` - ${appointment.variantName}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-semibold text-gray-900">
                  £{(appointment.price || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">Beautician</p>
              <p className="font-semibold text-gray-900">
                {appointment.beautician?.name || "Not assigned"}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-semibold text-gray-900">
                {formatDate(appointment.start)}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">Client</p>
              <p className="font-semibold text-gray-900">
                {appointment.client?.name}
              </p>
              <p className="text-sm text-gray-600">
                {appointment.client?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Payment Summary
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {isBookingFeePayment ? (
                // Booking fee payment summary
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking fee paid:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(totalPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold text-gray-900">
                      Total paid:
                    </span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatPrice(totalPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between bg-amber-50 -mx-6 px-6 py-3">
                    <span className="text-amber-900 font-medium">
                      Remaining balance (pay at salon):
                    </span>
                    <span className="font-bold text-amber-900">
                      {formatPrice(remainingBalance)}
                    </span>
                  </div>
                </>
              ) : (
                // Deposit payment summary
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit paid:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(depositAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform fee:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(platformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold text-gray-900">
                      Total paid:
                    </span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatPrice(totalPaid)}
                    </span>
                  </div>
                  {remainingBalance > 0 && (
                    <div className="flex justify-between bg-amber-50 -mx-6 px-6 py-3">
                      <span className="text-amber-900 font-medium">
                        Remaining balance:
                      </span>
                      <span className="font-bold text-amber-900">
                        {formatPrice(remainingBalance)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {remainingBalance > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> The remaining balance of{" "}
                  {formatPrice(remainingBalance)} is due at your appointment.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Badge */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Appointment Confirmed
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/")}
            variant="primary"
            className="flex-1"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => navigate("/my-appointments")}
            variant="outline"
            className="flex-1"
          >
            View My Appointments
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow text-center">
          <p className="text-sm text-gray-600">
            A confirmation email has been sent to{" "}
            <span className="font-semibold">{appointment.client?.email}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
