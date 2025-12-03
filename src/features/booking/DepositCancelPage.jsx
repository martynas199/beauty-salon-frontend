import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import Button from "../../components/ui/Button";
import { motion } from "framer-motion";

export default function DepositCancelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const loadAppointment = async () => {
    try {
      const response = await api.get(`/appointments/${id}`);
      setAppointment(response);
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

  const handleRetryPayment = () => {
    if (appointment?.payment?.checkoutUrl) {
      setRetrying(true);
      window.location.href = appointment.payment.checkoutUrl;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Warning Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            Your deposit payment was not completed
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-6 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Appointment Not Yet Confirmed
              </h3>
              <p className="text-amber-800 text-sm">
                Your appointment slot is temporarily reserved, but you must
                complete the deposit payment to secure your booking. The payment
                link remains active.
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Appointment Details
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Service</p>
              <p className="font-semibold text-gray-900">
                {appointment.service?.name || appointment.variantName}
                {appointment.variantName && ` - ${appointment.variantName}`}
              </p>
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
            </div>
          </div>
        </div>

        {/* Payment Required Notice */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Complete the deposit payment to confirm your appointment
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>You can retry payment using the button below</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Check your email for the payment link if you need it later
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {appointment.payment?.checkoutUrl && (
            <Button
              onClick={handleRetryPayment}
              variant="primary"
              className="flex-1"
              disabled={retrying}
            >
              {retrying ? "Redirecting..." : "Complete Payment Now"}
            </Button>
          )}
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1"
          >
            Back to Home
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow text-center">
          <p className="text-sm text-gray-600 mb-2">
            Need help or want to reschedule?
          </p>
          <p className="text-sm">
            Contact us at{" "}
            <a
              href="tel:+447928775746"
              className="text-brand-600 hover:text-brand-700 font-semibold"
            >
              +44 7928 775746
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
