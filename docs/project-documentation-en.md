# Conexión Baja — Project Documentation (English)

---

## 1. Phase Summary

### Phase A — Core Foundation
- Authentication system with email/password and Google OAuth
- User registration and login pages
- Role-based routing (admin, user, driver, logistics_manager, executive)
- Bilingual support (Spanish/English) via LanguageContext
- Header with responsive navigation and language switcher
- Footer with newsletter subscription and social links
- Dark theme design system
- WhatsApp floating button for customer support

### Phase B — Database Schema
- Full database schema with RLS policies for all tables:
  - `shipments` — tracking, status, driver/truck assignment
  - `shipment_pallets` — per-pallet load details with route-aware positioning
  - `shipment_status_log` — complete audit trail of status changes
  - `drivers` — driver records with availability status
  - `trucks` — fleet management with maintenance tracking
  - `invoices` — billing with multiple payment statuses
  - `quote_requests` — quote workflow with pricing and validity
  - `blog_posts` — bilingual blog/news content
  - `services` — service listings with images
  - `cms_pages` — flexible CMS content by slug/section
  - `newsletter_subscribers` — email list management
  - `newsletter_emails` — newsletter drafts and sent history
  - `contact_messages` — contact form submissions
  - `user_roles` — role-based access control
  - `profiles` — user profile data

### Phase C — Admin CMS
- 12-tab admin panel with full CRUD:
  - Pages, Blog/News, Services, Quote Requests, Contact Messages
  - Shipments (with pallet management), Drivers, Trucks
  - Invoices, Reports/Analytics, Newsletter, Subscribers

### Phase D — Public Pages
- Services page (CMS-driven, bilingual)
- Blog listing + individual post pages with HTML rendering
- About Us page (CMS-driven)
- Quote request form with city selects (7 Baja California cities)
- Send Package form with package types and dimensions

### Phase E — Role Portals
- **Client Portal**: quotes, shipments with pallets/status history, invoices, profile management, password change, newsletter toggle
- **Driver Portal**: availability status, assigned shipments, status/location/notes updates, pallet view, status history
- **Executive Dashboard**: KPI cards (active shipments, revenue, fleet utilization, pending quotes), revenue bar chart, shipment status pie chart, recent activity feed, driver availability summary

### Phase F — Contact & Integration
- Contact form wired to database with admin notification
- Contact Messages admin tab with read/replied workflow
- Quote form enhanced with city selects
- Portal link in header for regular users
- `send-contact-notification` edge function

### Phase G — Logistics & Operations
- **Logistics Manager Portal**: all shipments with status updates, trucks overview, drivers overview
- Role-based navigation in header (admin, driver, logistics, executive links)
- Footer dynamic year
- Edge function for contact notifications

### Phase H — SEO, Images, Realtime
- `PageMeta` component for dynamic SEO title/description on all public pages
- `ImageUpload` component for admin (drag-and-drop to cloud storage)
- `public-images` storage bucket with RLS policies
- Realtime tracking updates on `/rastreo` (live status changes)
- Realtime shipment updates on client Portal
- Optional CMS-driven homepage content with translation fallback

---

## 2. Non-Development Checklist

> Items to complete by a non-technical team member before going live.

### User Accounts to Create
- [ ] **Admin user**: Register an account, then assign `admin` role via backend
- [ ] **Driver user**: Register an account, create a matching driver record with the user's ID, assign `driver` role
- [ ] **Logistics Manager**: Register an account, assign `logistics_manager` role
- [ ] **Executive user**: Register an account, assign `executive` role
- [ ] **Test customer account**: Register a regular user to test the client portal

### Business Information to Provide
- [ ] **WhatsApp number**: Replace the placeholder (`5216641234567`) in `src/components/WhatsAppButton.tsx` with your real WhatsApp Business number
- [ ] **Contact page info**: Update the real address, phone number, and email on the Contact page
- [ ] **Footer social links**: Update Instagram and WhatsApp URLs in `src/components/Footer.tsx`
- [ ] **Google OAuth redirect**: Configure the correct redirect URI for your production domain in the auth provider settings

### Content to Create (via Admin CMS)
- [ ] **About Us**: Create page content with slug=`about`, section_key=`main` — create one for Spanish and one for English
- [ ] **Services**: Create at least 2–3 services with descriptions and images (ES + EN versions)
- [ ] **Blog posts**: Create at least 1–2 blog posts (ES + EN)
- [ ] **Homepage (optional)**: Create CMS overrides with slug=`home` and section_keys: `hero`, `how_it_works`, `why_choose`, `cta`

### Pricing and Business Rules
- [ ] Define shipping rates per route and weight
- [ ] Set service pricing info for each service listing
- [ ] Define accepted payment methods and terms

### Third-Party Accounts
- [ ] **Email service**: Set up SendGrid, Resend, or similar for real email delivery (currently logs to console only)
- [ ] **Google OAuth**: Configure credentials in the auth provider settings
- [ ] **Custom domain** (optional): Set up via project Settings → Domains

### Fleet Setup
- [ ] Add all trucks via Admin → Trucks tab (plate number, model, capacity, VIN)
- [ ] Add all drivers via Admin → Drivers tab (name, phone, license number)
- [ ] Assign drivers to trucks
- [ ] Set initial availability statuses for drivers

---

## 3. Unfinished Development Items

### Placeholders & Mock Data
| Item | Current State | What's Needed |
|------|--------------|---------------|
| Contact notification emails | Edge function logs to console | Integrate SendGrid/Resend API |
| Newsletter sending | Marks as "sent" but doesn't send | Integrate email service API |
| Payment processing | No integration | Add Stripe or Mercado Pago |
| Pricing engine | Manual quotes only | Automated price calculation by route/weight |
| PDF invoices | `pdf_url` field exists, no generation | PDF generation library or service |
| Reports revenue data | Depends on manually-set amounts | Accounting integration |
| WhatsApp number | Placeholder `5216641234567` | Real business number |
| Contact page info | Placeholder address/phone/email | Real business details |
| Footer social links | Generic URLs | Real social media links |
| Password reset flow | Not implemented | Email-based password recovery |
| Email verification reminder | Not implemented | Resend verification email option |

### Storage
- `public-images` bucket is created but needs real-world testing
- No server-side file size validation (client-side only at 5MB)

---

## 4. QA Test Plan (Step-by-Step)

### 4.1 Public Pages (No Login Required)
1. Visit homepage (`/`) — verify hero, how it works, why choose us, CTA sections render correctly
2. Switch language EN↔ES — verify ALL visible text changes
3. Visit `/servicios` — verify services load from database (or show empty state)
4. Visit `/blog` — verify blog posts load (or show empty state)
5. Visit `/contacto` — fill in form and submit — verify success toast; check admin Contact Messages tab for new entry
6. Visit `/cotizar` — fill in quote form and submit — verify success message
7. Visit `/rastreo` — enter invalid tracking number — verify "not found" message
8. Visit `/nosotros` — verify CMS content loads
9. Click WhatsApp button — verify it opens correct WhatsApp URL
10. In footer, subscribe to newsletter — enter email, verify success toast
11. Check browser tab title on each page (SEO PageMeta)
12. Test on mobile viewport — verify hamburger menu, responsive layout

### 4.2 Authentication
13. Register new account with email/password
14. Check email for confirmation link (if auto-confirm is off)
15. Login with email/password
16. Login with Google OAuth
17. Verify redirect: regular user → `/portal`, admin → `/admin`, driver → `/driver`, etc.
18. Logout — verify redirect to homepage

### 4.3 Client Portal (`/portal`)
19. Login as regular user
20. **Quotes tab**: Submit a quote via `/cotizar` first, then verify it appears here
21. **Shipments tab**: Verify shipments appear (admin must create one for this user first)
22. Expand a shipment — verify pallets and status history load
23. **Invoices tab**: Verify invoices appear
24. **Profile tab**: Update name/phone, save, refresh, verify data persists
25. Change password — verify it works
26. Toggle newsletter subscription

### 4.4 Admin Panel (`/admin`)
27. Login as admin user
28. **Pages tab**: Create/edit a CMS page with image upload
29. **Blog tab**: Create a new blog post with image upload, set as published
30. **Services tab**: Create a service with image upload
31. **Quote Requests tab**: View submitted quotes, update status/price, convert to shipment/invoice
32. **Contact Messages tab**: View messages, mark as read/replied
33. **Shipments tab**: Create a shipment, assign driver/truck, add pallets
34. Update shipment status — verify status log entry is created
35. **Drivers tab**: Add/edit a driver
36. **Trucks tab**: Add/edit a truck, assign a driver
37. **Invoices tab**: Create an invoice for a shipment
38. **Reports tab**: Verify KPI cards and charts render with data
39. **Newsletter tab**: Compose and "send" a newsletter
40. **Subscribers tab**: View subscriber list, export CSV

### 4.5 Driver Portal (`/driver`)
41. Login as driver user
42. Verify driver header shows name and availability buttons
43. Change availability status (Available / Unavailable / On Route)
44. View assigned shipments (admin must assign first)
45. Update shipment status, location, and notes
46. Verify status log entry appears in history

### 4.6 Logistics Portal (`/logistics`)
47. Login as logistics_manager user
48. **Shipments tab**: Verify all shipments are visible; update a shipment status with notes
49. **Trucks tab**: Verify truck list (read-only)
50. **Drivers tab**: Verify driver list (read-only)

### 4.7 Executive Dashboard (`/executive`)
51. Login as executive user
52. Verify KPI cards display correctly
53. Verify revenue chart and shipment status pie chart render

### 4.8 Realtime
54. Open `/rastreo` with a valid tracking number
55. In another browser/tab, update that shipment's status via admin panel
56. Verify the tracking page updates automatically (no refresh)
57. Repeat with the client Portal — verify shipment status updates live

### 4.9 Cross-Browser and Mobile
58. Test on Chrome, Firefox, Safari
59. Test mobile viewport on key pages (Index, Enviar, Rastreo, Portal)
60. Verify language switching works on all tested pages

---

## 5. Marketing Summary

### Conexión Baja: The Smart Way to Ship Across Baja California

Conexión Baja is a **modern, all-in-one logistics platform** designed for the Baja California peninsula. Built for speed, transparency, and total operational control, it empowers businesses and individuals to **send, track, and manage shipments** with confidence.

🚀 **Instant Shipment Booking** — Request pickups and deliveries across 7 major cities from Tijuana to Cabo San Lucas in just a few clicks.

📍 **Real-Time Tracking** — Follow your packages live with automatic status updates, from pickup to delivery. No refreshing needed.

👥 **Multi-Role Dashboards** — Purpose-built portals for customers, drivers, logistics managers, and executives — each with tailored tools and live data.

🌐 **Fully Bilingual** — Available in Spanish and English, serving the diverse Baja California community.

📝 **Built-In CMS** — Manage blog posts, services, and page content without touching a single line of code.

🔔 **Smart Notifications** — Instant alerts for new quotes, contact requests, and shipment updates.

🔒 **Enterprise Security** — Email, password, and Google sign-in with role-based access control and row-level data protection.

📊 **Executive Intelligence** — KPI dashboards with revenue trends, fleet utilization, and real-time operational insights.

📸 **Image Management** — Drag-and-drop image uploads for blog, services, and pages.

📰 **Newsletter Engine** — Built-in subscriber management and email composition.

💬 **WhatsApp Integration** — One-tap customer support via WhatsApp Business.

📱 **Mobile-First Design** — Responsive dark-themed interface optimized for any device.

---

## 6. Future Feature Recommendations

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Payment Integration** | Accept online payments via Stripe or Mercado Pago |
| 2 | **Automated Pricing Engine** | Calculate quotes automatically by route, weight, and package type |
| 3 | **PDF Invoice Generation** | Auto-generate downloadable PDF invoices |
| 4 | **Push Notifications** | Browser push notifications for shipment status changes |
| 5 | **Email Service Integration** | Connect SendGrid/Resend for real email notifications and newsletters |
| 6 | **Driver PWA** | Install-to-home-screen Progressive Web App with offline support |
| 7 | **Route Optimization** | Suggest optimal delivery routes based on multiple stops |
| 8 | **Customer Ratings** | Let customers rate their delivery experience |
| 9 | **Barcode/QR Scanning** | Scan tracking codes for quick lookups |
| 10 | **Multi-Tenant Support** | Allow business clients to manage sub-accounts |
| 11 | **Shipping Insurance** | Optional insurance add-on for high-value packages |
| 12 | **Analytics Export** | CSV/PDF export of reports and shipment data |
| 13 | **Forgot Password Flow** | Password recovery via email link |
| 14 | **WhatsApp Bot** | Automated tracking updates via WhatsApp Business API |

---

*Document generated: February 2026*
*Platform: Conexión Baja Envíos PWA*
