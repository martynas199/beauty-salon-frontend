import { useState, useEffect, useCallback, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "react-day-picker/dist/style.css";
import { useAvailableDates } from "../hooks/useAvailableDates";
import { api } from "../lib/apiClient";
import { StaggerContainer, StaggerItem } from "./ui/PageTransition";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * DateTimePicker - Production-ready date and time slot picker
 *
 * @param {object} props
 * @param {string} props.beauticianId - ID of the beautician
 * @param {string} props.serviceId - ID of the selected service
 * @param {string} props.variantName - Name of the selected variant
 * @param {string} props.salonTz - Timezone (e.g., "Europe/London")
 * @param {number} props.stepMin - Step interval in minutes (default 15)
 * @param {function} props.onSelect - Callback when slot selected: (slot) => void
 * @param {object} props.beauticianWorkingHours - Array of { dayOfWeek, start, end }
 * @param {object} props.customSchedule - Custom schedule overrides: { "YYYY-MM-DD": [{ start, end }] }
 */
export default function DateTimePicker({
  beauticianId,
  serviceId,
  variantName,
  salonTz = "Europe/London",
  stepMin = 15,
  onSelect,
  beauticianWorkingHours = [],
  customSchedule = {},
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);

  // Get today in salon timezone
  const today = useMemo(() => {
    return dayjs().tz(salonTz).startOf("day").toDate();
  }, [salonTz]);

  // Fetch fully booked dates for current month
  const {
    fullyBooked,
    isLoading: loadingAvailableDates,
    error: availableDatesError,
    refetch: refetchAvailableDates,
  } = useAvailableDates(
    beauticianId,
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1
  );

  // Build set of working days (0=Sunday, 6=Saturday)
  const workingDaysSet = useMemo(() => {
    return new Set(beauticianWorkingHours.map((wh) => wh.dayOfWeek));
  }, [beauticianWorkingHours]);

  // Determine if a date should be disabled
  const isDateDisabled = useCallback(
    (date) => {
      // Safety check
      if (!date) return true;

      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const dayOfWeek = date.getDay();

      // Past dates
      if (date < today) return true;

      // Check if date has custom schedule override
      if (customSchedule[dateStr]) {
        const customHours = customSchedule[dateStr];
        // If custom schedule exists but is empty array, day is not working
        if (customHours.length === 0) return true;
        // If custom schedule has hours, day is working
        return false;
      }

      // Not a working day (check weekly schedule)
      if (!workingDaysSet.has(dayOfWeek)) return true;

      // Fully booked
      if (fullyBooked.includes(dateStr)) return true;

      return false;
    },
    [today, workingDaysSet, fullyBooked, customSchedule]
  );

  // Get disabled reason for tooltip
  const getDisabledReason = useCallback(
    (date) => {
      // Safety check
      if (!date) return "";

      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const dayOfWeek = date.getDay();

      if (date < today) return "Past date";

      // Check custom schedule first
      if (customSchedule[dateStr]) {
        const customHours = customSchedule[dateStr];
        if (customHours.length === 0) return "Not working (custom schedule)";
        // Has custom hours, so not disabled by schedule
      } else if (!workingDaysSet.has(dayOfWeek)) {
        return "Not working";
      }

      if (fullyBooked.includes(dateStr)) return "Fully booked";
      return "";
    },
    [today, workingDaysSet, fullyBooked, customSchedule]
  );

  // Fetch slots when date selected
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotsError(null);
      setSelectedSlot(null);

      try {
        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
        const response = await api.get("/slots", {
          params: {
            beauticianId,
            serviceId,
            variantName,
            date: dateStr,
          },
        });

        const fetchedSlots = response.data.slots || [];

        // Client-side validation of slots
        const validatedSlots = fetchedSlots.filter((slot) => {
          try {
            // Rule 1: Valid ISO strings
            const start = dayjs(slot.startISO);
            const end = dayjs(slot.endISO);
            if (!start.isValid() || !end.isValid()) {
              console.error("Invalid ISO string in slot:", slot);
              return false;
            }

            // Rule 2: End after start
            if (!end.isAfter(start)) {
              console.error("Slot end not after start:", slot);
              return false;
            }

            // Rule 3: Slot in correct date
            const slotDate = start.tz(salonTz).format("YYYY-MM-DD");
            if (slotDate !== dateStr) {
              console.error("Slot not on selected date:", slot, slotDate);
              return false;
            }

            return true;
          } catch (err) {
            console.error("Slot validation error:", err, slot);
            return false;
          }
        });

        // If too many slots invalidated, show error
        if (
          fetchedSlots.length > 0 &&
          validatedSlots.length < fetchedSlots.length * 0.8
        ) {
          console.error(
            `Too many invalid slots: ${
              fetchedSlots.length - validatedSlots.length
            }/${fetchedSlots.length}`
          );
          setSlotsError(
            "Temporary error fetching slots — please try another date"
          );
          setSlots([]);
        } else {
          setSlots(validatedSlots);
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
        setSlotsError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load available times"
        );
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, beauticianId, serviceId, variantName, salonTz]);

  const handleDateSelect = (date) => {
    if (!date || isDateDisabled(date)) return;
    setSelectedDate(date);
    setMobileCalendarOpen(false);
  };

  const handleSlotSelect = (slot) => {
    if (selectedSlot?.startISO === slot.startISO) return; // Already selected
    setSelectedSlot(slot);
    onSelect(slot);
  };

  const handleRetrySlots = () => {
    if (selectedDate) {
      // Trigger re-fetch by clearing and re-setting date
      const date = selectedDate;
      setSelectedDate(null);
      setTimeout(() => setSelectedDate(date), 50);
    }
  };

  const handleRetryAvailableDates = () => {
    refetchAvailableDates();
  };

  // Format slot time for display
  const formatSlotTime = (isoString) => {
    return dayjs(isoString).tz(salonTz).format("HH:mm");
  };

  // Format selected date for display
  const formatSelectedDate = (date) => {
    return dayjs(date).format("dddd, MMMM D, YYYY");
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Error banner for available dates */}
      {availableDatesError && (
        <div
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
          role="alert"
        >
          <p className="text-red-800 text-sm">
            Failed to load available dates: {availableDatesError}
          </p>
          <button
            onClick={handleRetryAvailableDates}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Select a Date</h3>

          {/* Mobile: Compact date button */}
          <button
            className="lg:hidden w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between mb-4"
            onClick={() => setMobileCalendarOpen(!mobileCalendarOpen)}
            aria-expanded={mobileCalendarOpen}
            aria-label="Open calendar"
          >
            <span>
              {selectedDate ? formatSelectedDate(selectedDate) : "Choose date"}
            </span>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                mobileCalendarOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Calendar - hidden on mobile unless opened */}
          <div
            className={`${
              mobileCalendarOpen ? "block" : "hidden"
            } lg:block relative`}
          >
            {loadingAvailableDates && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="text-gray-500">Loading calendar...</div>
              </div>
            )}

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={isDateDisabled}
              fromDate={today}
              toDate={dayjs(today).add(3, "month").toDate()}
              modifiersClassNames={{
                selected: "rdp-selected-custom",
                disabled: "rdp-disabled-custom",
                today: "rdp-today-custom",
              }}
              className="mx-auto"
              components={{
                DayButton: ({ day, modifiers, ...props }) => {
                  const date = day.date;

                  // Safety check for undefined dates
                  if (!date) {
                    return <button {...props} />;
                  }

                  const disabled = modifiers?.disabled;
                  const reason = disabled ? getDisabledReason(date) : "";

                  return (
                    <>
                      <button
                        {...props}
                        title={reason}
                        aria-label={`${dayjs(date).format("MMMM D, YYYY")}${
                          reason ? ` - ${reason}` : ""
                        }`}
                      />
                      {disabled && reason && (
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-20 pointer-events-none">
                          {reason}
                        </div>
                      )}
                    </>
                  );
                },
              }}
            />
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            /* Calendar custom styles */
            .rdp-selected-custom {
              background-color: #2563eb !important;
              color: white !important;
              font-weight: 600;
            }
            .rdp-disabled-custom {
              background-color: #fee2e2 !important;
              color: #991b1b !important;
              cursor: not-allowed !important;
              text-decoration: line-through;
              font-weight: 500;
              opacity: 0.8;
              position: relative;
              border: 1px solid #fca5a5 !important;
            }
            .rdp-disabled-custom::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 2px;
              height: 140%;
              background-color: #ef4444;
              transform: translate(-50%, -50%) rotate(45deg);
            }
            .rdp-today-custom {
              font-weight: 700;
              border: 2px solid #2563eb;
            }
            
            /* Fix weekday headers */
            .rdp-root {
              --rdp-accent-color: #2563eb;
              --rdp-background-color: #e0e7ff;
            }
            .rdp-month {
              width: 100%;
            }
            .rdp-caption {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 0;
              margin-bottom: 1rem;
            }
            .rdp-nav {
              display: flex;
              gap: 0.5rem;
            }
            .rdp-nav button {
              width: 2rem;
              height: 2rem;
              border-radius: 0.375rem;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .rdp-nav button:hover {
              background-color: #f3f4f6;
            }
            .rdp-weekdays {
              display: flex;
              margin-bottom: 0.75rem;
              background-color: #f3f4f6;
              border-radius: 0.5rem;
              padding: 0.5rem 0;
            }
            .rdp-weekday {
              flex: 1;
              text-align: center;
              font-size: 0.875rem;
              font-weight: 700;
              color: #1f2937;
              padding: 0.25rem 0;
              text-transform: uppercase;
              letter-spacing: 0.025em;
            }
            .rdp-week {
              display: flex;
              margin-bottom: 0.25rem;
            }
            .rdp-day {
              flex: 1;
              text-align: center;
            }
            .rdp-day button {
              width: 2.5rem;
              height: 2.5rem;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
            }
            .rdp-day button:hover:not(:disabled) {
              background-color: #f3f4f6;
            }
            .rdp-day button:disabled {
              cursor: not-allowed;
            }
          `,
            }}
          />
        </div>

        {/* Time Slots Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate ? "Available Times" : "Select a date first"}
          </h3>

          {!selectedDate && (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>Please select a date from the calendar</p>
            </div>
          )}

          {selectedDate && loadingSlots && (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded-lg animate-pulse"
                  role="status"
                  aria-label="Loading time slots"
                />
              ))}
            </div>
          )}

          {selectedDate && !loadingSlots && slotsError && (
            <div
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <p className="text-red-800 text-sm mb-3">{slotsError}</p>
              <button
                onClick={handleRetrySlots}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {selectedDate &&
            !loadingSlots &&
            !slotsError &&
            slots.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-medium">No available times for this date</p>
                <p className="text-sm mt-1">Please try another date</p>
              </div>
            )}

          {selectedDate && !loadingSlots && !slotsError && slots.length > 0 && (
            <StaggerContainer
              className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto"
              role="listbox"
              aria-label="Available time slots"
            >
              {slots.map((slot, index) => {
                const isSelected = selectedSlot?.startISO === slot.startISO;
                return (
                  <StaggerItem key={`${slot.startISO}-${index}`}>
                    <button
                      onClick={() => handleSlotSelect(slot)}
                      disabled={isSelected}
                      className={`
                        px-3 py-3 rounded-lg font-medium text-sm transition-all duration-250
                        hover:scale-105 active:scale-95
                        ${
                          isSelected
                            ? "bg-brand-600 text-white ring-2 ring-brand-400 ring-offset-2"
                            : "bg-gray-100 text-gray-900 hover:bg-brand-50 hover:text-brand-700 hover:ring-2 hover:ring-brand-200"
                        }
                        disabled:cursor-not-allowed
                        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                      `}
                      role="option"
                      aria-selected={isSelected}
                      aria-label={`Time slot ${formatSlotTime(slot.startISO)}`}
                    >
                      {formatSlotTime(slot.startISO)}
                    </button>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </div>
    </div>
  );
}
