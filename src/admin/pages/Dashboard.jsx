import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../features/auth/authSlice";
import { api } from "../../lib/apiClient";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../locales/adminTranslations";

const localizer = dayjsLocalizer(dayjs);

export default function Dashboard() {
  const { language } = useLanguage();
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";
  const [allAppointments, setAllAppointments] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  const [selectedBeautician, setSelectedBeautician] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch appointments and beauticians in parallel
      const [appointmentsRes, beauticiansRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/beauticians", { params: { limit: 1000 } }),
      ]);

      let appointments = appointmentsRes.data || [];
      const beauticiansData = beauticiansRes.data || [];

      console.log("[Dashboard] Admin info:", {
        admin: admin,
        isSuperAdmin,
        beauticianId: admin?.beauticianId,
        role: admin?.role,
      });

      // Filter appointments based on admin role and linked beautician
      if (isSuperAdmin) {
        // Super admin sees all appointments
        console.log(
          "[Dashboard] Super admin - showing all appointments:",
          appointments.length
        );
      } else if (admin?.beauticianId) {
        // Regular admin with linked beautician - only show their beautician's appointments
        const originalCount = appointments.length;
        appointments = appointments.filter(
          (apt) => apt.beauticianId?._id === admin.beauticianId
        );
        console.log(
          `[Dashboard] Regular admin with beautician ${admin.beauticianId} - filtered from ${originalCount} to ${appointments.length} appointments`
        );
        // Auto-select the beautician's filter
        setSelectedBeautician(admin.beauticianId);
      } else {
        // Regular admin without linked beautician - show no appointments
        console.log(
          "[Dashboard] Regular admin without linked beautician - showing no appointments"
        );
        appointments = [];
      }

      setAllAppointments(appointments);
      setBeauticians(beauticiansData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [admin?.beauticianId, isSuperAdmin]); // Only recreate if these change

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Re-fetch when fetchData changes (which depends on admin and isSuperAdmin)

  useEffect(() => {
    // Handle window resize for responsive calendar
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize filtered events to prevent unnecessary recalculations
  const events = useMemo(() => {
    if (!allAppointments || allAppointments.length === 0) {
      return [];
    }

    let filtered = allAppointments;

    // Filter by beautician if selected
    if (selectedBeautician !== "all") {
      filtered = filtered.filter(
        (apt) => apt.beauticianId?._id === selectedBeautician
      );
    }

    // Format for calendar
    return filtered
      .map((appointment) => {
        if (!appointment || !appointment.start || !appointment.end) {
          return null;
        }

        const startDate = new Date(appointment.start);
        const endDate = new Date(appointment.end);

        let backgroundColor = "#3b82f6";
        // Treat both "confirmed" and "completed" as completed (green) since confirmed appointments count as revenue
        if (
          appointment.status === "completed" ||
          appointment.status === "confirmed"
        )
          backgroundColor = "#10b981";
        else if (appointment.status === "reserved_unpaid")
          backgroundColor = "#f59e0b";
        else if (appointment.status?.includes("cancelled"))
          backgroundColor = "#ef4444";
        else if (appointment.status === "no_show") backgroundColor = "#6b7280";

        return {
          id: appointment._id,
          title: `${appointment.client?.name || "Unknown"} - ${
            appointment.serviceId?.name || appointment.variantName || "Service"
          }`,
          start: startDate,
          end: endDate,
          resource: appointment,
          style: { backgroundColor },
        };
      })
      .filter(Boolean); // Remove any null entries
  }, [selectedBeautician, allAppointments]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Check if current admin's beautician needs Stripe reconnection
  const beauticianNeedsReconnection =
    admin?.beauticianId &&
    [
      "68ee0631ded002672811c07d", // Justina
      "690cfa499c0b7c48a7170d9b", // Kasia
      "690a74f9d99a5e45d0ec2741", // Adrijana
    ].includes(admin.beauticianId);

  // Find the beautician's data to check Stripe status
  const currentBeautician = beauticians.find(
    (b) => b._id === admin?.beauticianId
  );
  const hasStripeConnected =
    currentBeautician?.stripeAccountId &&
    currentBeautician?.stripeStatus === "connected";

  const needsStripeReconnection =
    beauticianNeedsReconnection && !hasStripeConnected;

  return (
    <div className="space-y-6">
      {/* Stripe Account Deletion Notice */}
      {needsStripeReconnection && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Stripe Account Deleted - Action Required
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Your Stripe account has been deleted due to no activity for
                  more than 30 days. To continue receiving payments, please
                  reconnect your Stripe account in the{" "}
                  <a
                    href="/admin/stripe-connect"
                    className="font-medium underline hover:text-orange-600"
                  >
                    Stripe Connect page
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("dashboard", language)}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? t("viewManageAllAppointments", language)
              : admin?.beauticianId
              ? t("viewAppointmentsLinkedBeautician", language)
              : t("noBeauticianLinked", language)}
          </p>
        </div>

        {/* Beautician Filter - Only show for super admins */}
        {isSuperAdmin && (
          <div className="flex items-center gap-3">
            <label
              htmlFor="beautician-filter"
              className="text-sm font-medium text-gray-700"
            >
              {t("filterByBeautician", language)}:
            </label>
            <select
              id="beautician-filter"
              value={selectedBeautician}
              onChange={(e) => setSelectedBeautician(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
            >
              <option value="all">{t("allBeauticians", language)}</option>
              {beauticians.map((beautician) => (
                <option key={beautician._id} value={beautician._id}>
                  {beautician.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show warning for regular admins without linked beautician */}
        {!isSuperAdmin && !admin?.beauticianId && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-600"
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
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {t("accountNotLinked", language)}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {t("contactSuperAdmin", language)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today's Appointments Widget */}
      {(() => {
        // Don't show today's appointments if regular admin has no linked beautician
        if (!isSuperAdmin && !admin?.beauticianId) {
          return null;
        }

        const today = dayjs().startOf("day");
        const todaysAppointments = allAppointments
          .filter((apt) => {
            const aptDate = dayjs(apt.start).startOf("day");
            return (
              aptDate.isSame(today) &&
              (selectedBeautician === "all" ||
                apt.beauticianId?._id === selectedBeautician)
            );
          })
          .sort((a, b) => new Date(a.start) - new Date(b.start));

        if (todaysAppointments.length === 0) return null;

        return (
          <div className="bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-brand-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-lg font-bold text-brand-900">
                {t("todaysAppointments", language)} ({todaysAppointments.length}
                )
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {todaysAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    const event = events.find((e) => e.id === apt._id);
                    if (event) setSelectedEvent(event);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {dayjs(apt.start).format("h:mm A")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        apt.status === "confirmed" || apt.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : apt.status === "reserved_unpaid"
                          ? "bg-orange-100 text-orange-700"
                          : apt.status?.includes("cancelled")
                          ? "bg-red-100 text-red-700"
                          : apt.status === "no_show"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {formatStatus(apt.status)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    {apt.client?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-600">
                    {apt.serviceId?.name || apt.variantName}
                  </div>
                  <div className="text-xs text-brand-600 font-medium mt-1">
                    👤 {apt.beauticianId?.name || "No beautician assigned"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 rounded-lg p-4">
        <span className="font-medium text-gray-700">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Confirmed / Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-600">Unpaid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span className="text-gray-600">No Show</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile view toggle */}
        {isMobile && (
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setCurrentView("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                currentView === "month"
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCurrentView("week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                currentView === "week"
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView("day")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                currentView === "day"
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setCurrentView("agenda")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                currentView === "agenda"
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              List
            </button>
          </div>
        )}
        <div className="p-0 sm:p-6 overflow-x-hidden">
          <style>{`
            /* Mobile Calendar Optimizations */
            @media (max-width: 768px) {
              .rbc-calendar {
                font-size: 11px;
                width: 100%;
              }
              
              /* Toolbar */
              .rbc-toolbar {
                flex-direction: column !important;
                gap: 0.5rem;
                padding: 0.75rem;
              }
              
              .rbc-toolbar-label {
                font-size: 15px !important;
                font-weight: 600;
                order: -1;
                width: 100%;
                text-align: center;
                padding: 0.5rem 0;
              }
              
              .rbc-btn-group {
                display: flex;
                gap: 0.25rem;
                width: 100%;
                justify-content: center;
              }
              
              .rbc-btn-group button {
                padding: 0.5rem 1rem !important;
                font-size: 12px !important;
                border-radius: 0.5rem !important;
                flex: 1;
              }
              
              /* Hide default view buttons on mobile - we have custom toggle */
              .rbc-toolbar .rbc-btn-group:last-child {
                display: none !important;
              }
              
              /* Headers - smaller for mobile */
              .rbc-header {
                padding: 0.5rem 0.25rem !important;
                font-size: 11px !important;
                font-weight: 600;
                text-align: center !important;
              }
              
              /* MONTH VIEW */
              .rbc-month-view {
                border: none !important;
              }
              
              .rbc-month-header {
                border-bottom: 1px solid #e5e7eb;
              }
              
              .rbc-month-row {
                min-height: 50px !important;
                border-bottom: 1px solid #e5e7eb;
              }
              
              .rbc-date-cell {
                padding: 0.25rem !important;
                font-size: 10px !important;
                text-align: center;
              }
              
              .rbc-event {
                padding: 0.125rem 0.25rem !important;
                font-size: 9px !important;
                border-radius: 0.25rem !important;
                margin: 1px 0 !important;
              }
              
              .rbc-event-content {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              
              /* WEEK VIEW */
              .rbc-time-view {
                border: none !important;
              }
              
              .rbc-time-header {
                border-bottom: 1px solid #e5e7eb;
                display: flex !important;
              }
              
              .rbc-time-header-content {
                border-left: none !important;
                display: flex !important;
                flex: 1 !important;
                min-width: 0 !important;
              }
              
              .rbc-time-header-gutter {
                width: 35px !important;
                min-width: 35px !important;
                flex-shrink: 0 !important;
              }
              
              .rbc-allday-cell {
                display: none !important;
              }
              
              .rbc-time-content {
                border-top: none !important;
                display: flex !important;
              }
              
              .rbc-time-gutter {
                width: 35px !important;
                min-width: 35px !important;
                flex-shrink: 0 !important;
              }
              
              .rbc-time-column {
                width: 35px !important;
                min-width: 35px !important;
                max-width: 35px !important;
                flex-shrink: 0 !important;
              }
              
              .rbc-time-column .rbc-timeslot-group {
                min-height: 35px !important;
              }
              
              .rbc-day-slot {
                flex: 1 !important;
                min-width: 0 !important;
                max-width: none !important;
              }
              
              .rbc-day-slot .rbc-time-slot {
                font-size: 8px !important;
              }
              
              .rbc-time-slot {
                min-height: 17.5px !important;
              }
              
              /* Time labels - make them fit in narrow column */
              .rbc-time-slot span {
                font-size: 7px !important;
                padding: 0 !important;
                line-height: 1.2 !important;
              }
              
              .rbc-label {
                font-size: 7px !important;
                padding: 2px 1px !important;
                white-space: nowrap !important;
                overflow: hidden !important;
              }
              
              .rbc-time-column .rbc-label {
                font-size: 7px !important;
              }
              
              .rbc-events-container {
                margin-right: 0 !important;
              }
              
              /* DAY VIEW */
              .rbc-day-slot .rbc-event {
                font-size: 10px !important;
              }
              
              /* AGENDA VIEW */
              .rbc-agenda-view {
                font-size: 12px;
                padding: 0.5rem;
              }
              
              .rbc-agenda-table {
                border: none !important;
              }
              
              .rbc-agenda-date-cell,
              .rbc-agenda-time-cell {
                padding: 0.5rem !important;
                font-size: 11px !important;
              }
              
              .rbc-agenda-event-cell {
                padding: 0.5rem !important;
                font-size: 11px !important;
              }
            }
            
            /* General Calendar Styling */
            .rbc-calendar {
              font-family: inherit;
            }
            
            .rbc-toolbar {
              padding: 1rem 0;
              margin-bottom: 1rem;
            }
            
            .rbc-toolbar button {
              color: #374151;
              border: 1px solid #d1d5db;
              background: white;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              font-weight: 500;
              transition: all 0.2s;
            }
            
            .rbc-toolbar button:hover {
              background: #f3f4f6;
              border-color: #9ca3af;
            }
            
            .rbc-toolbar button:active,
            .rbc-toolbar button.rbc-active {
              background: #ec4899;
              border-color: #ec4899;
              color: white;
            }
            
            .rbc-toolbar-label {
              font-size: 1.125rem;
              font-weight: 600;
              color: #111827;
            }
            
            .rbc-header {
              padding: 0.75rem;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
              background: #f9fafb;
            }
            
            .rbc-today {
              background-color: #fef3c7;
            }
            
            .rbc-off-range-bg {
              background: #f9fafb;
            }
            
            .rbc-event {
              border-radius: 0.375rem;
              padding: 0.25rem 0.5rem;
              border: none !important;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            
            .rbc-event:hover {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .rbc-event-label {
              display: none;
            }
            
            .rbc-show-more {
              background: #ec4899;
              color: white;
              padding: 0.125rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.75rem;
              font-weight: 600;
            }
            
            .rbc-agenda-view table.rbc-agenda-table {
              border: 1px solid #e5e7eb;
              border-radius: 0.5rem;
            }
            
            .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
              padding: 0.75rem;
              border-color: #e5e7eb;
            }
            
            .rbc-agenda-date-cell {
              font-weight: 600;
              color: #374151;
            }
            
            .rbc-agenda-time-cell {
              color: #6b7280;
            }
          `}</style>

          {events && events.length >= 0 ? (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              view={currentView}
              onNavigate={(date) => setCurrentDate(date)}
              onView={(view) => setCurrentView(view)}
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              style={{ height: isMobile ? 400 : 700 }}
              onSelectEvent={(event) => setSelectedEvent(event)}
              eventPropGetter={(event) => ({
                style: event.style || {},
                className: "rbc-event-custom",
              })}
              min={new Date(2025, 0, 1, 8, 0)}
              max={new Date(2025, 0, 1, 20, 0)}
              popup={true}
              step={30}
              timeslots={2}
              showMultiDayTimes={true}
              toolbar={true}
            />
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Loading calendar...
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Appointment Details
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {dayjs(selectedEvent.start).format("MMMM Do YYYY")}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
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
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Customer Info */}
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Information
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium text-lg">
                    {selectedEvent.resource.client?.name || "Unknown"}
                  </p>
                  {selectedEvent.resource.client?.email && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {selectedEvent.resource.client.email}
                    </p>
                  )}
                  {selectedEvent.resource.client?.phone && (
                    <a
                      href={`tel:${selectedEvent.resource.client.phone}`}
                      className="text-sm text-gray-700 hover:text-blue-600 flex items-center gap-2 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {selectedEvent.resource.client.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Service & Beautician */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    Service
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {selectedEvent.resource.serviceId?.name ||
                      selectedEvent.resource.variantName ||
                      "Unknown Service"}
                  </p>
                  {selectedEvent.resource.variantName && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedEvent.resource.variantName}
                    </p>
                  )}
                </div>

                {selectedEvent.resource.beauticianId?.name && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Beautician
                    </h4>
                    <p className="text-gray-900 font-medium">
                      {selectedEvent.resource.beauticianId.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Time & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Time
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {dayjs(selectedEvent.start).format("h:mm A")}
                  </p>
                  <p className="text-sm text-gray-600">
                    to {dayjs(selectedEvent.end).format("h:mm A")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration:{" "}
                    {dayjs(selectedEvent.end).diff(
                      dayjs(selectedEvent.start),
                      "minutes"
                    )}{" "}
                    min
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Price
                  </h4>
                  <p className="text-gray-900 font-bold text-xl">
                    {formatCurrency(selectedEvent.resource.price || 0)}
                  </p>
                  {selectedEvent.resource.payment?.mode === "deposit" && (
                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      <p className="font-medium">Deposit Payment</p>
                      {selectedEvent.resource.payment.amountTotal && (
                        <>
                          <p>
                            Deposit paid:{" "}
                            {formatCurrency(
                              (selectedEvent.resource.payment.amountTotal -
                                50) /
                                100
                            )}
                          </p>
                          <p>
                            Balance due:{" "}
                            {formatCurrency(
                              selectedEvent.resource.price -
                                (selectedEvent.resource.payment.amountTotal -
                                  50) /
                                  100
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  {selectedEvent.resource.payment?.mode === "pay_now" && (
                    <p className="text-xs text-gray-600 mt-1">Paid in Full</p>
                  )}
                  {selectedEvent.resource.payment?.mode === "pay_in_salon" && (
                    <p className="text-xs text-gray-600 mt-1">Pay in Salon</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Status
                </h4>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedEvent.resource.status === "completed" ||
                    selectedEvent.resource.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : selectedEvent.resource.status === "reserved_unpaid"
                      ? "bg-orange-100 text-orange-800"
                      : selectedEvent.resource.status?.includes("cancelled")
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {formatStatus(selectedEvent.resource.status)}
                </span>
              </div>

              {/* Notes */}
              {selectedEvent.resource.client?.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedEvent.resource.client.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.location.href = `/admin/appointments`;
                }}
                className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
              >
                Manage Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
