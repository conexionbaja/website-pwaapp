

# Phase A: Database Enhancements (Foundation)

This migration adds new roles, expands table schemas, creates the status history log table, and updates RLS policies to support drivers and executives. All existing tables are empty (0 rows), so changes are safe.

---

## 1. Extend `app_role` Enum

Add three new values: `driver`, `logistics_manager`, `executive`

```sql
ALTER TYPE public.app_role ADD VALUE 'driver';
ALTER TYPE public.app_role ADD VALUE 'logistics_manager';
ALTER TYPE public.app_role ADD VALUE 'executive';
```

---

## 2. Add Columns to `trucks`

| New Column | Type | Default | Notes |
|---|---|---|---|
| vin | text | NULL | Vehicle Identification Number |
| vehicle_type | text | 'truck' | truck, half_box_trailer, full_box_trailer |
| capacity_pallets | integer | NULL | Max pallet count |
| current_status | text | 'available' | available, in_transit, maintenance, inactive |
| last_maintenance_date | date | NULL | |
| assigned_driver_id | uuid (FK drivers) | NULL | Currently assigned driver |

---

## 3. Add Columns to `drivers`

| New Column | Type | Default | Notes |
|---|---|---|---|
| user_id | uuid | NULL | Links driver record to auth user for portal login |
| availability_status | text | 'unavailable' | available, unavailable, on_route |

---

## 4. Add Columns to `shipments`

| New Column | Type | Default | Notes |
|---|---|---|---|
| estimated_delivery_at | timestamptz | NULL | ETA |
| actual_delivery_at | timestamptz | NULL | When actually delivered |
| current_location | text | NULL | City checkpoint |
| delay_reason | text | NULL | Reason if delayed |
| driver_notes | text | NULL | Notes from driver |

---

## 5. Add Columns to `shipment_pallets`

| New Column | Type | Default | Notes |
|---|---|---|---|
| load_type | text | 'pallet' | package, box, envelope, pallet |
| origin_city | text | NULL | Per-load origin |
| destination_city | text | NULL | Per-load destination (for sorting) |
| client_name | text | NULL | |
| delivery_address | text | NULL | |
| delivery_contact | text | NULL | |
| cost | numeric | NULL | |
| payment_status | text | 'pending' | pending, paid, partial, cod |
| special_handling | text | NULL | |

---

## 6. Add Column to `quote_requests`

| New Column | Type | Default |
|---|---|---|
| valid_until | timestamptz | NULL |

---

## 7. Create `shipment_status_log` Table

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| shipment_id | uuid FK shipments | NOT NULL |
| status | text | NOT NULL |
| location | text | nullable |
| notes | text | nullable |
| changed_by | uuid | nullable (auth user who made change) |
| created_at | timestamptz | default now() |

RLS: Admins full access; authenticated users can SELECT logs for their own shipments; drivers can SELECT/INSERT logs for their assigned shipments.

---

## 8. Update RLS Policies

**New `has_role` function** already supports the new enum values automatically since it checks the `user_roles` table.

**Drivers need:**
- SELECT on `shipments` where `driver_id` matches their driver record
- UPDATE on `shipments` (status, current_location, driver_notes) for their assigned shipments
- SELECT on `shipment_pallets` for their assigned shipments
- INSERT on `shipment_status_log` for their assigned shipments
- SELECT on `drivers` for their own record

**Executives need:**
- SELECT on `shipments`, `invoices`, `trucks`, `drivers`, `shipment_pallets`, `shipment_status_log`

We will create a helper function `get_driver_id_for_user(uuid)` to safely look up a driver by `user_id` without recursive RLS issues.

---

## 9. Update `AuthContext.tsx`

- Add a `role` field (string) exposing the user's primary role
- Keep `isAdmin` for backward compatibility
- Add `isDriver` and `isExecutive` convenience booleans
- Query `user_roles` to get the role on login

---

## 10. Generalize Route Guard

- Update `AdminRoute.tsx` to accept an `allowedRoles` prop
- Create a reusable `RoleRoute` component
- Keep `AdminRoute` as a wrapper for backward compatibility

---

## Files to Modify

- **Database**: 1 migration with all schema changes + RLS updates
- `src/contexts/AuthContext.tsx` -- add `role`, `isDriver`, `isExecutive`
- `src/components/AdminRoute.tsx` -- generalize to accept roles

## No UI Changes in This Phase

Phase A is purely foundational. The admin panel forms (TrucksManager, ShipmentsManager, etc.) will be updated in Phase B to use the new columns.

