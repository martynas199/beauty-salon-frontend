import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const CheckIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
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
);

export default function FeatureSubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Redirect to features page after 3 seconds
    const timer = setTimeout(() => {
      navigate("/admin/features");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckIcon className="text-gray-900 w-8 h-8" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Activated!
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          Your <strong>No Fee Bookings</strong> feature is now active. Your
          clients can book without paying the £1.00 booking fee!
        </p>

        <div className="bg-brand-50 rounded-lg p-4 mb-6 border border-brand-200">
          <p className="text-sm text-gray-600">
            You'll be charged £9.99 per month. You can cancel anytime from your
            Features page.
          </p>
        </div>

        <p className="text-gray-500 text-sm">
          Redirecting to Features page in 3 seconds...
        </p>

        <button
          onClick={() => navigate("/admin/features")}
          className="mt-4 text-brand-700 hover:text-brand-800 font-semibold underline"
        >
          Go now
        </button>
      </motion.div>
    </div>
  );
}
