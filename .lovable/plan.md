

# Conexion Baja Envios PWA -- Full Feature Expansion Plan

This plan covers all requested features broken into phases. Due to the scope, implementation will proceed incrementally.

---

## Phase 1: Authentication (Google OAuth + Email/Password)

- Enable Google OAuth via Lovable Cloud managed credentials (no API key needed)
- Create a `profiles` table to store user info (full_name, phone, avatar_url)
- Create a `user_roles` table with an `app_role` enum (admin, user) and a `has_role()` security definer function
- Implement real authentication in Login and Registro pages using the backend auth system
- Add a "Sign in with Google" button on both pages
- Create an `AuthContext` provider to manage session state across the app
- Protect routes that require login (Enviar, dashboard, admin)
- Seed an initial admin role for your user account

---

## Phase 2: CMS Database Schema

Create the following tables with RLS policies:

- **`cms_pages`** -- Stores editable page content sections  
  Columns: id, slug (unique), section_key, title, short_desc, content (HTML text), image_url, sort_order, language (es/en), updated_by, updated_at  
  Pre-seeded pages/sections: `home_hero`, `home_carousel_1..3`, `home_how_it_works`, `home_why_choose`, `home_cta`, `about_us`, `services`

- **`blog_posts`** -- News/blog entries  
  Columns: id, title, slug, short_desc, content (HTML), image_url, language, published, author_id, created_at, updated_at

- **`quote_requests`** -- Freight quote request form submissions  
  Columns: id, user_id (nullable), name, email, phone, origin, destination, package_type, weight, description, status (pending/quoted/closed), created_at

- **`newsletter_subscribers`** -- Email subscriptions  
  Columns: id, email (unique), subscribed_at, unsubscribed_at, active

- **`newsletter_emails`** -- Sent/draft emails  
  Columns: id, subject, content (HTML), sent_at, created_by, status (draft/sent)

- **Storage bucket** `cms-images` for CMS and blog images

RLS policies: Admin-only write access on CMS/blog/newsletter tables. Public read for published content. Quote requests insertable by anyone, readable by admins.

---

## Phase 3: CMS Admin Panel

- Create `/admin` route (protected, admin-only)
- Admin dashboard with sidebar navigation: Pages, Blog/News, Quote Requests, Newsletter, Subscribers
- **Pages Editor**: List all CMS page sections, click to edit title, short_desc, content (rich HTML textarea), image upload
- **Blog Editor**: CRUD for blog posts with title, slug, short_desc, HTML content, image upload, publish toggle
- **Quote Requests**: Table view of all submissions with status management
- **Newsletter Composer**: Create email content, preview, and send to all active subscribers via an edge function
- **Subscribers**: View list, export capability

---

## Phase 4: Public Pages (CMS-Driven)

- **Home Page**: Refactor to load hero, carousel, sections from `cms_pages` table with fallback to current static content
- **About Us / Company** (`/nosotros`): New page pulling content from CMS
- **Services** (`/servicios`): New page pulling content from CMS
- **Blog / News** (`/blog`): List page showing published blog posts, plus `/blog/:slug` detail page with HTML rendering (sanitized with DOMPurify)
- **Quote Request** (`/cotizar`): Form for requesting a freight quote -- name, email, phone, origin, destination, package details, description
- **Contact Us** (`/contacto`): Contact form + company info + map placeholder

---

## Phase 5: Newsletter Backend

- Edge function `send-newsletter` that:
  - Receives subject + HTML content from admin
  - Fetches all active subscribers
  - Sends emails (using Lovable AI or a simple email relay)
- Edge function `notify-new-post` that:
  - Triggered manually from admin when publishing a blog post
  - Sends a summary email to all subscribers about the new post
- Footer newsletter form saves to `newsletter_subscribers` table

---

## Phase 6: WhatsApp Business Chat Widget

- Floating WhatsApp button (bottom-right corner) on all pages
- Clicking opens `https://wa.me/<your_number>?text=<pre-filled message>` in a new tab
- Pre-filled message changes based on language (ES/EN)
- You will be prompted to provide your WhatsApp Business number

---

## Phase 7: Translations Update

Expand both `es.ts` and `en.ts` with keys for all new pages: admin panel, about us, services, blog, contact, quote request, newsletter, WhatsApp widget text.

---

## Navigation Updates

Update Header with new links: Services, Blog/News, Contact, Quote. Add Admin link visible only when user has admin role.

---

## Technical Details

### Database Migrations (SQL)
- Create `app_role` enum, `user_roles` table, `has_role()` function
- Create `profiles` table with trigger for auto-creation on signup
- Create `cms_pages`, `blog_posts`, `quote_requests`, `newsletter_subscribers`, `newsletter_emails` tables
- Create `cms-images` storage bucket
- Seed default CMS page content for home sections, about, services
- Enable realtime on relevant tables if needed

### New Files to Create
- `src/contexts/AuthContext.tsx` -- Auth state management
- `src/pages/Admin.tsx` -- Admin layout with sub-pages
- `src/pages/admin/PagesEditor.tsx`
- `src/pages/admin/BlogEditor.tsx`
- `src/pages/admin/QuoteRequests.tsx`
- `src/pages/admin/NewsletterComposer.tsx`
- `src/pages/admin/Subscribers.tsx`
- `src/pages/Nosotros.tsx` (About Us)
- `src/pages/Servicios.tsx` (Services)
- `src/pages/Blog.tsx` + `src/pages/BlogPost.tsx`
- `src/pages/Cotizar.tsx` (Quote Request)
- `src/pages/Contacto.tsx` (Contact Us)
- `src/components/WhatsAppButton.tsx`
- `src/components/AdminRoute.tsx` (role-based route guard)
- `supabase/functions/send-newsletter/index.ts`

### Files to Modify
- `src/App.tsx` -- Add all new routes
- `src/components/Header.tsx` -- Add nav links, admin link
- `src/components/Footer.tsx` -- Connect newsletter form to backend
- `src/pages/Index.tsx` -- Load content from CMS
- `src/pages/Login.tsx` -- Real auth + Google OAuth
- `src/pages/Registro.tsx` -- Real auth + Google OAuth
- `src/translations/es.ts` and `en.ts` -- All new translation keys
- `supabase/config.toml` -- Edge function JWT config

### Implementation Order
1. Database schema + auth (foundation)
2. Auth context + Login/Register pages
3. CMS tables + admin panel
4. Public pages consuming CMS content
5. Newsletter edge function
6. WhatsApp widget
7. Translations for all new content

