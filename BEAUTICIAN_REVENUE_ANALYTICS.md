# Beautician Revenue Analytics Feature

## Overview

Implemented a comprehensive revenue analytics system for beauticians/specialists to view their earnings breakdown by payment type (deposit vs full payment) with month-by-month filtering.

## What Was Implemented

### Backend (3 files modified/created)

#### 1. New Route: `/src/routes/beauticianRevenue.js`

- **Authentication**: Requires logged-in admin with linked beautician profile
- **Two Endpoints**:

##### GET `/api/beautician-revenue/analytics`

Query Parameters:

- `month`: YYYY-MM format (e.g., "2026-01") - Optional
- `year`: YYYY format (e.g., "2026") - Optional
- If neither specified, defaults to current month

Response includes:

- **Summary**: Total revenue, total appointments, average per appointment
- **Breakdown**:
  - Deposit payments (amount, count, percentage)
  - Full payments (amount, count, percentage)
- **Beautician info**: Name, email, Stripe connection status, lifetime earnings
- **Appointment list**: Individual transactions with dates and amounts

##### GET `/api/beautician-revenue/months`

Returns list of all months with revenue data for dropdown selector.
Response format:

```json
{
  "months": [
    { "value": "2026-01", "label": "January 2026" },
    { "value": "2025-12", "label": "December 2025" }
  ]
}
```

#### 2. Modified: `/src/server.js`

- Imported `beauticianRevenueRouter`
- Added route: `app.use("/api/beautician-revenue", beauticianRevenueRouter)`
- Route is protected (requires authentication via middleware)

### Frontend (3 files modified/created)

#### 1. New Page: `/src/admin/pages/BeauticianRevenue.jsx`

A beautiful, comprehensive revenue analytics dashboard featuring:

**Visual Components**:

- **Month Selector Dropdown**: Easy navigation between available months
- **Summary Cards**:

  - Total Revenue (branded gradient card)
  - Average per Appointment (white card with icon)
  - Lifetime Earnings (white card with trending icon)

- **Payment Breakdown Section**:

  - Side-by-side cards for Deposits vs Full Payments
  - Color-coded (purple for deposits, green for full payments)
  - Shows amount, count, and percentage for each
  - Visual progress bar showing distribution

- **Stripe Status Banner**:
  - Green banner if connected
  - Yellow warning if not connected
  - Encourages connection for automatic payouts

**Error States**:

- No beautician profile linked
- No revenue data available yet
- Loading states with spinners

#### 2. Modified: `/src/app/routes.jsx`

- Imported `BeauticianRevenue` component (lazy loaded)
- Added route: `/admin/beautician-revenue`
- Wrapped in Suspense with loading fallback

#### 3. Modified: `/src/admin/AdminLayout.jsx`

- Added "My Revenue" menu item
- Icon: trending chart
- Only visible to admins with linked beautician profiles
- Added `requiresBeautician` flag support in menu filtering
- Updated filter logic to check `admin?.beauticianId`

## Features

### Data Breakdown

The system categorizes all payments into two types:

1. **Deposit Payments** (`mode === "deposit"`):

   - Partial upfront payments
   - Tracked with deposit percentage
   - Remaining balance collected later

2. **Full Payments** (all other modes):
   - `pay_now`: Complete payment upfront
   - `pay_in_salon`: Payment collected in salon
   - `booking_fee`: Booking fee only

### Calculations

- **Total Revenue**: Sum of all completed/paid appointment prices
- **Average Revenue**: Total / number of appointments
- **Percentage Breakdown**: (Category Amount / Total Revenue) × 100
- **Lifetime Earnings**: Pulled from beautician's `totalEarnings` field

### Security

- **Authentication Required**: JWT token verification
- **Beautician Linking**: Admin must have `beauticianId` set
- **Data Isolation**: Only shows data for the authenticated beautician
- **Date Range Filtering**: Prevents unauthorized access to other beautician data

## Database Queries

The system queries the `Appointment` collection with filters:

```javascript
{
  beauticianId: <authenticated_beautician_id>,
  start: { $gte: startDate, $lte: endDate },
  status: { $in: ["confirmed", "completed"] },
  "payment.status": "succeeded"
}
```

Only counts appointments that are:

- Assigned to the authenticated beautician
- Within the selected date range
- Confirmed or completed
- Paid successfully

## UI/UX Highlights

1. **Responsive Design**: Works on mobile, tablet, and desktop
2. **Beautiful Cards**: Professional gradient and shadow effects
3. **Color Coding**:
   - Brand purple for deposits
   - Green for full payments
   - Yellow for warnings
4. **Visual Progress Bar**: Shows payment distribution at a glance
5. **Clear Icons**: Each section has meaningful icons
6. **Loading States**: Smooth transitions with spinners
7. **Error Handling**: User-friendly error messages
8. **Auto-Select**: Most recent month selected by default

## Navigation

**Menu Location**: Admin sidebar under "Core" section (after Revenue Analytics)
**Menu Item**: "My Revenue" with trending icon
**Visibility**: Only shown to admins with linked beautician profiles

## API Testing

Test the endpoints with:

```bash
# Get available months
GET /api/beautician-revenue/months
Authorization: Bearer <jwt_token>

# Get analytics for January 2026
GET /api/beautician-revenue/analytics?month=2026-01
Authorization: Bearer <jwt_token>

# Get analytics for entire year 2026
GET /api/beautician-revenue/analytics?year=2026
Authorization: Bearer <jwt_token>

# Get analytics for current month (no params)
GET /api/beautician-revenue/analytics
Authorization: Bearer <jwt_token>
```

## Future Enhancements

Potential additions:

- [ ] Export to CSV/PDF
- [ ] Year-over-year comparison charts
- [ ] Service-level breakdown
- [ ] Client acquisition metrics
- [ ] Projected earnings based on trends
- [ ] Email reports (monthly summary)
- [ ] Chart visualizations (line/bar charts)
- [ ] Compare multiple months side-by-side

## Files Changed

### Backend

1. ✅ Created: `src/routes/beauticianRevenue.js` (new route handler)
2. ✅ Modified: `src/server.js` (added route registration)

### Frontend

1. ✅ Created: `src/admin/pages/BeauticianRevenue.jsx` (main UI component)
2. ✅ Modified: `src/app/routes.jsx` (added route and lazy import)
3. ✅ Modified: `src/admin/AdminLayout.jsx` (added menu item and filtering)

## Testing Checklist

- [ ] Login as admin with linked beautician
- [ ] Navigate to "My Revenue" in sidebar
- [ ] Verify month selector shows available months
- [ ] Select different months and verify data changes
- [ ] Check summary cards display correctly
- [ ] Verify deposit vs full payment breakdown
- [ ] Check percentage calculations are accurate
- [ ] Verify Stripe connection status banner
- [ ] Test with no revenue data (new beautician)
- [ ] Test with admin without beautician link
- [ ] Verify responsive design on mobile
- [ ] Check loading states work properly
- [ ] Verify error handling with network issues

## Configuration

No additional configuration required. The feature uses existing:

- JWT authentication from environment variables
- MongoDB connection for appointment queries
- Existing admin/beautician linking system
- Current payment mode categorization

## Notes

- Only completed and paid appointments are counted
- Cancelled or unpaid appointments are excluded
- Platform fees are not deducted (shows full service price)
- Dates are inclusive (start of first day to end of last day)
- All amounts in GBP (£)
- Percentages rounded to 2 decimal places
