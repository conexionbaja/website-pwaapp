

# Phase C: Driver Portal

Build a dedicated `/driver` route where drivers log in with their regular auth account (linked via `drivers.user_id`) and manage their daily workflow: toggle availability, view assigned shipments, update shipment status/location, and add notes.

---

## 1. New Route: `/driver`

Add a `/driver` route in `App.tsx` protected by `RoleRoute` with `allowedRoles={['driver']}`. This redirects non-driver users away.

---

## 2. New Page: `src/pages/DriverPortal.tsx`

A single-page dashboard with three sections:

### 2a. Header Bar
- Driver name + phone (queried from `drivers` table using `user_id = auth.uid()`)
- Availability toggle (switch between `available`, `unavailable`, `on_route`) -- updates `drivers.availability_status` in real time

### 2b. Assigned Shipments List
- Query `shipments` where `driver_id` matches the driver's record
- Show cards with: tracking number, origin, destination, status badge, ETA, current location
- Filter tabs: "Active" (non-delivered/cancelled) and "Completed" (delivered/cancelled)

### 2c. Shipment Detail (expandable or click-to-open)
When a driver selects a shipment:
- **Status Update**: Dropdown to change status (limited driver set: `picked_up`, `in_transit`, `passed_city`, `out_for_delivery`, `delivered`, `delayed_mechanical`, `delayed_weather`, `delayed_custom`)
- **Current Location**: Text input to update `shipments.current_location`
- **Driver Notes**: Textarea to update `shipments.driver_notes`
- **Pallet List**: Read-only view of pallets sorted by position, showing destination city, load type, client name, weight
- **Status History Timeline**: Same timeline component as admin, querying `shipment_status_log`

Every status change inserts a row into `shipment_status_log` with `changed_by = auth.uid()`.

---

## 3. Navigation Update

- Add a "Driver Portal" link in the Header for users with the `driver` role
- The header already uses `useAuth()`, so we check `isDriver` and show the link conditionally

---

## 4. Login Redirect

Update the Login page so that after successful login:
- If user has `driver` role, redirect to `/driver`
- If user has `admin` role, redirect to `/admin`
- Otherwise, redirect to `/portal`

---

## No Database Changes

All required columns, tables, and RLS policies were created in Phase A. The driver portal is purely frontend.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/pages/DriverPortal.tsx` | Full driver dashboard page |

## Files to Modify

| File | Changes |
|---|---|
| `src/App.tsx` | Add `/driver` route with `RoleRoute` guard |
| `src/components/Header.tsx` | Add conditional "Driver Portal" nav link |
| `src/pages/Login.tsx` | Role-based redirect after login |

## Implementation Order

1. Create `DriverPortal.tsx` with availability toggle + shipment list + detail panel
2. Add route in `App.tsx`
3. Update `Header.tsx` with driver nav link
4. Update `Login.tsx` with role-based redirect

