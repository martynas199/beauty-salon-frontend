import { useEffect } from "react";

export default function NoFeeBookingsOverlayModal({
  open,
  onClose,
  onGoToFeatures,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-[101] flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-brand-200 bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-4 inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900">
            Required Subscription
          </div>

          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Platform Subscription Required
          </h2>

          <p className="mt-3 text-sm text-gray-700 sm:text-base">
            An active subscription is required for beauticians to use the
            platform. This subscription also keeps the No Fee Bookings benefit
            active, so clients can continue booking without the GBP 1.00
            booking fee.
          </p>

          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              Plan: GBP 9.99 / month
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Subscription is managed in Premium Features.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Remind me later
            </button>
            <button
              type="button"
              onClick={onGoToFeatures}
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-brand-600"
            >
              Open Subscription Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
