

# Phase H: Homepage CMS, SEO, Image Uploads, and Realtime Tracking

Polish the application with CMS-driven homepage content, proper SEO meta tags, image upload support for the admin CMS, and realtime shipment tracking updates.

---

## 1. Homepage CMS Integration (`src/pages/Index.tsx`)

Deferred from Phase G. The homepage currently uses only hardcoded translation strings. Enhance it to optionally pull from the `cms_pages` table:

- Query `cms_pages` for `slug='home'` with section keys: `hero`, `how_it_works`, `why_choose`, `cta`
- If CMS data exists for the current language, use its `title`, `short_desc`, and `content` fields
- Otherwise fall back to existing translation strings (zero visual change if no CMS rows exist)
- This lets admins customize homepage copy from the Pages tab without code changes

---

## 2. SEO Meta Tags (`src/components/PageMeta.tsx`)

Create a reusable component that sets `<title>` and `<meta name="description">` per page using `react-helmet-async` (or a simple `useEffect` on `document.title`):

- New `PageMeta` component accepting `title` and `description` props
- Add it to every public page: Index, Servicios, Enviar, Rastreo, Blog, BlogPost, Cotizar, Contacto, Nosotros
- BlogPost page pulls title/description from the post data dynamically
- Default title format: `{Page Title} | Conexion Baja`

No new dependency needed -- use a simple `useEffect` to set `document.title` and create/update a meta description tag directly.

---

## 3. Image Upload for Admin CMS

Currently, admins must paste image URLs manually for blog posts, services, and CMS pages. Add file upload support using Lovable Cloud storage:

### 3a. Storage Bucket
- Create a `public-images` storage bucket (public, with size limit)
- RLS: admins can upload/delete; anyone can read

### 3b. Image Upload Component (`src/components/admin/ImageUpload.tsx`)
- Drag-and-drop or click-to-upload component
- Uploads to `public-images` bucket, returns the public URL
- Shows preview of current/uploaded image
- Reusable across BlogEditor, ServicesManager, and PagesEditor

### 3c. Wire into Admin Pages
- Replace the plain `image_url` text input with the ImageUpload component in:
  - `BlogEditor.tsx`
  - `ServicesManager.tsx`
  - `PagesEditor.tsx`

---

## 4. Realtime Tracking Updates (`src/pages/Rastreo.tsx`)

Currently, the tracking page shows a static snapshot. Add realtime updates so customers see status changes live:

- After a shipment is found, subscribe to `postgres_changes` on `shipments` table filtered by the shipment ID
- Also subscribe to `shipment_status_log` inserts for that shipment
- Auto-update the timeline and status badge when new data arrives
- Show a subtle "Updated just now" indicator
- Unsubscribe on component unmount or new search
- Enable realtime on `shipments` and `shipment_status_log` tables via migration

---

## 5. Portal Realtime Updates (`src/pages/Portal.tsx`)

Same pattern as tracking -- subscribe to changes on the user's shipments so the portal reflects live status without refreshing.

---

## Database Changes

| Change | Type |
|---|---|
| Enable realtime on `shipments` table | Migration |
| Enable realtime on `shipment_status_log` table | Migration |
| Create `public-images` storage bucket | Migration |
| Storage RLS: public read, admin upload/delete | Migration |

---

## Files to Create

| File | Purpose |
|---|---|
| `src/components/PageMeta.tsx` | Reusable SEO meta tag component |
| `src/components/admin/ImageUpload.tsx` | Drag-and-drop image upload for admin |

## Files to Modify

| File | Changes |
|---|---|
| `src/pages/Index.tsx` | Query CMS for homepage sections, fall back to translations |
| `src/pages/Rastreo.tsx` | Add realtime subscription for live tracking |
| `src/pages/Portal.tsx` | Add realtime subscription for shipment updates |
| `src/pages/admin/BlogEditor.tsx` | Replace image_url input with ImageUpload |
| `src/pages/admin/ServicesManager.tsx` | Replace image_url input with ImageUpload |
| `src/pages/admin/PagesEditor.tsx` | Replace image_url input with ImageUpload |
| All public pages | Add PageMeta component for SEO |

## Implementation Order

1. Create `PageMeta` component and add to all public pages
2. Create storage bucket and ImageUpload component
3. Wire ImageUpload into BlogEditor, ServicesManager, PagesEditor
4. Enable realtime on shipments/status_log tables
5. Add realtime subscriptions to Rastreo and Portal
6. Integrate CMS content into Index.tsx homepage

