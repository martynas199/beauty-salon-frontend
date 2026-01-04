import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../features/auth/authSlice";
import { api } from "../../lib/apiClient";
import toast from "react-hot-toast";

export default function BeauticianRevenue() {
  const admin = useSelector(selectAdmin);
  const [loading, setLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [revenueData, setRevenueData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch available months on mount
  useEffect(() => {
    fetchAvailableMonths();
  }, []);

  // Fetch data when month changes
  useEffect(() => {
    if (selectedMonth) {
      fetchRevenueData(selectedMonth);
    }
  }, [selectedMonth]);

  const fetchAvailableMonths = async () => {
    try {
      setLoading(true);
      const response = await api.get("/beautician-revenue/months");

      if (response.data.months && response.data.months.length > 0) {
        setAvailableMonths(response.data.months);
        // Auto-select the most recent month
        setSelectedMonth(response.data.months[0].value);
      } else {
        toast.error("No revenue data available yet");
      }
    } catch (error) {
      console.error("Failed to fetch available months:", error);
      toast.error(
        error.response?.data?.error || "Failed to load available months"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async (month) => {
    try {
      setFetchingData(true);
      const response = await api.get("/beautician-revenue/analytics", {
        params: { month },
      });
      setRevenueData(response.data);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
      toast.error(error.response?.data?.error || "Failed to load revenue data");
    } finally {
      setFetchingData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (!admin?.beauticianId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-yellow-600 mx-auto mb-4"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Beautician Profile Linked
          </h2>
          <p className="text-gray-600">
            Your admin account needs to be linked to a beautician profile to
            view revenue analytics. Please contact a super admin to link your
            account.
          </p>
        </div>
      </div>
    );
  }

  if (availableMonths.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-blue-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Revenue Data Yet
          </h2>
          <p className="text-gray-600">
            You don't have any completed and paid appointments yet. Revenue data
            will appear here once you have confirmed bookings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Revenue Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Track your earnings and payment breakdown
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="month-select"
            className="text-sm font-medium text-gray-700"
          >
            Select Month:
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
            disabled={fetchingData}
          >
            {availableMonths.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {fetchingData && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      )}

      {/* Revenue Data */}
      {!fetchingData && revenueData && (
        <>
          {/* Payment Method Breakdown - Main Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Method Breakdown
              </h2>
              <p className="text-gray-600">
                How your clients paid for their appointments
              </p>
            </div>

            {/* Total Received Summary */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium opacity-90">
                      Total Received
                    </h3>
                    <p className="text-sm opacity-90">
                      {revenueData.summary.totalAppointments} completed
                      appointments
                    </p>
                  </div>
                </div>
                <p className="text-5xl font-bold">
                  £{revenueData.summary.totalReceived.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deposit Method */}
              <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Partial Payment (Deposit)
                    </h3>
                    <p className="text-sm text-gray-600">
                      Client paid a deposit upfront, balance due later
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Money Received:
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        £
                        {revenueData.breakdown.depositPayments.amountReceived.toFixed(
                          2
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Number of bookings:</span>
                      <span className="font-semibold text-gray-900">
                        {revenueData.breakdown.depositPayments.count}
                      </span>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-3xl font-bold text-purple-600">
                      {revenueData.breakdown.depositPayments.percentage.toFixed(
                        1
                      )}
                      %
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      of total received
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Payment Method */}
              <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Full Payment
                    </h3>
                    <p className="text-sm text-gray-600">
                      Client paid complete amount (online or in salon)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Money Received:
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        £
                        {revenueData.breakdown.fullPayments.amountReceived.toFixed(
                          2
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Number of bookings:</span>
                      <span className="font-semibold text-gray-900">
                        {revenueData.breakdown.fullPayments.count}
                      </span>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-3xl font-bold text-green-600">
                      {revenueData.breakdown.fullPayments.percentage.toFixed(1)}
                      %
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      of total received
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Breakdown Bar */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Revenue Distribution (by payment method)
              </h3>
              <div className="h-10 flex rounded-lg overflow-hidden shadow-sm border-2 border-gray-200">
                {revenueData.breakdown.depositPayments.percentage > 0 && (
                  <div
                    className="bg-purple-500 flex items-center justify-center text-white text-sm font-semibold transition-all duration-500"
                    style={{
                      width: `${revenueData.breakdown.depositPayments.percentage}%`,
                    }}
                  >
                    {revenueData.breakdown.depositPayments.percentage > 15 &&
                      `Deposits: ${revenueData.breakdown.depositPayments.percentage.toFixed(
                        0
                      )}%`}
                  </div>
                )}
                {revenueData.breakdown.fullPayments.percentage > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold transition-all duration-500"
                    style={{
                      width: `${revenueData.breakdown.fullPayments.percentage}%`,
                    }}
                  >
                    {revenueData.breakdown.fullPayments.percentage > 15 &&
                      `Full: ${revenueData.breakdown.fullPayments.percentage.toFixed(
                        0
                      )}%`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stripe Connection Status */}
          <div
            className={`rounded-xl p-6 border-2 ${
              revenueData.beautician.stripeConnected
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  revenueData.beautician.stripeConnected
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {revenueData.beautician.stripeConnected ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  )}
                </svg>
              </div>
              <div>
                <h3
                  className={`font-semibold ${
                    revenueData.beautician.stripeConnected
                      ? "text-green-900"
                      : "text-yellow-900"
                  }`}
                >
                  Stripe Connect Status
                </h3>
                <p
                  className={`text-sm ${
                    revenueData.beautician.stripeConnected
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {revenueData.beautician.stripeConnected
                    ? "Your account is connected and ready to receive payouts"
                    : "Connect your Stripe account to receive automatic payouts"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
