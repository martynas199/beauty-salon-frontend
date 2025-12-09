import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TimesIcon = ({ className = "w-6 h-6" }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function FeatureSubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
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
          <TimesIcon className="text-gray-900 w-8 h-8" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Cancelled
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          You cancelled the subscription process. No charges have been made.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            You can still subscribe to <strong>No Fee Bookings</strong> anytime
            from your Features page.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/features")}
          className="w-full bg-brand-500 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-brand-600 transition-all"
        >
          Back to Features
        </button>
      </motion.div>
    </div>
  );
}
