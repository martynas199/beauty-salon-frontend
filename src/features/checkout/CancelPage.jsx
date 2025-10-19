import { Link, useLocation } from "react-router-dom";

export default function CancelPage() {
  const q = new URLSearchParams(useLocation().search);
  const appointmentId = q.get("appointmentId");
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-red-600"
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
      </div>
      <h1 className="text-2xl font-bold mb-2 text-center">Payment Canceled</h1>
      <p className="text-gray-700 text-center max-w-md">
        Your payment was canceled. Your reserved slot may expire if not
        completed soon.
      </p>
      {appointmentId && (
        <p className="text-gray-600 text-center mt-2">
          Appointment ID: {appointmentId}
        </p>
      )}
      <Link
        to="/checkout"
        className="text-brand-600 underline mt-6 inline-block font-medium"
      >
        Return to checkout
      </Link>
    </div>
  );
}
