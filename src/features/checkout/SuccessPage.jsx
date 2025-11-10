import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { BookingAPI } from "../booking/booking.api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SuccessPage() {
  const q = useQuery();
  const appointmentId = q.get("appointmentId");
  const sessionId = q.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | confirmed | pending | error
  const [appt, setAppt] = useState(null);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    let timeoutId = null;

    async function fetchAppt() {
      if (!appointmentId) {
        setStatus("error");
        return;
      }
      try {
        // Only call confirm endpoint once on first attempt
        if (attempts === 0 && sessionId) {
          try {
            const apiUrl =
              import.meta.env.VITE_API_URL || "http://localhost:4000";
            await fetch(
              `${apiUrl}/api/checkout/confirm?session_id=${encodeURIComponent(
                sessionId
              )}`
            );
          } catch {}
        }

        const a = await BookingAPI.getOne(appointmentId);
        if (!mounted) return;
        setAppt(a);

        if (a?.status === "confirmed") {
          setStatus("confirmed");
          return;
        }

        // Wait for webhook to confirm; poll with increasing intervals up to 10 attempts
        attempts++;
        if (attempts < 10) {
          setStatus("pending");
          // Increase delay: 1s, 2s, 3s, etc.
          timeoutId = setTimeout(fetchAppt, attempts * 1000);
        } else {
          setStatus("pending"); // still pending; show message
        }
      } catch (e) {
        if (!mounted) return;
        setStatus("error");
      }
    }

    fetchAppt();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [appointmentId, sessionId]);

  const title =
    status === "confirmed"
      ? "Booking confirmed"
      : status === "pending"
      ? "Payment received"
      : status === "loading"
      ? "Verifying payment"
      : "Something went wrong";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4">
      {status === "confirmed" ? (
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      ) : status === "pending" ? (
        <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3"
            />
          </svg>
        </div>
      ) : status === "error" ? (
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
      ) : null}
      <h1 className="text-2xl font-bold mb-2 text-center">{title}</h1>
      {status === "loading" && (
        <p className="text-gray-700 text-center">
          Hold on while we verify your payment…
        </p>
      )}
      {status === "pending" && (
        <p className="text-gray-700 text-center">
          We received your payment. Your booking will be confirmed shortly. This
          can take a moment if the webhook is still processing.
        </p>
      )}
      {status === "confirmed" && appt && (
        <div className="border rounded-2xl p-4 bg-gray-50 mt-4 w-full max-w-md">
          <div className="font-medium mb-1">
            {appt?.service?.name} — {appt?.variantName}
          </div>
          <div className="text-gray-700">
            With: {appt?.beautician?.name || "Any stylist"}
          </div>
          <div className="text-gray-700">
            When: {new Date(appt.start).toLocaleString()}
          </div>
          <div className="text-gray-700">
            Service Price: £{Number(appt.price || 0).toFixed(2)}
          </div>

          {/* Show payment breakdown for deposits */}
          {appt.payment?.mode === "deposit" && appt.payment?.amountTotal && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <div className="text-xs font-semibold text-green-800 mb-2">
                  💳 Payment Details
                </div>
                <div className="text-sm text-green-700 flex justify-between">
                  <span>Deposit:</span>
                  <span className="font-semibold">
                    £{((appt.payment.amountTotal - 50) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-green-700 flex justify-between">
                  <span>Booking Fee:</span>
                  <span className="font-semibold">£0.50</span>
                </div>
                <div className="text-sm text-green-700 flex justify-between pt-2 mt-2 border-t border-green-200">
                  <span className="font-semibold">Total Paid:</span>
                  <span className="font-bold">
                    £{(appt.payment.amountTotal / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <div className="text-xs font-semibold text-yellow-800 mb-1">
                  💰 Remaining Balance
                </div>
                <div className="text-lg font-bold text-yellow-900">
                  £
                  {(
                    Number(appt.price || 0) -
                    (appt.payment.amountTotal - 50) / 100
                  ).toFixed(2)}
                </div>
                <div className="text-xs text-yellow-700 mt-1">
                  To be paid at the salon
                </div>
              </div>
            </div>
          )}

          {/* Show simple status for full payment or pay at salon */}
          {appt.payment?.mode !== "deposit" && (
            <div className="text-green-700 mt-2 font-semibold">
              Status: {appt.status}
            </div>
          )}
        </div>
      )}
      {status === "error" && (
        <p className="text-red-600 text-center mb-4">
          Could not verify your booking. Please contact the salon with your
          email and time of payment.
        </p>
      )}
      <Link
        to="/"
        className="px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors duration-200 shadow-md hover:shadow-lg inline-block mt-8"
      >
        Back to Services
      </Link>
    </div>
  );
}
