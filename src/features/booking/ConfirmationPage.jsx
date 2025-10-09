export default function ConfirmationPage(){
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">Booking confirmed</h1>
      <p className="text-gray-700">We’ve sent confirmation emails to you and your beautician.</p>
      <a className="text-blue-600 underline mt-4 inline-block" href="/">Back to services</a>
    </div>
  );
}
