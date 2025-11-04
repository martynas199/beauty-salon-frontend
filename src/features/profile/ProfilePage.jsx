import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import { getUserBookings, getUserOrders, cancelBooking } from "./profile.api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../../components/ui/PageTransition";
import { ListSkeleton } from "../../components/ui/Skeleton";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    user,
    token,
    logout,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");
  const [dataFetched, setDataFetched] = useState(false);

  // Redirect if not authenticated (but wait for auth to finish loading first)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: "/profile" } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch data on mount only (wait for auth loading to complete)
  useEffect(() => {
    if (!authLoading && isAuthenticated && token && !dataFetched) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, token, dataFetched]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsData, ordersData] = await Promise.all([
        getUserBookings(token),
        getUserOrders(token),
      ]);
      setBookings(bookingsData.bookings || []);
      setOrders(ordersData.orders || []);
      setDataFetched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const reason = prompt(
        "Please provide a reason for cancellation (optional):"
      );
      const loadingToast = toast.loading("Cancelling booking...");
      await cancelBooking(token, bookingId, reason);
      // Update booking status locally instead of fetching all data again
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled_full_refund" }
            : booking
        )
      );
      toast.dismiss(loadingToast);
      toast.success("Booking cancelled successfully");
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  const handleRebook = (booking) => {
    // Navigate to booking page with pre-filled service and beautician
    navigate(
      `/booking?serviceId=${booking.serviceId._id}&beauticianId=${booking.beauticianId._id}`
    );
  };

  const handleRefreshOrders = async () => {
    try {
      setLoadingOrders(true);
      const ordersData = await getUserOrders(token);
      setOrders(ordersData.orders || []);
      toast.success("Orders refreshed");
    } catch (err) {
      toast.error("Failed to refresh orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "green",
      completed: "blue",
      reserved_unpaid: "yellow",
      cancelled_full_refund: "gray",
      cancelled_no_refund: "gray",
      cancelled_partial_refund: "gray",
      no_show: "red",
    };
    return colors[status] || "gray";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelBooking = (booking) => {
    if (!["confirmed", "reserved_unpaid"].includes(booking.status))
      return false;
    const appointmentTime = new Date(booking.start);
    const now = new Date();
    return appointmentTime > now;
  };

  // Show loading while auth is loading OR while fetching profile data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <ListSkeleton count={4} itemHeight="h-32" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wide">
            My Profile
          </h1>
          <p className="mt-2 text-gray-600 font-light">
            Welcome back, {user?.name}! Manage your bookings and account
            settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`${
                activeTab === "bookings"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              My Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`${
                activeTab === "orders"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              My Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`${
                activeTab === "settings"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    You haven't made any bookings yet.
                  </p>
                  <Button onClick={() => navigate("/services")}>
                    Book a Service
                  </Button>
                </Card>
              ) : (
                <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bookings.map((booking) => (
                    <StaggerItem key={booking._id}>
                      <Card hoverable className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.serviceId?.name || "Service"}
                          </h3>
                          <Chip color={getStatusColor(booking.status)}>
                            {booking.status.replace(/_/g, " ")}
                          </Chip>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p className="flex items-center">
                            <span className="font-medium mr-2">👤</span>
                            {booking.beauticianId?.name || "Beautician"}
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2">📅</span>
                            {formatDate(booking.start)}
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2">🕐</span>
                            {formatTime(booking.start)} -{" "}
                            {formatTime(booking.end)}
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2">💷</span>£
                            {booking.price?.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {canCancelBooking(booking) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          )}
                          {booking.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRebook(booking)}
                              className="flex-1"
                            >
                              Rebook
                            </Button>
                          )}
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Refresh Button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Orders
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshOrders}
                  disabled={loadingOrders}
                  className="flex items-center gap-2"
                >
                  <svg
                    className={`w-4 h-4 ${loadingOrders ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </Button>
              </div>

              {orders.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    You haven't placed any orders yet.
                  </p>
                  <Button onClick={() => navigate("/shop")}>
                    Browse Products
                  </Button>
                </Card>
              ) : (
                <StaggerContainer className="grid grid-cols-1 gap-4">
                  {orders.map((order) => (
                    <StaggerItem key={order._id}>
                      <Card hoverable className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.orderNumber || order._id.slice(-8)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <Chip
                            color={
                              order.paymentStatus === "paid"
                                ? "green"
                                : "yellow"
                            }
                          >
                            {order.orderStatus}
                          </Chip>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 py-2 items-center"
                            >
                              {/* Product Image */}
                              {(item.image?.url ||
                                item.productId?.image?.url) && (
                                <img
                                  src={
                                    item.image?.url ||
                                    item.productId?.image?.url
                                  }
                                  alt={item.title || item.productId?.title}
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium">
                                  {item.title || item.productId?.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity}
                                  {item.size && ` • Size: ${item.size}`}
                                </p>
                              </div>
                              <p className="font-medium whitespace-nowrap">
                                £{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-lg">Total</p>
                            <p className="font-bold text-lg">
                              £{order.total?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/order-success/${
                                  order.orderNumber || order._id.slice(-8)
                                }`
                              )
                            }
                            className="w-full"
                          >
                            View Order
                          </Button>
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{user?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2 text-gray-900">{user.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">
                      Member since:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile/edit")}
                    className="w-full sm:w-auto"
                  >
                    Edit Profile
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full sm:w-auto"
                  >
                    Sign Out
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
