import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../features/auth/authSlice";
import { api } from "../../lib/apiClient";
import toast from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/forms/FormField";
import Button from "../../components/ui/Button";
import dayjs from "dayjs";

export default function WorkingHoursCalendar() {
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";

  const [beauticians, setBeauticians] = useState([]);
  const [selectedBeauticianId, setSelectedBeauticianId] = useState("");
  const [selectedBeautician, setSelectedBeautician] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Custom schedule for specific dates (overrides default weekly schedule)
  const [customSchedule, setCustomSchedule] = useState({}); // { "2025-12-05": [{ start: "09:00", end: "12:00" }] }

  // Modal state for editing a specific date
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayHours, setDayHours] = useState([]);

  // Fetch beauticians
  useEffect(() => {
    const fetchBeauticians = async () => {
      try {
        const response = await api.get("/beauticians");
        setBeauticians(response.data);

        // Auto-select beautician if not super admin
        if (!isSuperAdmin && admin?.beauticianId) {
          setSelectedBeauticianId(admin.beauticianId);
        }
      } catch (error) {
        console.error("Failed to fetch beauticians:", error);
        toast.error("Failed to load beauticians");
      }
    };

    fetchBeauticians();
  }, [isSuperAdmin, admin?.beauticianId]);

  // Fetch selected beautician details
  useEffect(() => {
    if (!selectedBeauticianId) {
      setSelectedBeautician(null);
      setCustomSchedule({});
      return;
    }

    const fetchBeautician = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/beauticians/${selectedBeauticianId}`);
        setSelectedBeautician(response.data);

        // Load custom schedule if it exists
        if (response.data.customSchedule) {
          setCustomSchedule(response.data.customSchedule);
        } else {
          setCustomSchedule({});
        }
      } catch (error) {
        console.error("Failed to fetch beautician:", error);
        toast.error("Failed to load beautician details");
      } finally {
        setLoading(false);
      }
    };

    fetchBeautician();
  }, [selectedBeauticianId]);

  // Get working hours for a specific date
  const getWorkingHoursForDate = (date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");

    // Check for custom schedule first
    if (customSchedule[dateStr]) {
      return customSchedule[dateStr];
    }

    // Fall back to default weekly schedule
    if (!selectedBeautician?.workingHours) return [];
    const dayOfWeek = date.getDay();
    return selectedBeautician.workingHours.filter(
      (wh) => wh.dayOfWeek === dayOfWeek
    );
  };

  // Check if date has working hours set
  const hasWorkingHours = (date) => {
    const hours = getWorkingHoursForDate(date);
    return hours.length > 0;
  };

  // Handle day click
  const handleDayClick = (date) => {
    if (!date || !selectedBeautician) return;

    setSelectedDate(date);
    const dateStr = dayjs(date).format("YYYY-MM-DD");

    // Get existing hours for this specific date or default weekly hours
    const existingHours =
      customSchedule[dateStr] || getWorkingHoursForDate(date);

    if (existingHours.length > 0) {
      setDayHours(existingHours);
    } else {
      // Default to one empty slot
      setDayHours([{ start: "09:00", end: "17:00" }]);
    }

    setEditModalOpen(true);
  };

  // Add another time slot
  const addTimeSlot = () => {
    setDayHours([...dayHours, { start: "09:00", end: "17:00" }]);
  };

  // Remove a time slot
  const removeTimeSlot = (index) => {
    setDayHours(dayHours.filter((_, i) => i !== index));
  };

  // Update time slot
  const updateTimeSlot = (index, field, value) => {
    const updated = [...dayHours];
    updated[index][field] = value;
    setDayHours(updated);
  };

  // Save working hours for the specific selected date
  const saveWorkingHours = async () => {
    if (!selectedDate || !selectedBeautician) return;

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

    try {
      // Update custom schedule
      const newCustomSchedule = {
        ...customSchedule,
        [dateStr]: dayHours
          .filter((h) => h.start && h.end)
          .map((h) => ({ start: h.start, end: h.end })),
      };

      // Remove entry if no hours set
      if (newCustomSchedule[dateStr].length === 0) {
        delete newCustomSchedule[dateStr];
      }

      await api.patch(`/beauticians/${selectedBeautician._id}`, {
        customSchedule: newCustomSchedule,
      });

      // Update local state
      setCustomSchedule(newCustomSchedule);
      setSelectedBeautician({
        ...selectedBeautician,
        customSchedule: newCustomSchedule,
      });

      toast.success("Schedule updated successfully");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update schedule:", error);
      toast.error(error.response?.data?.error || "Failed to update schedule");
    }
  };

  // Clear working hours for the selected date
  const clearWorkingHours = async () => {
    if (!selectedDate || !selectedBeautician) return;

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

    try {
      const newCustomSchedule = { ...customSchedule };
      delete newCustomSchedule[dateStr];

      await api.patch(`/beauticians/${selectedBeautician._id}`, {
        customSchedule: newCustomSchedule,
      });

      // Update local state
      setCustomSchedule(newCustomSchedule);
      setSelectedBeautician({
        ...selectedBeautician,
        customSchedule: newCustomSchedule,
      });

      toast.success("Schedule cleared for this date");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to clear schedule:", error);
      toast.error(error.response?.data?.error || "Failed to clear schedule");
    }
  };

  const modifiers = {
    hasHours: (date) => hasWorkingHours(date),
    custom: (date) => {
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      return customSchedule[dateStr] !== undefined;
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Working Hours Calendar
        </h1>
        <p className="text-gray-600">
          Set working hours for specific dates. Click on any date to customize.
        </p>
      </div>

      {/* Beautician Selector */}
      <div className="bg-white border rounded-lg p-4">
        <FormField label="Select Beautician" htmlFor="beautician-select">
          <select
            id="beautician-select"
            className="border rounded w-full max-w-md px-3 py-2"
            value={selectedBeauticianId}
            onChange={(e) => setSelectedBeauticianId(e.target.value)}
            disabled={!isSuperAdmin}
          >
            <option value="">Select a beautician</option>
            {beauticians.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Calendar */}
      {selectedBeautician && (
        <div className="bg-white border rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">
              {selectedBeautician.name}'s Schedule
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Click on a date to set custom working hours for that specific day.
            </p>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 text-base mb-4 p-4 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded flex items-center justify-center text-sm font-semibold">
                  15
                </div>
                <span>Default weekly hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-blue-50 border-2 border-blue-400 rounded flex items-center justify-center text-sm font-semibold">
                  15
                </div>
                <span>Custom date hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded flex items-center justify-center text-sm">
                  15
                </div>
                <span>Not working</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <style>{`
              .rdp {
                --rdp-cell-size: 80px;
                --rdp-accent-color: #10b981;
                font-size: 16px;
              }
              .rdp-day {
                min-height: 80px !important;
                width: 80px !important;
                cursor: pointer !important;
                position: relative;
                padding: 8px 4px !important;
              }
              .rdp-day_selected {
                background-color: #f0fdf4 !important;
              }
              .rdp-day.has-custom {
                background-color: #dbeafe !important;
                border-color: #3b82f6 !important;
              }
              .rdp-caption {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 1.5rem;
              }
              .rdp-head_cell {
                font-size: 14px;
                font-weight: 600;
                padding: 8px;
              }
            `}</style>
            <DayPicker
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              onDayClick={handleDayClick}
              formatters={{
                formatDay: (date) => {
                  const hours = getWorkingHoursForDate(date);
                  const dateStr = dayjs(date).format("YYYY-MM-DD");
                  const isCustom = customSchedule[dateStr] !== undefined;

                  return (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <span
                        className={`text-base ${
                          hours.length > 0 ? "font-semibold" : ""
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {hours.length > 0 && (
                        <div className="text-[10px] leading-tight mt-1 text-center">
                          {hours.map((h, idx) => (
                            <div
                              key={idx}
                              className={`font-medium ${
                                isCustom ? "text-blue-600" : "text-green-600"
                              }`}
                            >
                              {h.start}-{h.end}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
              modifiers={modifiers}
              modifiersClassNames={{
                hasHours: "bg-green-50 font-semibold",
                custom: "has-custom",
              }}
              className="border-0"
            />
          </div>

          {/* Weekly Default Schedule Summary */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-3">Default Weekly Schedule</h3>
            <p className="text-sm text-gray-600 mb-3">
              These hours apply to all days unless overridden with custom hours.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((dayName, dayOfWeek) => {
                const dayHours =
                  selectedBeautician.workingHours?.filter(
                    (wh) => wh.dayOfWeek === dayOfWeek
                  ) || [];

                return (
                  <div
                    key={dayOfWeek}
                    className="flex items-center justify-between py-2 px-3 rounded border hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-700 w-28">
                      {dayName}
                    </span>
                    <div className="flex-1">
                      {dayHours.length === 0 ? (
                        <span className="text-gray-400 text-sm">
                          Not working
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {dayHours.map((h, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200"
                            >
                              {h.start} - {h.end}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Dates Summary */}
          {Object.keys(customSchedule).length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-3">Custom Date Overrides</h3>
              <div className="space-y-2">
                {Object.entries(customSchedule)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([dateStr, hours]) => (
                    <div
                      key={dateStr}
                      className="flex items-center justify-between py-2 px-3 rounded border border-blue-200 bg-blue-50"
                    >
                      <span className="font-medium text-gray-700">
                        {dayjs(dateStr).format("ddd, MMM D, YYYY")}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {hours.length === 0 ? (
                          <span className="text-xs text-gray-500">
                            Not working
                          </span>
                        ) : (
                          hours.map((h, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-300"
                            >
                              {h.start} - {h.end}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Day Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={
          selectedDate
            ? `Schedule - ${dayjs(selectedDate).format("dddd, MMMM D, YYYY")}`
            : "Edit Schedule"
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Custom Date Override:</strong> Setting hours here will
              only affect{" "}
              <strong>
                {selectedDate && dayjs(selectedDate).format("MMMM D, YYYY")}
              </strong>
              . Leave empty to use default weekly schedule.
            </p>
          </div>

          {dayHours.map((slot, index) => (
            <div
              key={index}
              className="flex items-end gap-3 pb-3 border-b last:border-b-0"
            >
              <FormField
                label={`Time Slot ${index + 1}`}
                htmlFor={`start-${index}`}
                className="flex-1"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    id={`start-${index}`}
                    className="border rounded px-3 py-2 w-full"
                    value={slot.start}
                    onChange={(e) =>
                      updateTimeSlot(index, "start", e.target.value)
                    }
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    id={`end-${index}`}
                    className="border rounded px-3 py-2 w-full"
                    value={slot.end}
                    onChange={(e) =>
                      updateTimeSlot(index, "end", e.target.value)
                    }
                  />
                </div>
              </FormField>
              {dayHours.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addTimeSlot}
            className="w-full px-4 py-2 text-brand-600 border border-brand-300 rounded hover:bg-brand-50"
          >
            + Add Another Time Slot
          </button>

          <div className="flex items-center justify-between gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={clearWorkingHours}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
            >
              Clear Custom Hours
            </button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="brand" onClick={saveWorkingHours}>
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
