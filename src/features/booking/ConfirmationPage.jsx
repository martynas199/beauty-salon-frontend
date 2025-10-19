export default function ConfirmationPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4">
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
      <h1 className="text-2xl font-bold mb-2 text-center">Booking Confirmed</h1>
      <p className="text-gray-700 text-center max-w-md mb-8">
        We've sent confirmation emails to you and your stylist. Thank you for
        booking with us!
      </p>
      <a
        className="px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors duration-200 shadow-md hover:shadow-lg inline-block"
        href="/"
      >
        Back to Services
      </a>
    </div>
  );
}
