

# Logistics Management System + Client Portal

This is a large feature set spanning new database tables, admin CRUD panels, a client portal, and updates to the public services page. Here is the full plan broken into 4 phases.

---

## Phase 1: New Database Tables

Create 4 new tables with RLS policies:

### `services` table
- `id` (uuid, PK)
- `name` (text)
- `description` (text)
- `image_url` (text, nullable)
- `price_info` (text, nullable)
- `active` (boolean, default true)
- `sort_order` (integer, default 0)
- `language` (text, default 'es')
- `created_at`, `updated_at` (timestamptz)
- **RLS**: Anyone can SELECT active services; admins can INSERT/UPDATE/DELETE

### `drivers` table
- `id` (uuid, PK)
- `full_name` (text)
- `phone` (text, nullable)
- `license_number` (text, nullable)
- `active` (boolean, default true)
- `created_at`, `updated_at` (timestamptz)
- **RLS**: Admin-only for all operations

### `trucks` table
- `id` (uuid, PK)
- `plate_number` (text)
- `model` (text, nullable)
- `capacity_kg` (numeric, nullable)
- `active` (boolean, default true)
- `created_at`, `updated_at` (timestamptz)
- **RLS**: Admin-only for all operations

### `shipments` (embarques) table
- `id` (uuid, PK)
- `tracking_number` (text, unique) -- auto-generated
- `quote_request_id` (uuid, FK to quote_requests, nullable)
- `user_id` (uuid, FK to auth.users, nullable)
- `driver_id` (uuid, FK to drivers, nullable)
- `truck_id` (uuid, FK to trucks, nullable)
- `origin`, `destination` (text)
- `status` (text, default 'pending') -- pending, loading, in_transit, delivered, cancelled
- `notes` (text, nullable)
- `created_at`, `updated_at` (timestamptz)
- **RLS**: Admins full access; authenticated users can SELECT their own shipments

### `shipment_pallets` (bytarimas) table
- `id` (uuid, PK)
- `shipment_id` (uuid, FK to shipments)
- `description` (text)
- `weight_kg` (numeric, nullable)
- `dimensions` (text, nullable)
- `position` (integer, default 0) -- for visual ordering
- `created_at` (timestamptz)
- **RLS**: Admins full access; authenticated users can SELECT pallets for their shipments

### `invoices` table
- `id` (uuid, PK)
- `shipment_id` (uuid, FK to shipments, nullable)
- `user_id` (uuid, FK to auth.users)
- `amount` (numeric)
- `currency` (text, default 'MXN')
- `status` (text, default 'pending') -- pending, paid, cancelled
- `invoice_number` (text, unique)
- `pdf_url` (text, nullable)
- `created_at`, `updated_at` (timestamptz)
- **RLS**: Admins full access; authenticated users can SELECT their own invoices

Also add a `quote_price` and `quote_notes` column to the existing `quote_requests` table so admins can attach a price to quotes.

---

## Phase 2: Admin CRUD Panels

Add 4 new tabs to the existing Admin sidebar:

### Services Manager (`src/pages/admin/ServicesManager.tsx`)
- List all services with name, status, sort order
- Create / Edit / Delete services
- Toggle active status

### Drivers Manager (`src/pages/admin/DriversManager.tsx`)
- List drivers with name, phone, license
- Create / Edit / Delete
- Toggle active status

### Trucks Manager (`src/pages/admin/TrucksManager.tsx`)
- List trucks with plate, model, capacity
- Create / Edit / Delete
- Toggle active status

### Shipments Manager (`src/pages/admin/ShipmentsManager.tsx`)
- List all shipments with tracking number, status, driver, truck
- Create shipment (optionally from a quote request)
- Assign driver and truck
- Update status (pending -> loading -> in_transit -> delivered)
- **Pallet (bytarima) sub-panel**: Within each shipment, manage pallets visually -- add/remove pallets, see a simple visual grid showing fill level

### Quote Requests Enhancement
- Update existing `QuoteRequests.tsx` to allow setting a price and notes on a quote
- Add a "Convert to Shipment" button that creates a shipment from a quoted request

### Invoices Manager (`src/pages/admin/InvoicesManager.tsx`)
- List all invoices
- Create invoice linked to a shipment and user
- Update status (pending/paid/cancelled)

Update `Admin.tsx` sidebar to include new tabs: Services, Drivers, Trucks, Shipments, Invoices (icons: Wrench, User, Truck, Package, Receipt).

---

## Phase 3: Public Services Page

Update `src/pages/Servicios.tsx` to:
- Fetch from the new `services` table (active only) instead of CMS
- Display services as a card grid with name, description, image, and a "Request Quote" CTA linking to `/cotizar`

---

## Phase 4: Client Portal

### New route: `/portal`
- Protected route (requires login, any authenticated user)
- Tabbed interface with 3 sections:

#### My Quotes tab
- List the user's quote requests with status and price (if quoted)
- Show quote details in a expandable row or modal

#### My Shipments tab
- List shipments linked to the user
- Show tracking number, status, origin/destination, driver info
- Click to see pallet details and status timeline (reuse tracking UI pattern from Rastreo)

#### My Invoices tab
- List invoices with amount, status, date
- Link to PDF if available

### Update Rastreo page
- When user enters a tracking number, query `shipments` table by `tracking_number`
- Show real shipment data and pallet contents instead of hardcoded mock data

### Update Cotizar flow
- After a quote is submitted, if the user is not logged in, show a message: "Register or log in to view your quote status in your portal"
- If logged in, redirect to `/portal` with a success message

---

## Files to Create
- `src/pages/admin/ServicesManager.tsx`
- `src/pages/admin/DriversManager.tsx`
- `src/pages/admin/TrucksManager.tsx`
- `src/pages/admin/ShipmentsManager.tsx`
- `src/pages/admin/InvoicesManager.tsx`
- `src/pages/Portal.tsx`

## Files to Modify
- `src/pages/Admin.tsx` -- add new sidebar tabs
- `src/pages/Servicios.tsx` -- fetch from services table
- `src/pages/Cotizar.tsx` -- post-submit portal redirect
- `src/pages/Rastreo.tsx` -- real tracking lookup
- `src/App.tsx` -- add `/portal` route
- `src/translations/es.ts` and `en.ts` -- new translation keys
- `src/pages/admin/QuoteRequests.tsx` -- add price/notes and "Convert to Shipment"

## Database Migration
- One migration with all 6 new tables, RLS policies, and the 2 new columns on `quote_requests`

