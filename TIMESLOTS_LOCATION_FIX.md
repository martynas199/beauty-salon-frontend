# TimeSlots Location Filtering Fix

## Problem

The `/times` page was not respecting the selected location - it showed all time slots for the beautician regardless of which location was selected.

## Root Cause

The `useAvailableDates` hook and the `/api/slots/fully-booked` endpoint were not filtering by `locationId`. This meant:

1. Calendar showed incorrect "fully booked" dates (not location-specific)
2. Days that were fully booked for one location appeared available for another
3. Users could potentially see and book times when beautician wasn't working at the selected location

## Files Changed

### Frontend

#### 1. `src/hooks/useAvailableDates.js`

**Changes:**

- Added `locationId` parameter to hook signature
- Updated cache key to include locationId: `${beauticianId}:${year}-${month}:${locationId || 'all'}`
- Added locationId to API request params when fetching fully booked dates

**Code:**

```javascript
export function useAvailableDates(beauticianId, year, month, locationId) {
  // ...
  const cacheKey = `${beauticianId}:${year}-${String(month).padStart(2, "0")}:${locationId || 'all'}`;

  // ...
  const params = {
    beauticianId,
    year,
    month,
  };

  if (locationId) {
    params.locationId = locationId;
  }

  const response = await api.get("/slots/fully-booked", {
    params,
    signal: abortControllerRef.current.signal,
  });
}
```

#### 2. `src/components/DateTimePicker.jsx`

**Changes:**

- Pass `locationId` prop to `useAvailableDates` hook

**Code:**

```javascript
const {
  fullyBooked,
  isLoading: loadingAvailableDates,
  error: availableDatesError,
  refetch: refetchAvailableDates,
} = useAvailableDates(
  beauticianId,
  currentMonth.getFullYear(),
  currentMonth.getMonth() + 1,
  locationId, // ← Added
);
```

**Note:** DateTimePicker was already correctly passing locationId to the `/api/slots` endpoint (lines 143-147), so slot fetching was already location-aware.

### Backend

#### 3. `src/routes/slots.js` - `/fully-booked` endpoint

**Changes:**

- Extract `locationId` from query parameters
- Include locationId in cache key
- Filter workingHours by locationId
- Filter customSchedule by locationId
- Filter appointments by locationId

**Code:**

```javascript
r.get("/fully-booked", async (req, res) => {
  const { beauticianId, year, month, locationId } = req.query;

  // Cache key includes locationId
  const cacheKey = `${beauticianId}:${year}-${month}:${locationId || "all"}`;

  // ...

  // Filter custom schedule by locationId
  let customScheduleForDate = normalizedCustomSchedule[dateStr];
  if (customScheduleForDate && locationId) {
    customScheduleForDate = customScheduleForDate.filter(
      (cs) => !cs.locationId || cs.locationId.toString() === locationId,
    );
  }

  // Filter working hours by locationId
  let workingHoursForDay =
    beautician.workingHours?.filter((wh) => wh.dayOfWeek === dayOfWeek) || [];

  if (locationId) {
    workingHoursForDay = workingHoursForDay.filter(
      (wh) => !wh.locationId || wh.locationId.toString() === locationId,
    );
  }

  // Filter appointments by locationId
  const appointmentQuery = {
    beauticianId,
    start: { $gte: dayStart, $lt: dayEnd },
    status: { $ne: "cancelled" },
  };

  if (locationId) {
    appointmentQuery.locationId = locationId;
  }

  const appts = await Appointment.find(appointmentQuery).lean();
});
```

## How It Works Now

### Booking Flow with Location Filtering

1. **Service Selection** → Select service and variant
2. **Beautician Selection** → Select beautician (see location badges)
3. **Location Selection** → Choose specific location (LocationSelector modal)
4. **Time Slot Selection** → Calendar and slots filtered by location:
   - ✅ Redux stores `locationId` in booking state
   - ✅ TimeSlots page passes locationId to DateTimePicker
   - ✅ useAvailableDates hook passes locationId to `/api/slots/fully-booked`
   - ✅ Backend filters working hours, custom schedule, and appointments by location
   - ✅ Calendar shows correct "fully booked" dates for selected location
   - ✅ Time slots only show available times at selected location
5. **Checkout** → Complete booking

### Data Flow

```
Redux (locationId)
  ↓
TimeSlots.jsx
  ↓
DateTimePicker.jsx
  ↓
useAvailableDates(beauticianId, year, month, locationId)
  ↓
GET /api/slots/fully-booked?beauticianId=X&year=2025&month=1&locationId=Y
  ↓
Backend filters:
  - workingHours by locationId
  - customSchedule by locationId
  - appointments by locationId
  ↓
Returns location-specific fully booked dates
```

## Testing

### Test Case 1: Beautician with Multiple Locations

1. **Setup:**

   - Beautician works at Location A: Mon-Wed 9am-5pm
   - Beautician works at Location B: Thu-Fri 10am-6pm

2. **Expected Behavior:**

   - Select Location A → Calendar enables Mon-Wed, disables Thu-Fri
   - Select Location B → Calendar enables Thu-Fri, disables Mon-Wed
   - Time slots only show hours for selected location

3. **Verify:**
   ```bash
   # Check Network tab for /api/slots/fully-booked call
   # Should include locationId parameter
   ```

### Test Case 2: Fully Booked Days Per Location

1. **Setup:**

   - Location A: Monday has all slots booked
   - Location B: Monday has available slots

2. **Expected Behavior:**
   - Select Location A → Monday appears fully booked (grayed out)
   - Select Location B → Monday appears available (clickable)

### Test Case 3: Cache Validation

1. **Verify cache keys include locationId:**

   ```javascript
   // Frontend cache
   "beautician123:2025-01:location456";
   "beautician123:2025-01:location789";

   // Backend cache
   "beautician123:2025-01:location456";
   "beautician123:2025-01:all";
   ```

## Related Files

- ✅ `src/routes/slots.js` - Main slots endpoint (already filters by locationId)
- ✅ `src/hooks/useAvailableDates.js` - Hook for fetching fully booked dates
- ✅ `src/components/DateTimePicker.jsx` - Date/time picker component
- ✅ `src/features/availability/TimeSlots.jsx` - Time slots page
- ✅ `src/features/locations/LocationSelector.jsx` - Location selection modal (fixed earlier)

## Previous Related Fixes

This is the **4th bug fix** in the multi-location testing phase:

1. ✅ Fixed `finalPrice` undefined in BeauticianSelectionPage
2. ✅ Fixed LocationSelector not fetching beautician locations (fetch → api client)
3. ✅ Fixed WorkingHoursCalendar not filtering by selected location
4. ✅ Fixed TimeSlots not respecting selected location (this fix)

## Deployment Notes

1. Deploy backend first (slots.js changes)
2. Clear fully-booked cache if necessary
3. Deploy frontend (useAvailableDates + DateTimePicker changes)
4. Clear browser cache/localStorage to reset cached dates
5. Test location-specific scheduling thoroughly

## Status

✅ **COMPLETE** - TimeSlots page now correctly filters by selected location
