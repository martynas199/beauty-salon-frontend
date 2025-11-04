import { useState, useEffect } from "react";
import { OrdersAPI } from "../../features/orders/orders.api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Orders() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await OrdersAPI.list({});
      setAllOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders locally
  const orders =
    filter === "all"
      ? allOrders
      : allOrders.filter((order) => order.orderStatus === filter);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const updated = await OrdersAPI.update(orderId, {
        orderStatus: newStatus,
      });
      setAllOrders(allOrders.map((o) => (o._id === orderId ? updated : o)));
      setSelectedOrder(updated);
      alert("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async (orderId, trackingNumber) => {
    try {
      setUpdating(true);
      const updated = await OrdersAPI.update(orderId, { trackingNumber });
      setAllOrders(allOrders.map((o) => (o._id === orderId ? updated : o)));
      setSelectedOrder(updated);
      alert("Tracking number updated successfully");
    } catch (error) {
      console.error("Error updating tracking:", error);
      alert("Failed to update tracking number");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !confirm(
        "Are you sure you want to cancel this order? Stock will be restored."
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      const updated = await OrdersAPI.cancel(orderId);
      setAllOrders(allOrders.map((o) => (o._id === orderId ? updated : o)));
      setSelectedOrder(updated);
      alert("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">
          Manage customer orders and fulfillment
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          "all",
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-brand-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-brand-600"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "No orders have been placed yet"
              : `No ${filter} orders found`}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Order Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            Order: {order.orderStatus}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Customer:</span>{" "}
                          {order.shippingAddress.firstName}{" "}
                          {order.shippingAddress.lastName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {order.shippingAddress.email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {order.shippingAddress.phone}
                        </p>
                        <p>
                          <span className="font-medium">Items:</span>{" "}
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                        <p>
                          <span className="font-medium">Total:</span> £
                          {order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </Button>

                  {order.orderStatus === "pending" && (
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(order._id, "processing")
                      }
                      disabled={updating}
                    >
                      Mark Processing
                    </Button>
                  )}

                  {order.orderStatus === "processing" && (
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleUpdateStatus(order._id, "shipped")}
                      disabled={updating}
                    >
                      Mark Shipped
                    </Button>
                  )}

                  {order.orderStatus === "shipped" && (
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleUpdateStatus(order._id, "delivered")}
                      disabled={updating}
                    >
                      Mark Delivered
                    </Button>
                  )}

                  {!["cancelled", "delivered", "refunded"].includes(
                    order.orderStatus
                  ) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={updating}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Order {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        selectedOrder.orderStatus
                      )}`}
                    >
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                        selectedOrder.paymentStatus
                      )}`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.title}
                        </h4>
                        {item.size && (
                          <p className="text-sm text-gray-500">
                            Size: {item.size}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          Qty: {item.quantity} × £{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      £{selectedOrder.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {selectedOrder.shipping === 0
                        ? "FREE"
                        : `£${selectedOrder.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (20%)</span>
                    <span className="font-medium">
                      £{selectedOrder.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>£{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {selectedOrder.shippingAddress.firstName}{" "}
                    {selectedOrder.shippingAddress.lastName}
                  </p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p className="pt-2">
                    <span className="text-gray-500">Email:</span>{" "}
                    {selectedOrder.shippingAddress.email}
                  </p>
                  <p>
                    <span className="text-gray-500">Phone:</span>{" "}
                    {selectedOrder.shippingAddress.phone}
                  </p>
                </div>
              </div>

              {/* Tracking Number */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Tracking Information
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={selectedOrder.trackingNumber || ""}
                    placeholder="Enter tracking number"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateTracking(selectedOrder._id, e.target.value);
                      }
                    }}
                  />
                  <Button
                    variant="brand"
                    onClick={(e) => {
                      const input = e.target
                        .closest("div")
                        .querySelector("input");
                      handleUpdateTracking(selectedOrder._id, input.value);
                    }}
                    disabled={updating}
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Notes
                  </h3>
                  <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Placed:</span>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  {selectedOrder.shippedAt && (
                    <p className="text-gray-600">
                      <span className="font-medium">Shipped:</span>{" "}
                      {new Date(selectedOrder.shippedAt).toLocaleString()}
                    </p>
                  )}
                  {selectedOrder.deliveredAt && (
                    <p className="text-gray-600">
                      <span className="font-medium">Delivered:</span>{" "}
                      {new Date(selectedOrder.deliveredAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
