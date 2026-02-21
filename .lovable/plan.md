

# Gap Analysis: Software Requirements Document vs Current System

This plan maps every section of the requirements document to what already exists, identifies gaps, and provides a phased implementation approach. Points 11-13 and 15-16 are treated as optional guidelines; point 14 is excluded.

---

## What Already Exists (Reusable)

| Doc Section | Current Status |
|---|---|
| User roles (admin, user) | `user_roles` table + `has_role()` function + RLS + AuthContext with `isAdmin` |
| Truck registration (basic) | `trucks` table with plate, model, capacity_kg, active |
| Driver management | `drivers` table with full_name, phone, license_number, active |
| Shipments / Embarques | `shipments` table with tracking, origin, destination, status, driver/truck FK |
| Pallets / Bytarimas | `shipment_pallets` table with description, weight, dimensions, position |
| Quote requests | `quote_requests` with price, notes, convert-to-shipment flow |
| Invoices | `invoices` table with amount, currency, status, shipment FK |
| Client portal | `/portal` with tabs for quotes, shipments, invoices |
| Public tracking | `/rastreo` querying shipments by tracking number |
| Services CRUD | `services` table + admin ServicesManager |
| Admin panel | Sidebar with Pages, Blog, Services, Quotes, Shipments, Drivers, Trucks, Invoices, Newsletter, Subscribers |

---

## Identified Gaps (Grouped by Priority)

### GAP 1 -- New Roles: "driver" and "executive" (Doc Section 1.2)

**Current:** Only `admin` and `user` in `app_role` enum.
**Needed:** Add `driver`, `logistics_manager`, `executive` roles.

- Add new enum values to `app_role`
- Update `AuthContext` to expose the current role (not just `isAdmin`)
- Create role-based route guards for driver and executive portals

---

### GAP 2 -- Enhanced Truck/Fleet Data (Doc Section 2.1)

**Current:** `trucks` has plate_number, model, capacity_kg, active.
**Needed:** VIN, vehicle_type (truck, half_box_trailer, full_box_trailer), capacity_pallets, capacity_volume, current_status (available, in_transit, maintenance, inactive), last_maintenance_date, assigned driver FK.

- Migration: add columns to `trucks` table
- Update `TrucksManager.tsx` form to include new fields

---

### GAP 3 -- Driver Portal / PWA (Doc Section 6)

**Current:** No driver-facing portal. Drivers are just data records.
**Needed:** A `/driver` route (PWA-capable) where drivers can:
- Log in and set availability ("Open to Receive Loads")
- View assigned loads/shipments
- Update shipment status (picked_up, in_transit, passed_city, delivered)
- Add delivery notes

- Add `availability_status` column to `drivers` table
- Link drivers to auth users via a `user_id` FK on `drivers`
- Create `DriverPortal.tsx` page
- Add RLS policies so drivers can SELECT/UPDATE their own shipments

---

### GAP 4 -- Enhanced Load/Shipment Model (Doc Sections 3, 5)

**Current statuses:** pending, loading, in_transit, delivered, cancelled.
**Needed statuses:** created, assigned, picked_up, in_transit, passed_city, out_for_delivery, delivered, delayed_mechanical, delayed_weather, delayed_custom, on_time, cancelled.

**Missing shipment fields:**
- `estimated_delivery_at` (timestamptz)
- `actual_delivery_at` (timestamptz)
- `current_location` (text, for city checkpoints)
- `delay_reason` (text)
- `driver_notes` (text)

**Missing pallet/load fields:**
- `load_type` (package, box, envelope, pallet)
- `origin_city`, `destination_city` (per-load, not just per-shipment)
- `client_name`, `delivery_address`, `delivery_contact`
- `cost`, `payment_status`
- `special_handling` (text)

- Migration: add columns to `shipments` and `shipment_pallets`
- Create a `shipment_status_log` table for status history timeline
- Update ShipmentsManager and Rastreo to use expanded statuses

---

### GAP 5 -- Load Sorting / Route Optimization (Doc Section 3.2)

**Current:** Pallets have a `position` field but no auto-sort logic.
**Needed:** Auto-sort pallets by delivery sequence (reverse route order: Tijuana -> Ensenada -> ... -> Cabo San Lucas).

- Define a route city order constant (Tijuana=0, Ensenada=1, ..., Cabo San Lucas=7)
- Add an "Auto-Sort" button in ShipmentsManager pallet sub-panel
- Sort pallets by destination city index descending (innermost = farthest)

---

### GAP 6 -- Payment Management (Doc Section 4)

**Current:** Invoices have basic pending/paid/cancelled status.
**Needed:** Full payment scenarios (upfront, split 50/50, COD, pay-at-office, online-on-delivery) with fee calculations.

- Add `payment_method` and `payment_terms` columns to `shipment_pallets` (per-load) or a new `payments` table
- Add fee percentage configuration
- Expand invoice statuses: paid_full, paid_partial, pending, cod, online_on_delivery
- Update InvoicesManager UI

---

### GAP 7 -- Quotation-to-Invoice Flow (Doc Section 8)

**Current:** Quote -> Shipment conversion exists. No quote -> invoice path.
**Needed:** Quote -> Invoice conversion with auto-populated fields, validity period, PDF generation.

- Add `valid_until` column to `quote_requests`
- Add "Convert to Invoice" action on quoted requests
- PDF generation is optional (can be a later phase)

---

### GAP 8 -- Executive Dashboard (Doc Section 10)

**Current:** No executive dashboard exists.
**Needed:** A `/executive` route with KPI cards and charts (on-time rate, revenue, fleet utilization, payment collection, delivery performance).

- Create `ExecutiveDashboard.tsx` using recharts (already installed)
- Query aggregate data from shipments, invoices, trucks
- Role-gate to `executive` role

---

### GAP 9 -- Reporting Module (Doc Section 9)

**Current:** No reporting.
**Needed:** Daily delivery report, fleet utilization, driver performance, revenue, payment collection.

- Create a `Reports.tsx` admin tab
- Use recharts for charts and tables for data
- Add date range filters and export-to-CSV functionality

---

### GAP 10 -- Shipment Status History Log (Doc Sections 5, 7)

**Current:** Only current status stored; no history.
**Needed:** A timeline of every status change with timestamp, location, and who made the change.

- Create `shipment_status_log` table (shipment_id, status, location, notes, changed_by, created_at)
- Insert a log row every time status changes
- Display timeline in Rastreo and Portal shipment detail

---

## Implementation Phases

### Phase A -- Database Enhancements (Foundation)

1. Extend `app_role` enum with `driver`, `logistics_manager`, `executive`
2. Add columns to `trucks`: vin, vehicle_type, capacity_pallets, current_status, last_maintenance_date, assigned_driver_id
3. Add columns to `drivers`: user_id (FK to auth.users), availability_status
4. Add columns to `shipments`: estimated_delivery_at, actual_delivery_at, current_location, delay_reason, driver_notes
5. Add columns to `shipment_pallets`: load_type, destination_city, client_name, delivery_address, delivery_contact, cost, payment_status, special_handling
6. Add columns to `quote_requests`: valid_until
7. Create `shipment_status_log` table
8. Update RLS: drivers can SELECT/UPDATE their assigned shipments; executives can SELECT all data

### Phase B -- Enhanced Admin Panel

1. Update `TrucksManager.tsx` with new fields (vehicle_type, VIN, capacity_pallets, status, maintenance date)
2. Update `ShipmentsManager.tsx` with expanded statuses, per-load details, auto-sort button, status history timeline
3. Update `InvoicesManager.tsx` with payment method/terms fields
4. Update `QuoteRequests.tsx` with validity period and convert-to-invoice action
5. Add Reports tab to Admin with operational and financial reports using recharts

### Phase C -- Driver Portal

1. Create `/driver` route with DriverPortal.tsx
2. Driver login links their auth user to the `drivers` record via `user_id`
3. Dashboard: set availability, view assigned shipments, update status, add notes
4. RLS policies for driver self-service

### Phase D -- Executive Dashboard

1. Create `/executive` route with ExecutiveDashboard.tsx
2. KPI cards: on-time delivery rate, revenue, fleet availability, payment collection rate
3. Charts: revenue trend (recharts line), delivery performance (bar), fleet utilization (pie)
4. Date range selector and period comparison

### Phase E -- Load Sorting and Payment Logic

1. Route city order constant for Baja California route
2. Auto-sort function in pallet sub-panel
3. Payment scenarios with fee calculation logic
4. Payment method selection in load creation

---

## Files to Create

- `src/pages/DriverPortal.tsx` -- Driver PWA portal
- `src/pages/ExecutiveDashboard.tsx` -- Executive KPI dashboard
- `src/pages/admin/Reports.tsx` -- Reporting module

## Files to Modify

- `src/contexts/AuthContext.tsx` -- expose full role, not just isAdmin
- `src/components/AdminRoute.tsx` -- generalize to role-based guard
- `src/App.tsx` -- add /driver and /executive routes
- `src/pages/Admin.tsx` -- add Reports tab
- `src/pages/admin/TrucksManager.tsx` -- new fields
- `src/pages/admin/ShipmentsManager.tsx` -- expanded statuses, load details, auto-sort, status log
- `src/pages/admin/InvoicesManager.tsx` -- payment methods
- `src/pages/admin/QuoteRequests.tsx` -- validity, convert-to-invoice
- `src/pages/Rastreo.tsx` -- expanded status timeline with history
- `src/pages/Portal.tsx` -- shipment detail with status history

## Database Migrations

- One migration for schema changes (new columns, new table, enum extension, RLS updates)

## Notes

- Points 11-13, 15-16 (performance, integrations, scalability, success criteria, timeline) are treated as guidelines, not blocking requirements
- Point 14 (deployment/maintenance) is excluded per your instruction
- GPS/mapping integration (Google Maps) can be explored as a future enhancement once the driver portal is live
- Payment gateway integration (Stripe) is already available via Lovable's Stripe connector when ready
- PDF invoice generation can be added as an edge function in a later iteration
