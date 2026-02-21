

# Phase B: Enhanced Admin Panel Forms

Update all admin manager components to use the new database columns added in Phase A, expand the shipment statuses, add auto-sort for pallets, add status history logging, update the Rastreo tracking page, and add a "Convert to Invoice" action on quotes.

---

## 1. TrucksManager.tsx -- Add New Fields

**Current:** Only plate_number, model, capacity_kg, active.
**Add to form and table:**

- VIN (text input)
- Vehicle Type (select: truck, half_box_trailer, full_box_trailer)
- Capacity Pallets (number input)
- Current Status (select: available, in_transit, maintenance, inactive)
- Last Maintenance Date (date picker using Popover + Calendar)
- Assigned Driver (select dropdown from drivers list, queried from DB)

**Table columns update:** Plate | VIN | Type | Model | Capacity (kg/pallets) | Status | Driver | Active | Actions

The form interface grows from 4 fields to 9 fields. The dialog will use a scrollable layout.

---

## 2. DriversManager.tsx -- Add Availability Status

**Current:** full_name, phone, license_number, active.
**Add to form and table:**

- Availability Status (select: available, unavailable, on_route) -- displayed as a colored badge in the table
- User ID link (optional text input for linking a driver to an auth user account)

**Table columns update:** Name | Phone | License | Availability | Active | Actions

---

## 3. ShipmentsManager.tsx -- Expanded Statuses, Load Details, Auto-Sort, Status Log

This is the largest change. Multiple sub-tasks:

### 3a. Expanded Status List

Replace the current 5 statuses with the full list from the requirements doc:

```text
created, assigned, picked_up, in_transit, passed_city,
out_for_delivery, delivered, delayed_mechanical,
delayed_weather, delayed_custom, on_time, cancelled
```

Each status gets a color badge. The status dropdown in both the creation form and the table action column will use the full list.

### 3b. Shipment Creation Form -- New Fields

Add to the create shipment dialog:
- Estimated Delivery Date (date picker)
- Current Location (text, optional)

### 3c. Pallet/Load Sub-Panel -- New Fields

When expanding a shipment row, the "Add Pallet" form currently has: description, weight, dimensions.

**Add:**
- Load Type (select: pallet, package, box, envelope)
- Destination City (select from route cities: Tijuana, Ensenada, San Quintin, Guerrero Negro, Mulege, La Paz, Cabo San Lucas)
- Origin City (select, same list)
- Client Name (text)
- Delivery Address (text)
- Delivery Contact (text)
- Cost (number)
- Payment Status (select: pending, paid, partial, cod)
- Special Handling (text)

The pallet cards in the grid will show: description, load_type badge, destination_city, weight, cost, payment_status.

### 3d. Auto-Sort Button

Add an "Auto-Sort" button in the pallet sub-panel header. When clicked:

1. Define a route order constant:
   ```
   Tijuana=0, Ensenada=1, San Quintin=2, Guerrero Negro=3,
   Mulege=4, La Paz=5, Cabo San Lucas=6
   ```
2. Sort pallets by destination_city index descending (farthest first = innermost position 0)
3. Batch-update all pallet positions in the database
4. Refresh the pallet list

### 3e. Status Change Logging

Every time an admin changes a shipment's status via the dropdown:
1. Insert a row into `shipment_status_log` with (shipment_id, status, changed_by = current user id)
2. The existing `updateStatus` mutation already does the status update -- we add the log insert right after

### 3f. Status History Timeline

Add a "History" button or auto-show a timeline below the pallet section when a shipment is expanded. Query `shipment_status_log` for that shipment and display a vertical timeline showing: status, timestamp, location, notes.

---

## 4. InvoicesManager.tsx -- Expanded Payment Statuses

**Current statuses:** pending, paid, cancelled.
**New statuses:** pending, paid_full, paid_partial, cod, online_on_delivery, cancelled, overdue.

Add each with a distinct color badge. The status dropdown in the table uses the full list.

---

## 5. QuoteRequests.tsx -- Validity Period and Convert to Invoice

### 5a. Valid Until Field

Add a date picker in the Quote dialog for setting the `valid_until` date. Display it in the table as a column.

### 5b. Convert to Invoice Action

Add a "Convert to Invoice" button (next to the existing "Convert to Shipment" button) for quoted requests. When clicked:
- Create an invoice with amount = quote_price, user_id = quote user_id
- Mark the quote as "closed"
- Show success toast

---

## 6. Rastreo.tsx -- Expanded Status Timeline

**Current:** Shows only 4 status steps (pending, loading, in_transit, delivered).
**Update:** Show the full expanded status list as timeline steps. Also query `shipment_status_log` for that shipment to show actual timestamps for each status change.

Add:
- ETA display if `estimated_delivery_at` is set
- Current location display if set
- Delay reason display if set
- Driver notes if set

---

## 7. Portal.tsx -- Status History in Shipment Detail

When a user expands a shipment in their portal, also show the status history timeline (queried from `shipment_status_log`), similar to Rastreo.

---

## 8. Admin.tsx -- Add Reports Tab (Placeholder)

Add a "Reports" tab to the admin sidebar. For now it will be a placeholder component (`Reports.tsx`) that displays "Coming soon" -- the full reporting module will be Phase E or later.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/pages/admin/Reports.tsx` | Placeholder reports page |

## Files to Modify

| File | Changes |
|---|---|
| `src/pages/admin/TrucksManager.tsx` | Add VIN, vehicle_type, capacity_pallets, current_status, maintenance date, assigned driver fields |
| `src/pages/admin/DriversManager.tsx` | Add availability_status field and user_id link |
| `src/pages/admin/ShipmentsManager.tsx` | Expanded statuses, new pallet fields, auto-sort, status log insert, history timeline |
| `src/pages/admin/InvoicesManager.tsx` | Expanded payment statuses |
| `src/pages/admin/QuoteRequests.tsx` | Valid_until date picker, convert-to-invoice button |
| `src/pages/Rastreo.tsx` | Expanded status timeline with history from shipment_status_log, ETA/location display |
| `src/pages/Portal.tsx` | Status history timeline in shipment detail |
| `src/pages/Admin.tsx` | Add Reports tab to sidebar |

## No Database Changes

All columns and tables were created in Phase A. This phase is purely frontend/UI updates.

## Implementation Order

1. TrucksManager (simplest, adds form fields)
2. DriversManager (small, adds availability)
3. ShipmentsManager (largest -- statuses, pallet fields, auto-sort, status log)
4. InvoicesManager (small, expand statuses)
5. QuoteRequests (add validity + convert-to-invoice)
6. Rastreo + Portal (public-facing timeline updates)
7. Admin sidebar + Reports placeholder

