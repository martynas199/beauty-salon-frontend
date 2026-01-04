import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import Button from "../../components/ui/Button";
import { motion } from "framer-motion";

export default function BalancePaidPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.log("Balance paid - loaded appointment:", response);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Appointment Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the appointment you're looking for.
          </p>
          <Button variant="brand" onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const serviceName = appointment.serviceId?.name || "Service";
  const beauticianName = appointment.beauticianId?.name || "Beautician";
  const servicePrice = Number(appointment.price || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Thank You for Your Payment!
            </h1>
            <p className="text-green-50 text-lg">
              Your remaining balance has been paid successfully
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            variant="brand"
            onClick={() => navigate("/")}
            className="px-8 py-3"
          >
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
