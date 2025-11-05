import { useEffect, useState } from "react";
import { api } from "../../lib/apiClient";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/forms/FormField";
import Button from "../../components/ui/Button";

export default function Appointments() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [preview, setPreview] = useState(null);
  const [reason, setReason] = useState("Admin initiated");
  const [submitting, setSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "start",
    direction: "desc",
  });

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [services, setServices] = useState([]);
  const [beauticians, setBeauticians] = useState([]);

  // Filter state
  const [selectedBeauticianId, setSelectedBeauticianId] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, day, week, month, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments?page=${page}&limit=50`);

      if (response.data.data) {
        // Paginated response
        setRows(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else {
        // Legacy response (array)
        setRows(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(pagination.page);

    // Load services and beauticians for edit modal
    api
      .get("/services")
      .then((r) => setServices(r.data || []))
      .catch(() => {});
    api
      .get("/beauticians")
      .then((r) => setBeauticians(r.data || []))
      .catch(() => {});
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Helper function to get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let start, end;

    switch (dateFilter) {
      case "day":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "week":
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + diff
        );
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
        }
        break;
      default:
        return null;
    }

    return start && end ? { start, end } : null;
  };

  // Filter by beautician and date
  let filteredRows = rows;

  // Apply beautician filter
  if (selectedBeauticianId) {
    filteredRows = filteredRows.filter((r) => {
      const beauticianId =
        typeof r.beauticianId === "object" && r.beauticianId?._id
          ? r.beauticianId._id
          : r.beauticianId;
      return String(beauticianId) === String(selectedBeauticianId);
    });
  }

  // Apply date filter
  const dateRange = getDateRange();
  if (dateRange) {
    filteredRows = filteredRows.filter((r) => {
      const appointmentDate = new Date(r.start);
      return (
        appointmentDate >= dateRange.start && appointmentDate < dateRange.end
      );
    });
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredRows = filteredRows.filter((r) => {
      return (
        r.client?.name?.toLowerCase().includes(query) ||
        r.client?.email?.toLowerCase().includes(query) ||
        r.client?.phone?.toLowerCase().includes(query) ||
        r.beautician?.name?.toLowerCase().includes(query) ||
        r.service?.name?.toLowerCase().includes(query) ||
        r.variantName?.toLowerCase().includes(query)
      );
    });
  }

  const sortedRows = [...filteredRows].sort((a, b) => {
    let aVal, bVal;

    switch (sortConfig.key) {
      case "client":
        aVal = a.client?.name || "";
        bVal = b.client?.name || "";
        break;
      case "staff":
        aVal = a.beautician?.name || a.beauticianId || "";
        bVal = b.beautician?.name || b.beauticianId || "";
        break;
      case "service":
        aVal = `${a.service?.name || a.serviceId} - ${a.variantName}`;
        bVal = `${b.service?.name || b.serviceId} - ${b.variantName}`;
        break;
      case "start":
        aVal = new Date(a.start).getTime();
        bVal = new Date(b.start).getTime();
        break;
      case "price":
        aVal = Number(a.price || 0);
        bVal = Number(b.price || 0);
        break;
      case "status":
        aVal = a.status || "";
        bVal = b.status || "";
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  async function openCancelModal(id) {
    try {
      const prev = await api
        .get(`/appointments/${id}/cancel/preview`)
        .then((r) => r.data);
      setPreview(prev);
      setActiveId(id);
      setModalOpen(true);
    } catch (e) {
      alert(e.message || "Failed to load preview");
    }
  }

  async function confirmCancel() {
    if (!activeId) return;
    setSubmitting(true);
    try {
      const res = await api
        .post(`/appointments/${activeId}/cancel`, {
          requestedBy: "staff",
          reason: reason || undefined,
        })
        .then((r) => r.data);
      setRows((old) =>
        old.map((x) =>
          x._id === activeId
            ? {
                ...x,
                status: res.status,
                cancelledAt: new Date().toISOString(),
              }
            : x
        )
      );
      setModalOpen(false);
      setActiveId("");
      setPreview(null);
      setReason("Admin initiated");
    } catch (e) {
      alert(e.message || "Failed to cancel");
    } finally {
      setSubmitting(false);
    }
  }

  async function markAsNoShow(id) {
    if (!confirm("Mark this appointment as No Show?")) return;

    try {
      const res = await api
        .patch(`/appointments/${id}/status`, {
          status: "no_show",
        })
        .then((r) => r.data);

      setRows((old) =>
        old.map((x) => (x._id === id ? { ...x, status: res.status } : x))
      );
    } catch (e) {
      alert(e.message || "Failed to update status");
    }
  }

  function openEditModal(appointment) {
    setEditingAppointment({
      _id: appointment._id,
      clientName: appointment.client?.name || "",
      clientEmail: appointment.client?.email || "",
      clientPhone: appointment.client?.phone || "",
      clientNotes: appointment.client?.notes || "",
      beauticianId: appointment.beauticianId || "",
      serviceId: appointment.serviceId || "",
      variantName: appointment.variantName || "",
      start: appointment.start
        ? new Date(appointment.start).toISOString().slice(0, 16)
        : "",
      end: appointment.end
        ? new Date(appointment.end).toISOString().slice(0, 16)
        : "",
      price: appointment.price || 0,
    });
    setEditModalOpen(true);
  }

  async function saveEdit() {
    if (!editingAppointment) return;
    setSubmitting(true);

    try {
      const res = await api
        .patch(`/appointments/${editingAppointment._id}`, {
          client: {
            name: editingAppointment.clientName,
            email: editingAppointment.clientEmail,
            phone: editingAppointment.clientPhone,
            notes: editingAppointment.clientNotes,
          },
          beauticianId: editingAppointment.beauticianId,
          serviceId: editingAppointment.serviceId,
          variantName: editingAppointment.variantName,
          start: editingAppointment.start,
          end: editingAppointment.end,
          price: Number(editingAppointment.price),
        })
        .then((r) => r.data);

      if (res.success && res.appointment) {
        setRows((old) =>
          old.map((x) =>
            x._id === editingAppointment._id ? res.appointment : x
          )
        );
      }

      setEditModalOpen(false);
      setEditingAppointment(null);
    } catch (e) {
      alert(
        e.response?.data?.error || e.message || "Failed to update appointment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">
        Appointments
      </h1>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, phone, service..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
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
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Beautician Filter */}
          <FormField
            label="Beautician"
            htmlFor="beautician-filter"
            className="flex-1"
          >
            <select
              id="beautician-filter"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedBeauticianId}
              onChange={(e) => setSelectedBeauticianId(e.target.value)}
            >
              <option value="">All Beauticians</option>
              {beauticians.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Date Filter */}
          <FormField
            label="Date Range"
            htmlFor="date-filter"
            className="flex-1"
          >
            <select
              id="date-filter"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </FormField>
        </div>

        {/* Custom Date Range */}
        {dateFilter === "custom" && (
          <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t">
            <FormField
              label="Start Date"
              htmlFor="start-date"
              className="flex-1"
            >
              <input
                id="start-date"
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </FormField>
            <FormField label="End Date" htmlFor="end-date" className="flex-1">
              <input
                id="end-date"
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white border rounded-lg">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading appointments...</p>
          <p className="mt-1 text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && (
        <div className="hidden lg:block overflow-auto border rounded-lg bg-white shadow-sm">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  label="Client"
                  sortKey="client"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Staff"
                  sortKey="staff"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Service"
                  sortKey="service"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Start"
                  sortKey="start"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Price"
                  sortKey="price"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
              <tr key={r._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.client?.name}</td>
                <td className="p-3">{r.beautician?.name || r.beauticianId}</td>
                <td className="p-3">
                  {r.service?.name || r.serviceId} - {r.variantName}
                </td>
                <td className="p-3">
                  {new Date(r.start).toLocaleString("en-GB", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="p-3 font-semibold text-green-700">
                  £{Number(r.price || 0).toFixed(2)}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      r.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : r.status === "reserved_unpaid"
                        ? "bg-yellow-100 text-yellow-800"
                        : String(r.status).startsWith("cancelled")
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      className="border rounded px-3 py-1.5 text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => openEditModal(r)}
                      title="Edit Appointment"
                    >
                      Edit
                    </button>
                    <button
                      className="border rounded px-3 py-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                      disabled={
                        String(r.status || "").startsWith("cancelled") ||
                        r.status === "no_show"
                      }
                      onClick={() => openCancelModal(r._id)}
                    >
                      Cancel
                    </button>
                    <button
                      className="border rounded px-3 py-1.5 text-sm text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      disabled={
                        String(r.status || "").startsWith("cancelled") ||
                        r.status === "no_show"
                      }
                      onClick={() => markAsNoShow(r._id)}
                      title="Mark as No Show"
                    >
                      No Show
                    </button>
                  </div>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && (
        <div className="lg:hidden space-y-3">
        {sortedRows.map((r) => (
          <div key={r._id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-lg">{r.client?.name}</div>
                <div className="text-sm text-gray-600">
                  {r.beautician?.name || r.beauticianId}
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  r.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : r.status === "reserved_unpaid"
                    ? "bg-yellow-100 text-yellow-800"
                    : String(r.status).startsWith("cancelled")
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {r.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="text-gray-500 w-20">Service:</span>
                <span className="flex-1 font-medium">
                  {r.service?.name || r.serviceId} - {r.variantName}
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 w-20">Time:</span>
                <span className="flex-1">
                  {new Date(r.start).toLocaleString("en-GB", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 w-20">Price:</span>
                <span className="flex-1 font-semibold text-green-700">
                  £{Number(r.price || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t space-y-2">
              <button
                className="w-full border rounded-lg px-4 py-2 text-sm text-blue-600 border-blue-200 hover:bg-blue-50 font-medium"
                onClick={() => openEditModal(r)}
              >
                Edit Appointment
              </button>
              <div className="flex gap-2">
                <button
                  className="flex-1 border rounded-lg px-4 py-2 text-sm text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 font-medium"
                  disabled={
                    String(r.status || "").startsWith("cancelled") ||
                    r.status === "no_show"
                  }
                  onClick={() => openCancelModal(r._id)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 border rounded-lg px-4 py-2 text-sm text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50 font-medium"
                  disabled={
                    String(r.status || "").startsWith("cancelled") ||
                    r.status === "no_show"
                  }
                  onClick={() => markAsNoShow(r._id)}
                >
                  No Show
                </button>
              </div>
            </div>
          </div>
          ))}

          {sortedRows.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No appointments found
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} appointments
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAppointments(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              ← Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAppointments(pagination.page + 1)}
              disabled={!pagination.hasMore || loading}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      <CancelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preview={preview}
        reason={reason}
        setReason={setReason}
        onConfirm={confirmCancel}
        submitting={submitting}
      />

      <EditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingAppointment(null);
        }}
        appointment={editingAppointment}
        setAppointment={setEditingAppointment}
        services={services}
        beauticians={beauticians}
        onSave={saveEdit}
        submitting={submitting}
      />
    </div>
  );
}

function CancelModal({
  open,
  onClose,
  preview,
  reason,
  setReason,
  onConfirm,
  submitting,
}) {
  const refund = (Number(preview?.refundAmount || 0) / 100).toFixed(2);
  const status = String(preview?.status || "").replaceAll("_", " ");
  return (
    <Modal open={open} onClose={onClose} title="Cancel appointment">
      {preview ? (
        <>
          <div className="text-sm text-gray-700">
            Outcome: <span className="font-medium capitalize">{status}</span>
          </div>
          <div className="text-sm text-gray-700">
            Refund: <span className="font-medium">£{refund}</span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Reason (optional)
            </label>
            <input
              className="border rounded w-full px-3 py-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              className="border rounded px-3 py-2"
              onClick={onClose}
              disabled={submitting}
            >
              Close
            </button>
            <button
              className="border rounded px-3 py-2 bg-red-600 text-white disabled:opacity-50"
              onClick={onConfirm}
              disabled={submitting}
            >
              Confirm cancel
            </button>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-600">Loading preview…</div>
      )}
    </Modal>
  );
}

function EditModal({
  open,
  onClose,
  appointment,
  setAppointment,
  services,
  beauticians,
  onSave,
  submitting,
}) {
  if (!appointment) return null;

  const updateField = (field, value) => {
    setAppointment((prev) => ({ ...prev, [field]: value }));
  };

  const selectedService = services.find((s) => s._id === appointment.serviceId);
  const variants = selectedService?.variants || [];

  return (
    <Modal open={open} onClose={onClose} title="Edit Appointment">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Client Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Client Information</h3>
          <FormField label="Name" htmlFor="client-name">
            <input
              type="text"
              id="client-name"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
            />
          </FormField>
          <FormField label="Email" htmlFor="client-email">
            <input
              type="email"
              id="client-email"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientEmail}
              onChange={(e) => updateField("clientEmail", e.target.value)}
            />
          </FormField>
          <FormField label="Phone" htmlFor="client-phone">
            <input
              type="tel"
              id="client-phone"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
            />
          </FormField>
          <FormField label="Notes" htmlFor="client-notes">
            <textarea
              id="client-notes"
              className="border rounded w-full px-3 py-2"
              rows="2"
              value={appointment.clientNotes}
              onChange={(e) => updateField("clientNotes", e.target.value)}
            />
          </FormField>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3 pt-3 border-t">
          <h3 className="font-semibold text-gray-900">Appointment Details</h3>
          <FormField label="Beautician" htmlFor="beautician-select">
            <select
              id="beautician-select"
              className="border rounded w-full px-3 py-2"
              value={appointment.beauticianId}
              onChange={(e) => updateField("beauticianId", e.target.value)}
            >
              <option value="">Select Beautician</option>
              {beauticians.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Service" htmlFor="service-select">
            <select
              id="service-select"
              className="border rounded w-full px-3 py-2"
              value={appointment.serviceId}
              onChange={(e) => {
                updateField("serviceId", e.target.value);
                updateField("variantName", "");
              }}
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Variant" htmlFor="variant-select">
            <select
              id="variant-select"
              className="border rounded w-full px-3 py-2"
              value={appointment.variantName}
              onChange={(e) => updateField("variantName", e.target.value)}
              disabled={!appointment.serviceId}
            >
              <option value="">Select Variant</option>
              {variants.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} - £{v.price} ({v.durationMin}min)
                </option>
              ))}
            </select>
          </FormField>
          <div className="w-full max-w-full overflow-hidden">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full"
              style={{ minWidth: 0 }}
            >
              <FormField label="Start Time" htmlFor="start-time">
                <input
                  type="datetime-local"
                  id="start-time"
                  className="appearance-none box-border w-full max-w-full border rounded px-2 py-1.5 text-[16px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500 overflow-hidden"
                  style={{ minWidth: 0, maxWidth: "100%" }}
                  value={appointment.start}
                  onChange={(e) => updateField("start", e.target.value)}
                />
              </FormField>
              <FormField label="End Time" htmlFor="end-time">
                <input
                  type="datetime-local"
                  id="end-time"
                  className="appearance-none box-border w-full max-w-full border rounded px-2 py-1.5 text-[16px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500 overflow-hidden"
                  style={{ minWidth: 0, maxWidth: "100%" }}
                  value={appointment.end}
                  onChange={(e) => updateField("end", e.target.value)}
                />
              </FormField>
            </div>
          </div>
          <FormField label="Price (£)" htmlFor="price">
            <input
              type="number"
              id="price"
              step="0.01"
              className="border rounded w-full px-3 py-2"
              value={appointment.price}
              onChange={(e) => updateField("price", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
        <Button variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="brand"
          onClick={onSave}
          disabled={submitting}
          loading={submitting}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <th
      className="text-left p-2 cursor-pointer hover:bg-gray-100 select-none transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className={isActive ? "text-gray-900" : "text-gray-500"}>
          {isActive ? (
            direction === "asc" ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
          )}
        </span>
      </div>
    </th>
  );
}
