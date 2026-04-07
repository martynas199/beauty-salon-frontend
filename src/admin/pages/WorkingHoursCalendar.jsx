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

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

const MIN_TRAVEL_BUFFER_MINUTES = 45;

const hhmmToMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== "string") return NaN;
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
};

const minutesToHHMM = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export default function WorkingHoursCalendar() {
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";

  const [beauticians, setBeauticians] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [multiLocationEnabled, setMultiLocationEnabled] = useState(false);
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

  // Modal state for editing weekly schedule
  const [editWeeklyModalOpen, setEditWeeklyModalOpen] = useState(false);
  const [editingDayOfWeek, setEditingDayOfWeek] = useState(null);
  const [weeklyDayHours, setWeeklyDayHours] = useState([]);

  // Load feature flags
  useEffect(() => {
    let cancelled = false;

    const loadFeatureFlags = async () => {
      try {
        const response = await api.get("/settings");
        if (!cancelled) {
          setMultiLocationEnabled(!!response.data?.multiLocationEnabled);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadFeatureFlags();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch locations when multi-location is enabled
  useEffect(() => {
    if (!multiLocationEnabled) {
      setLocations([]);
      setSelectedLocationId("");
      return;
    }

    let cancelled = false;
    const fetchLocations = async () => {
      try {
        const response = await api.get("/locations?all=true");
        if (!cancelled) {
          setLocations(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, [multiLocationEnabled]);

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
      setSelectedLocationId("");
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

  // Reset invalid location selection when beautician or feature flag changes
  useEffect(() => {
    if (!multiLocationEnabled) {
      setSelectedLocationId("");
      return;
    }

    if (!selectedBeautician) {
      setSelectedLocationId("");
      return;
    }

    const allowedLocationIds = (selectedBeautician.locationIds || [])
      .map((id) => normalizeId(id))
      .filter(Boolean);

    if (allowedLocationIds.length === 0) {
      setSelectedLocationId("");
      return;
    }

    if (!selectedLocationId || !allowedLocationIds.includes(selectedLocationId)) {
      setSelectedLocationId(allowedLocationIds[0]);
    }
  }, [multiLocationEnabled, selectedBeautician, selectedLocationId]);

  const matchesSelectedLocation = (locationIdValue) => {
    if (!multiLocationEnabled) return true;
    if (!selectedLocationId) return false;
    return normalizeId(locationIdValue) === selectedLocationId;
  };

  const filterHoursBySelectedLocation = (hours = []) => {
    if (!multiLocationEnabled) return hours;
    if (!selectedLocationId) return [];
    return hours.filter((h) => matchesSelectedLocation(h.locationId));
  };

  const locationOptions = locations.filter((loc) =>
    (selectedBeautician?.locationIds || [])
      .map((id) => normalizeId(id))
      .includes(normalizeId(loc._id)),
  );
  const selectedLocation = locationOptions.find(
    (loc) => normalizeId(loc._id) === selectedLocationId,
  );

  const requireLocationSelection = () => {
    if (!multiLocationEnabled) return true;
    if (locationOptions.length === 0) {
      toast.error("Assign at least one location to this beautician first.");
      return false;
    }
    if (!selectedLocationId) {
      toast.error("Select a location first.");
      return false;
    }
    return true;
  };

  const getLocationNameById = (locationId) => {
    const normalized = normalizeId(locationId);
    if (!normalized) return "another location";
    return (
      locations.find((loc) => normalizeId(loc._id) === normalized)?.name ||
      "another location"
    );
  };

  const findTravelTimeConflict = ({
    newHours,
    existingHours,
    currentLocationId,
  }) => {
    if (!currentLocationId) return null;

    const newSlots = (newHours || [])
      .map((h) => {
        const startMin = hhmmToMinutes(h.start);
        const endMin = hhmmToMinutes(h.end);
        return {
          startMin,
          endMin,
          locationId: normalizeId(h.locationId) || currentLocationId,
        };
      })
      .filter(
        (slot) =>
          Number.isFinite(slot.startMin) &&
          Number.isFinite(slot.endMin) &&
          slot.startMin < slot.endMin &&
          slot.locationId,
      );

    const otherSlots = (existingHours || [])
      .map((h) => {
        const startMin = hhmmToMinutes(h.start);
        const endMin = hhmmToMinutes(h.end);
        return {
          startMin,
          endMin,
          locationId: normalizeId(h.locationId),
        };
      })
      .filter(
        (slot) =>
          Number.isFinite(slot.startMin) &&
          Number.isFinite(slot.endMin) &&
          slot.startMin < slot.endMin &&
          slot.locationId &&
          slot.locationId !== currentLocationId,
      );

    for (const nextSlot of newSlots) {
      for (const existingSlot of otherSlots) {
        const overlaps =
          nextSlot.startMin < existingSlot.endMin &&
          existingSlot.startMin < nextSlot.endMin;

        if (overlaps) {
          return {
            type: "overlap",
            currentLocationId: currentLocationId,
            otherLocationId: existingSlot.locationId,
            nextSlot,
            existingSlot,
          };
        }

        const gapMin =
          nextSlot.endMin <= existingSlot.startMin
            ? existingSlot.startMin - nextSlot.endMin
            : nextSlot.startMin - existingSlot.endMin;

        if (gapMin < MIN_TRAVEL_BUFFER_MINUTES) {
          return {
            type: "gap",
            gapMin,
            currentLocationId: currentLocationId,
            otherLocationId: existingSlot.locationId,
            nextSlot,
            existingSlot,
          };
        }
      }
    }

    return null;
  };

  const showTravelConflictWarning = (conflict) => {
    const currentLocationName = getLocationNameById(conflict.currentLocationId);
    const otherLocationName = getLocationNameById(conflict.otherLocationId);
    const currentRange = `${minutesToHHMM(conflict.nextSlot.startMin)}-${minutesToHHMM(conflict.nextSlot.endMin)}`;
    const otherRange = `${minutesToHHMM(conflict.existingSlot.startMin)}-${minutesToHHMM(conflict.existingSlot.endMin)}`;

    if (conflict.type === "overlap") {
      toast.error(
        `Schedule conflict: ${currentLocationName} (${currentRange}) overlaps ${otherLocationName} (${otherRange}). These locations are around ${MIN_TRAVEL_BUFFER_MINUTES} minutes apart. Please choose a different time.`,
        { duration: 7000 },
      );
      return;
    }

    toast.error(
      `Not enough travel time between ${currentLocationName} (${currentRange}) and ${otherLocationName} (${otherRange}). Gap is ${conflict.gapMin} min, minimum is ${MIN_TRAVEL_BUFFER_MINUTES} min. Please choose a different time.`,
      { duration: 7000 },
    );
  };

  const findInvalidRangeSlot = (slots = []) => {
    for (const slot of slots) {
      const startMin = hhmmToMinutes(slot.start);
      const endMin = hhmmToMinutes(slot.end);
      if (
        !Number.isFinite(startMin) ||
        !Number.isFinite(endMin) ||
        startMin >= endMin
      ) {
        return slot;
      }
    }
    return null;
  };

  const findSameLocationOverlap = (slots = []) => {
    const normalized = (slots || [])
      .map((slot) => ({
        ...slot,
        startMin: hhmmToMinutes(slot.start),
        endMin: hhmmToMinutes(slot.end),
      }))
      .filter(
        (slot) =>
          Number.isFinite(slot.startMin) &&
          Number.isFinite(slot.endMin) &&
          slot.startMin < slot.endMin,
      )
      .sort((a, b) => a.startMin - b.startMin);

    for (let i = 1; i < normalized.length; i += 1) {
      const prev = normalized[i - 1];
      const current = normalized[i];
      if (current.startMin < prev.endMin) {
        return { prev, current };
      }
    }

    return null;
  };

  const showOverlapWarning = (overlap) => {
    toast.error(
      `Schedule conflict: ${minutesToHHMM(overlap.prev.startMin)}-${minutesToHHMM(overlap.prev.endMin)} overlaps ${minutesToHHMM(overlap.current.startMin)}-${minutesToHHMM(overlap.current.endMin)}. Please choose non-overlapping times.`,
      { duration: 7000 },
    );
  };

  // Get working hours for a specific date
  const getWorkingHoursForDate = (date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");

    // Check for custom schedule first
    if (customSchedule[dateStr]) {
      const customHours = filterHoursBySelectedLocation(customSchedule[dateStr]);

      // Only return custom hours if there are any after filtering
      if (customHours.length > 0) {
        return customHours;
      }
    }

    // Fall back to default weekly schedule
    if (!selectedBeautician?.workingHours) return [];
    const dayOfWeek = date.getDay();
    const hours = selectedBeautician.workingHours.filter(
      (wh) => wh.dayOfWeek === dayOfWeek,
    );
    return filterHoursBySelectedLocation(hours);
  };

  // Check if date has working hours set
  const hasWorkingHours = (date) => {
    const hours = getWorkingHoursForDate(date);
    return hours.length > 0;
  };

  // Handle day click
  const handleDayClick = (date) => {
    if (!date || !selectedBeautician) return;
    if (!requireLocationSelection()) return;

    setSelectedDate(date);
    const dateStr = dayjs(date).format("YYYY-MM-DD");

    // Get existing hours for this specific date or default weekly hours
    const customHoursForDate = customSchedule[dateStr]
      ? filterHoursBySelectedLocation(customSchedule[dateStr])
      : [];
    const existingHours =
      customHoursForDate.length > 0
        ? customHoursForDate
        : getWorkingHoursForDate(date);

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
    if (!requireLocationSelection()) return;

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

    try {
      // Get existing hours for this date
      const existingHours = customSchedule[dateStr] || [];

      // Remove existing hours for the current location scope
      const otherLocationHours = multiLocationEnabled
        ? existingHours.filter(
            (h) => normalizeId(h.locationId) !== selectedLocationId,
          )
        : [];

      // Add new hours for the current location
      const newHoursForLocation = dayHours
        .filter((h) => h.start && h.end)
        .map((h) => ({
          start: h.start,
          end: h.end,
          ...(multiLocationEnabled ? { locationId: selectedLocationId } : {}),
        }));

      const invalidRangeSlot = findInvalidRangeSlot(newHoursForLocation);
      if (invalidRangeSlot) {
        toast.error(
          `Invalid time range: ${invalidRangeSlot.start}-${invalidRangeSlot.end}. Start must be before end.`,
        );
        return;
      }

      const overlap = findSameLocationOverlap(newHoursForLocation);
      if (overlap) {
        showOverlapWarning(overlap);
        return;
      }

      if (multiLocationEnabled) {
        const travelConflict = findTravelTimeConflict({
          newHours: newHoursForLocation,
          existingHours: otherLocationHours,
          currentLocationId: selectedLocationId,
        });

        if (travelConflict) {
          showTravelConflictWarning(travelConflict);
          return;
        }
      }

      // Merge hours from other locations with new hours
      const allHours = [...otherLocationHours, ...newHoursForLocation];

      const newCustomSchedule = { ...customSchedule };

      // Update or remove the date entry
      if (allHours.length > 0) {
        newCustomSchedule[dateStr] = allHours;
      } else {
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
    if (!requireLocationSelection()) return;

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

    try {
      const newCustomSchedule = { ...customSchedule };

      if (multiLocationEnabled) {
        // Only clear hours for the selected location
        const existingHours = newCustomSchedule[dateStr] || [];
        const remainingHours = existingHours.filter(
          (h) => normalizeId(h.locationId) !== selectedLocationId,
        );

        if (remainingHours.length > 0) {
          newCustomSchedule[dateStr] = remainingHours;
        } else {
          delete newCustomSchedule[dateStr];
        }
      } else {
        // Clear all hours for this date
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

      toast.success("Schedule cleared for this date");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to clear schedule:", error);
      toast.error(error.response?.data?.error || "Failed to clear schedule");
    }
  };

  // Open weekly schedule edit modal
  const openWeeklyEditModal = (dayOfWeek) => {
    if (!selectedBeautician) return;
    if (!requireLocationSelection()) return;

    setEditingDayOfWeek(dayOfWeek);

    // Filter hours by day and location
    const existingHours =
      selectedBeautician.workingHours?.filter(
        (wh) =>
          wh.dayOfWeek === dayOfWeek &&
          (!multiLocationEnabled ||
            normalizeId(wh.locationId) === selectedLocationId),
      ) || [];

    if (existingHours.length > 0) {
      setWeeklyDayHours(existingHours);
    } else {
      setWeeklyDayHours([{ start: "09:00", end: "17:00" }]);
    }

    setEditWeeklyModalOpen(true);
  };

  // Add time slot for weekly schedule
  const addWeeklyTimeSlot = () => {
    setWeeklyDayHours([...weeklyDayHours, { start: "09:00", end: "17:00" }]);
  };

  // Remove time slot for weekly schedule
  const removeWeeklyTimeSlot = (index) => {
    setWeeklyDayHours(weeklyDayHours.filter((_, i) => i !== index));
  };

  // Update time slot for weekly schedule
  const updateWeeklyTimeSlot = (index, field, value) => {
    const updated = [...weeklyDayHours];
    updated[index][field] = value;
    setWeeklyDayHours(updated);
  };

  // Save weekly schedule
  const saveWeeklySchedule = async () => {
    if (editingDayOfWeek === null || !selectedBeautician) return;
    if (!requireLocationSelection()) return;

    try {
      // Remove existing hours for this day and location combination
      const otherHours = (selectedBeautician.workingHours || []).filter(
        (wh) => {
          if (wh.dayOfWeek !== editingDayOfWeek) return true;
          if (!multiLocationEnabled) return false;
          return normalizeId(wh.locationId) !== selectedLocationId;
        },
      );

      // Add new hours for this day with location
      const newHours = weeklyDayHours
        .filter((h) => h.start && h.end)
        .map((h) => ({
          dayOfWeek: editingDayOfWeek,
          start: h.start,
          end: h.end,
          locationId: multiLocationEnabled ? selectedLocationId : undefined,
        }));

      const invalidRangeSlot = findInvalidRangeSlot(newHours);
      if (invalidRangeSlot) {
        toast.error(
          `Invalid time range: ${invalidRangeSlot.start}-${invalidRangeSlot.end}. Start must be before end.`,
        );
        return;
      }

      const overlap = findSameLocationOverlap(newHours);
      if (overlap) {
        showOverlapWarning(overlap);
        return;
      }

      if (multiLocationEnabled) {
        const sameDayOtherLocationHours = otherHours.filter(
          (wh) => wh.dayOfWeek === editingDayOfWeek,
        );
        const travelConflict = findTravelTimeConflict({
          newHours,
          existingHours: sameDayOtherLocationHours,
          currentLocationId: selectedLocationId,
        });

        if (travelConflict) {
          showTravelConflictWarning(travelConflict);
          return;
        }
      }

      const updatedWorkingHours = [...otherHours, ...newHours];

      await api.patch(`/beauticians/${selectedBeautician._id}`, {
        workingHours: updatedWorkingHours,
      });

      // Update local state
      setSelectedBeautician({
        ...selectedBeautician,
        workingHours: updatedWorkingHours,
      });

      toast.success("Weekly schedule updated successfully");
      setEditWeeklyModalOpen(false);
    } catch (error) {
      console.error("Failed to update weekly schedule:", error);
      toast.error(
        error.response?.data?.error || "Failed to update weekly schedule",
      );
    }
  };

  // Clear weekly schedule for a day
  const clearWeeklySchedule = async () => {
    if (editingDayOfWeek === null || !selectedBeautician) return;
    if (!requireLocationSelection()) return;

    try {
      // Remove all hours for this day and selected location scope
      const updatedWorkingHours = (
        selectedBeautician.workingHours || []
      ).filter(
        (wh) => {
          if (wh.dayOfWeek !== editingDayOfWeek) return true;
          if (!multiLocationEnabled) return false;
          return normalizeId(wh.locationId) !== selectedLocationId;
        },
      );

      await api.patch(`/beauticians/${selectedBeautician._id}`, {
        workingHours: updatedWorkingHours,
      });

      // Update local state
      setSelectedBeautician({
        ...selectedBeautician,
        workingHours: updatedWorkingHours,
      });

      toast.success("Weekly schedule cleared for this day");
      setEditWeeklyModalOpen(false);
    } catch (error) {
      console.error("Failed to clear weekly schedule:", error);
      toast.error(
        error.response?.data?.error || "Failed to clear weekly schedule",
      );
    }
  };

  const modifiers = {
    hasHours: (date) => hasWorkingHours(date),
    custom: (date) => {
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      if (!customSchedule[dateStr]) return false;

      if (multiLocationEnabled) {
        if (!selectedLocationId) return false;
        return filterHoursBySelectedLocation(customSchedule[dateStr]).length > 0;
      }

      return true;
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
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Select Beautician" htmlFor="beautician-select">
            <select
              id="beautician-select"
              className="border border-gray-300 rounded-lg w-full px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
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

          {multiLocationEnabled &&
            selectedBeauticianId &&
            selectedBeautician?.locationIds?.length > 0 && (
              <FormField
                label="Location"
                htmlFor="location-select"
              >
                <select
                  id="location-select"
                  className="border border-gray-300 rounded-lg w-full px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  disabled={locationOptions.length === 0}
                >
                  {locationOptions.length === 0 ? (
                    <option value="">No locations assigned</option>
                  ) : (
                    locationOptions.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {locationOptions.length === 0
                    ? "Assign this beautician to at least one location to manage location-specific schedule."
                    : `Viewing/editing hours for ${
                        selectedLocation?.name || "selected location"
                      } only.`}
                </p>
              </FormField>
            )}
        </div>
      </div>

      {/* Calendar */}
      {selectedBeautician && (
        <div className="bg-white border rounded-lg shadow-sm p-4 md:p-8 overflow-hidden">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {selectedBeautician.name}'s Schedule
              {multiLocationEnabled &&
                selectedLocation && (
                  <span className="text-base font-normal text-brand-600 ml-2">
                    @ {selectedLocation.name}
                  </span>
                )}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {multiLocationEnabled
                ? locationOptions.length === 0
                  ? "This beautician has no assigned locations yet. Assign locations to set weekly and custom schedules."
                  : `Setting hours for ${selectedLocation?.name || "selected location"}. Weekly schedule and custom dates apply to this location only.`
                : "Click on a date to set custom working hours for that specific day."}
            </p>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-50 border-2 border-green-300 rounded-lg flex items-center justify-center text-sm font-semibold shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Default weekly hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 border-2 border-orange-400 rounded-lg flex items-center justify-center text-sm font-semibold text-orange-700 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Custom date hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-400 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Not working
                </span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <style>{`
              .rdp {
                --rdp-cell-size: 85px;
                --rdp-accent-color: #10b981;
                font-size: 16px;
                width: 100%;
              }
              @media (max-width: 768px) {
                .rdp {
                  --rdp-cell-size: 36px;
                  font-size: 10px;
                  width: 100%;
                }
              }
              .rdp-day {
                min-height: 85px !important;
                width: 85px !important;
                cursor: pointer !important;
                position: relative;
                padding: 10px 6px !important;
                border-radius: 8px !important;
                transition: all 0.2s ease;
                border: 2px solid transparent !important;
              }
              @media (max-width: 768px) {
                .rdp-day {
                  min-height: 36px !important;
                  width: 36px !important;
                  padding: 2px 1px !important;
                  border-radius: 3px !important;
                  border: 1px solid transparent !important;
                }
              }
              .rdp-day:hover:not(.rdp-day_disabled) {
                background-color: #f9fafb !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              @media (max-width: 768px) {
                .rdp-day:hover:not(.rdp-day_disabled) {
                  transform: none;
                  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
                }
              }
              .rdp-day_selected {
                background-color: #f0fdf4 !important;
                border-color: #86efac !important;
              }
              .rdp-caption {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 1.5rem;
                color: #111827;
              }
              @media (max-width: 768px) {
                .rdp-caption {
                  font-size: 14px;
                  margin-bottom: 0.75rem;
                  font-weight: 600;
                }
              }
              .rdp-head_cell {
                font-size: 14px;
                font-weight: 600;
                padding: 10px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              @media (max-width: 768px) {
                .rdp-head_cell {
                  font-size: 8px;
                  padding: 2px 1px;
                  letter-spacing: 0;
                }
              }
              .rdp-nav_button {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                transition: all 0.2s ease;
              }
              .rdp-nav_button:hover {
                background-color: #f3f4f6;
              }
              @media (max-width: 768px) {
                .rdp-nav_button {
                  width: 26px;
                  height: 26px;
                  font-size: 12px;
                }
              }
              .rdp-table {
                border-spacing: 4px;
              }
              @media (max-width: 768px) {
                .rdp-table {
                  border-spacing: 0;
                }
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

                  // Check if these hours are from custom schedule (after location filtering)
                  let isCustom = false;
                  if (customSchedule[dateStr]) {
                    // If we have custom schedule entries for this date
                    let customHours = customSchedule[dateStr];

                    // Filter by location if selected
                    if (multiLocationEnabled && selectedLocationId) {
                      customHours = filterHoursBySelectedLocation(customHours);
                    }

                    // Only mark as custom if there are hours after filtering
                    isCustom = customHours.length > 0;
                  }

                  return (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <span
                        className={`text-[10px] md:text-base mb-0 md:mb-1 ${
                          hours.length > 0
                            ? "font-semibold text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {hours.length > 0 && (
                        <div className="hidden md:block text-[6px] md:text-[10px] leading-tight space-y-0.5">
                          {hours.map((h, idx) => (
                            <div
                              key={idx}
                              className={`font-medium px-0.5 md:px-1.5 py-0.5 rounded text-center ${
                                isCustom
                                  ? "text-orange-700 bg-orange-100"
                                  : "text-green-700 bg-green-100"
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
                custom: "bg-orange-100 border-orange-300",
              }}
              className="border-0"
            />
          </div>

          {/* Weekly Default Schedule Summary */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                Default Weekly Schedule
                {multiLocationEnabled && selectedLocation && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    (for {selectedLocation.name})
                  </span>
                )}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {multiLocationEnabled
                ? "These hours apply only to the selected location unless overridden with custom date hours."
                : "These hours apply to all days unless overridden with custom hours."}
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
                let dayHours =
                  selectedBeautician.workingHours?.filter(
                    (wh) => wh.dayOfWeek === dayOfWeek,
                  ) || [];

                // Filter by selected location in multi-location mode
                if (multiLocationEnabled) {
                  dayHours = filterHoursBySelectedLocation(dayHours);
                }

                return (
                  <div
                    key={dayOfWeek}
                    className="flex items-center justify-between py-2 px-3 rounded border hover:bg-gray-50 gap-2"
                  >
                    <span className="font-medium text-gray-700 w-20 sm:w-28 text-sm sm:text-base">
                      {dayName}
                    </span>
                    <div className="flex-1 min-w-0">
                      {dayHours.length === 0 ? (
                        <span className="text-gray-400 text-xs sm:text-sm">
                          Not working
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {dayHours.map((h, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] sm:text-xs bg-green-50 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-green-200 whitespace-nowrap"
                              title="Scheduled hours"
                            >
                              {h.start} - {h.end}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => openWeeklyEditModal(dayOfWeek)}
                      className="ml-2 px-2 sm:px-3 py-1 text-xs sm:text-sm text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded border border-brand-200 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      Edit
                    </button>
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
                  .map(([dateStr, hours]) => {
                    const visibleHours =
                      multiLocationEnabled
                        ? filterHoursBySelectedLocation(hours)
                        : hours;

                    if (multiLocationEnabled && visibleHours.length === 0) {
                      return null;
                    }

                    return (
                      <div
                        key={dateStr}
                        className="flex items-center justify-between py-2 px-3 rounded border border-blue-200 bg-blue-50"
                      >
                        <span className="font-medium text-gray-700">
                          {dayjs(dateStr).format("ddd, MMM D, YYYY")}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {visibleHours.length === 0 ? (
                            <span className="text-xs text-gray-500">
                              Not working
                            </span>
                          ) : (
                            visibleHours.map((h, idx) => (
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
                    );
                  })
                  .filter(Boolean)}
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
              apply to{" "}
              <strong>
                {multiLocationEnabled
                  ? selectedLocation?.name || "the selected location"
                  : "this beautician"}
              </strong>{" "}
              on{" "}
              <strong>
                {selectedDate && dayjs(selectedDate).format("MMMM D, YYYY")}
              </strong>
              . Leave empty to use{" "}
              {multiLocationEnabled && selectedLocationId
                ? "location-specific"
                : "default"}{" "}
              weekly schedule.
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
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addTimeSlot}
            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-brand-600 border border-brand-300 rounded hover:bg-brand-50"
          >
            + Add Another Time Slot
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={clearWorkingHours}
              className="px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded text-xs sm:text-sm order-2 sm:order-1"
            >
              Clear Custom Hours
            </button>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm py-2"
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={saveWorkingHours}
                className="flex-1 sm:flex-initial text-xs sm:text-sm py-2"
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Weekly Schedule Modal */}
      <Modal
        open={editWeeklyModalOpen}
        onClose={() => setEditWeeklyModalOpen(false)}
        title={
          editingDayOfWeek !== null
            ? `Edit ${
                [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ][editingDayOfWeek]
              } Schedule`
            : "Edit Schedule"
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Weekly Schedule:</strong> These hours will apply to all{" "}
              {multiLocationEnabled ? (
                <>
                  appointments at{" "}
                  <strong>
                    {selectedLocation?.name || "the selected location"}
                  </strong>{" "}
                  on{" "}
                </>
              ) : null}
              {editingDayOfWeek !== null &&
                [
                  "Sundays",
                  "Mondays",
                  "Tuesdays",
                  "Wednesdays",
                  "Thursdays",
                  "Fridays",
                  "Saturdays",
                ][editingDayOfWeek]}{" "}
              unless overridden by a custom date.
            </p>
          </div>

          {weeklyDayHours.map((slot, index) => (
            <div
              key={index}
              className="flex items-end gap-3 pb-3 border-b last:border-b-0"
            >
              <FormField
                label={`Time Slot ${index + 1}`}
                htmlFor={`weekly-start-${index}`}
                className="flex-1"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    id={`weekly-start-${index}`}
                    className="border rounded px-3 py-2 w-full"
                    value={slot.start}
                    onChange={(e) =>
                      updateWeeklyTimeSlot(index, "start", e.target.value)
                    }
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    id={`weekly-end-${index}`}
                    className="border rounded px-3 py-2 w-full"
                    value={slot.end}
                    onChange={(e) =>
                      updateWeeklyTimeSlot(index, "end", e.target.value)
                    }
                  />
                </div>
              </FormField>
              {weeklyDayHours.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWeeklyTimeSlot(index)}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addWeeklyTimeSlot}
            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-brand-600 border border-brand-300 rounded hover:bg-brand-50"
          >
            + Add Another Time Slot
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={clearWeeklySchedule}
              className="px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded text-xs sm:text-sm order-2 sm:order-1"
            >
              Clear Hours
            </button>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => setEditWeeklyModalOpen(false)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm py-2"
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={saveWeeklySchedule}
                className="flex-1 sm:flex-initial text-xs sm:text-sm py-2"
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
