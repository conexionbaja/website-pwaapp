

# Phase D: Executive Dashboard and Reports

Replace the placeholder Reports page with a full analytics dashboard showing real-time KPIs, revenue charts, and operational metrics. Also create a dedicated `/executive` route for executive-role users.

---

## 1. Reports Page: `src/pages/admin/Reports.tsx` (Rewrite)

Replace the "Coming soon" placeholder with a full dashboard containing:

### 1a. KPI Summary Cards (top row)
Four metric cards queried from existing tables:
- **Active Shipments**: Count of shipments where status is not `delivered` or `cancelled`
- **Revenue (month)**: Sum of `invoices.amount` for current month where status contains `paid`
- **Fleet Utilization**: Percentage of trucks with `current_status = 'in_transit'` vs total active trucks
- **Pending Quotes**: Count of `quote_requests` with `status = 'pending'`

### 1b. Revenue Chart (Recharts BarChart)
- Monthly revenue for the last 6 months, grouped from `invoices` table by `created_at` month
- Bar chart using the already-installed `recharts` library
- Currency displayed in MXN

### 1c. Shipment Status Breakdown (Recharts PieChart)
- Count of shipments grouped by status
- Pie chart with color-coded segments matching the status badge colors

### 1d. Recent Activity Feed
- Last 10 entries from `shipment_status_log` joined with shipment tracking numbers
- Shows: timestamp, tracking number, old status arrow new status, changed by

### 1e. Driver Availability Summary
- Simple table/list: count of drivers by `availability_status` (available, unavailable, on_route)

---

## 2. Executive Route: `/executive`

- Add a `/executive` route in `App.tsx` protected by `RoleRoute` with `allowedRoles={['executive']}`
- Create `src/pages/ExecutiveDashboard.tsx` that renders the same Reports component but wrapped in its own layout with Header/Footer (since executives are not admins and don't see the admin sidebar)

---

## 3. Navigation Updates

- Add "Dashboard" link in Header for users with `executive` role
- Update Login redirect: executive role goes to `/executive`

---

## 4. Database Changes

**None required for data.** All tables and RLS policies already grant SELECT access to executives.

One small addition: enable the `shipment_status_log` table for anonymous SELECT by tracking number lookup (not needed -- executives already have SELECT via RLS). No migration needed.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/pages/ExecutiveDashboard.tsx` | Executive-facing dashboard page with Header/Footer |

## Files to Modify

| File | Changes |
|---|---|
| `src/pages/admin/Reports.tsx` | Full rewrite: KPI cards, revenue chart, pie chart, activity feed, driver summary |
| `src/App.tsx` | Add `/executive` route with RoleRoute guard |
| `src/components/Header.tsx` | Add conditional "Dashboard" nav link for executives |
| `src/pages/Login.tsx` | Add executive role redirect to `/executive` |

## Implementation Order

1. Rewrite `Reports.tsx` with KPI cards + charts + activity feed
2. Create `ExecutiveDashboard.tsx` wrapping Reports in a standalone layout
3. Add `/executive` route in `App.tsx`
4. Update `Header.tsx` with executive nav link
5. Update `Login.tsx` with executive redirect

