import { useEffect, useState } from "react";
import { api } from "../../lib/apiClient";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export default function Hours() {
  const [workingHours, setWorkingHours] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/settings");
      setWorkingHours(response.data.workingHours || {});
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({
        type: "error",
        text: "Failed to load working hours",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: prev[day] ? null : { start: "09:00", end: "17:00" },
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleCopyToAll = (day) => {
    const dayHours = workingHours[day];
    if (!dayHours) return;

    const newHours = {};
    DAYS.forEach((d) => {
      newHours[d.key] = { ...dayHours };
    });
    setWorkingHours(newHours);
  };

  const handleSetBusinessHours = () => {
    const newHours = {
      mon: { start: "09:00", end: "17:00" },
      tue: { start: "09:00", end: "17:00" },
      wed: { start: "09:00", end: "17:00" },
      thu: { start: "09:00", end: "17:00" },
      fri: { start: "09:00", end: "17:00" },
      sat: { start: "09:00", end: "13:00" },
      sun: null,
    };
    setWorkingHours(newHours);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await api.patch("/settings", { workingHours });
      setMessage({
        type: "success",
        text: "Salon working hours saved successfully!",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to save working hours",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Salon Working Hours
        </h1>
        <p className="text-gray-600">
          Set the opening and closing times for your salon. These hours
          determine when customers can book appointments.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg border border-brand-200 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSetBusinessHours}
            className="px-4 py-2 bg-white text-brand-700 border border-brand-300 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors"
          >
            📅 Set Standard Hours (Mon-Fri 9-5, Sat 9-1, Sun Closed)
          </button>
        </div>
      </div>

      {/* Working Hours Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🕐</span>
          <span>Weekly Schedule</span>
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading schedule...
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS.map((day) => {
              const dayHours = workingHours[day.key];
              const isOpen = Boolean(dayHours);

              return (
                <div
                  key={day.key}
                  className={`border rounded-lg p-4 transition-colors ${
                    isOpen
                      ? "border-brand-200 bg-brand-50/30"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Day Toggle */}
                    <div className="flex items-center gap-3 min-w-fit">
                      <input
                        type="checkbox"
                        id={`day-${day.key}`}
                        checked={isOpen}
                        onChange={() => handleDayToggle(day.key)}
                        className="w-5 h-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500 flex-shrink-0"
                      />
                      <label
                        htmlFor={`day-${day.key}`}
                        className="font-medium text-gray-900 cursor-pointer"
                      >
                        {day.label}
                      </label>
                    </div>

                    {/* Time Inputs */}
                    {isOpen ? (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-sm text-gray-600 w-16 sm:w-auto">
                            Opens:
                          </label>
                          <input
                            type="time"
                            value={dayHours.start || "09:00"}
                            onChange={(e) =>
                              handleTimeChange(day.key, "start", e.target.value)
                            }
                            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-sm text-gray-600 w-16 sm:w-auto">
                            Closes:
                          </label>
                          <input
                            type="time"
                            value={dayHours.end || "17:00"}
                            onChange={(e) =>
                              handleTimeChange(day.key, "end", e.target.value)
                            }
                            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          />
                        </div>
                        <button
                          onClick={() => handleCopyToAll(day.key)}
                          className="px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100 rounded-lg transition-colors whitespace-nowrap"
                          title="Copy these hours to all days"
                        >
                          📋 Copy to All
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic font-medium">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-blue-600 text-xl">ℹ️</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Important Information
              </h4>
              <p className="text-sm text-blue-800">
                These are your salon's general operating hours. Individual staff
                members can have their own schedules set in the Staff section,
                but appointments can only be booked during the hours set here.
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={loadSettings}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={saving || loading}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? "Saving..." : "💾 Save Working Hours"}
          </button>
        </div>
      </div>
    </div>
  );
}
