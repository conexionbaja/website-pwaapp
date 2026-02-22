

# Phase F: Contact Form Integration, Quote Form Polish, and Notifications

Complete the remaining disconnected pages and add email notification capabilities for form submissions.

---

## 1. Contact Messages Table (New Migration)

Create a `contact_messages` table to store contact form submissions:

- `id` (uuid, PK, default gen_random_uuid())
- `name` (text, NOT NULL)
- `email` (text, NOT NULL)
- `message` (text, NOT NULL)
- `created_at` (timestamptz, default now())
- `status` (text, default 'unread') -- for admin to track read/replied

RLS policies:
- Anyone can INSERT (public form)
- Admins can SELECT and UPDATE (to mark as read/replied)

---

## 2. Contacto Page: Wire to Database (`src/pages/Contacto.tsx`)

Replace the fake toast-only submit handler:
- Insert a row into `contact_messages` with name, email, message
- Show a success message after submission
- Reset the form

---

## 3. Contact Messages Admin Tab (`src/pages/admin/ContactMessages.tsx`)

New admin tab to view and manage contact submissions:
- Table listing all contact messages (name, email, message preview, status, date)
- Click to expand and read full message
- Mark as "read" or "replied" buttons
- Add this tab to `Admin.tsx` sidebar

---

## 4. Cotizar Page: Add City Selects (`src/pages/Cotizar.tsx`)

Align the quote request form with the Enviar page:
- Replace free-text origin/destination inputs with the same `ROUTE_CITIES` select dropdowns
- Keep all other fields as-is (name, email, phone, package_type, weight, description already work)

---

## 5. Header: Add Portal Link for Logged-In Users (`src/components/Header.tsx`)

Currently logged-in regular users only see a "Logout" button. Add:
- A "My Portal" link visible when the user is logged in and is NOT admin/driver/executive
- This links to `/portal`

---

## Database Changes

| Change | Type |
|---|---|
| Create `contact_messages` table | New migration |
| RLS: Anyone INSERT, Admins SELECT/UPDATE | Policies in same migration |

---

## Files to Create

| File | Purpose |
|---|---|
| `src/pages/admin/ContactMessages.tsx` | Admin view for contact form submissions |

## Files to Modify

| File | Changes |
|---|---|
| `src/pages/Contacto.tsx` | Wire form to `contact_messages` table |
| `src/pages/Cotizar.tsx` | Replace free-text origin/dest with ROUTE_CITIES selects |
| `src/pages/Admin.tsx` | Add "Contact Messages" tab to sidebar |
| `src/components/Header.tsx` | Add "My Portal" link for logged-in regular users |

## Implementation Order

1. Create `contact_messages` table migration
2. Wire `Contacto.tsx` to the new table
3. Create `ContactMessages.tsx` admin tab and register in `Admin.tsx`
4. Update `Cotizar.tsx` with city selects
5. Update `Header.tsx` with portal link

