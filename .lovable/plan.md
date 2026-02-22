

# Phase G: Logistics Manager Role, Email Notifications, and PWA Enhancements

Introduce the logistics_manager role (already defined in AuthContext but without a dedicated portal), add real email notifications for form submissions, and polish the PWA experience.

---

## 1. Logistics Manager Portal (`src/pages/LogisticsPortal.tsx`)

The `logistics_manager` role already exists in AuthContext and has RLS policies on shipments, pallets, trucks, drivers, and status logs. But there is no dedicated page. Create one:

- Tabbed layout with Header/Footer (same pattern as DriverPortal/ExecutiveDashboard)
- **Shipments Tab**: View all shipments, update status, add status log entries (reuse ShipmentsManager patterns but scoped to logistics operations -- no delete)
- **Trucks Tab**: View truck fleet with status and assigned drivers (read-only)
- **Drivers Tab**: View driver availability (read-only)

This avoids giving logistics managers full admin access while letting them manage day-to-day operations.

---

## 2. Routing and Navigation for Logistics Manager

- Add `/logistics` route in `App.tsx` protected by `RoleRoute` with `allowedRoles={['logistics_manager']}`
- Add "Operations" link in `Header.tsx` for `logistics_manager` role (both desktop and mobile)
- Update `Login.tsx` redirect: `logistics_manager` role goes to `/logistics`

---

## 3. Email Notification Edge Function (`supabase/functions/send-contact-notification/index.ts`)

Create a backend function that sends an email notification when a contact form or quote request is submitted:

- Accepts `{ type: 'contact' | 'quote', name, email, message? }` payload
- Uses the Lovable AI endpoint or a simple webhook to notify the admin
- For now, logs the notification (can be wired to a real email service later)
- Called from `Contacto.tsx` and `Enviar.tsx` after successful database insert

---

## 4. Homepage: Dynamic CMS Sections (`src/pages/Index.tsx`)

The homepage currently uses only hardcoded translation strings. Enhance it to optionally pull from the CMS:

- Query `cms_pages` for `slug='home'` sections (e.g., `section_key='hero'`, `section_key='why_choose'`)
- If CMS data exists, use it; otherwise fall back to translation strings
- This lets admins customize homepage copy without code changes

---

## 5. Footer: Update Copyright Year and Social Links

- Change `2024` to dynamic year (`new Date().getFullYear()`)
- Make social media links configurable via CMS (query `cms_pages` with `slug='footer'`, `section_key='social'`)

---

## Database Changes

| Change | Type |
|---|---|
| None -- all tables and RLS policies already exist for logistics_manager | No migration needed |

---

## Files to Create

| File | Purpose |
|---|---|
| `src/pages/LogisticsPortal.tsx` | Logistics manager operations portal |
| `supabase/functions/send-contact-notification/index.ts` | Email notification for form submissions |

## Files to Modify

| File | Changes |
|---|---|
| `src/App.tsx` | Add `/logistics` route with RoleRoute guard |
| `src/components/Header.tsx` | Add "Operations" nav link for logistics_manager role |
| `src/pages/Login.tsx` | Add logistics_manager redirect to `/logistics` |
| `src/pages/Index.tsx` | Pull optional CMS content for homepage sections |
| `src/components/Footer.tsx` | Dynamic copyright year |

## Implementation Order

1. Create `LogisticsPortal.tsx` with shipments, trucks, and drivers tabs
2. Add `/logistics` route in `App.tsx` and update `Header.tsx` + `Login.tsx`
3. Create `send-contact-notification` edge function
4. Wire notification calls from `Contacto.tsx` and `Enviar.tsx`
5. Enhance `Index.tsx` with optional CMS content
6. Update `Footer.tsx` copyright year

