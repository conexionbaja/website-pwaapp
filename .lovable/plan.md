

# Phase E: Shipping Form Integration and User Profile Management

Wire up the remaining unconnected pages and add user self-service features to complete the customer-facing experience.

---

## 1. Enviar Page: Wire to Database (`src/pages/Enviar.tsx`)

The "Send a Package" form currently has a `TODO` and does nothing. Connect it to create real records:

### 1a. For Logged-In Users
When a logged-in user submits the form:
- Insert a row into `quote_requests` with the form data (origin, destination, package_type, weight, description) and `user_id = auth.uid()`
- Show a success message and redirect to `/portal`

### 1b. For Guest Users
When a guest submits:
- Insert the same row into `quote_requests` with `user_id = null`
- Show a success card with "Register or Login to track your request" (same pattern as Cotizar page)

### 1c. Form Enhancements
- Replace the free-text origin/destination with city selects from the Baja route (Tijuana, Ensenada, San Quintin, Guerrero Negro, Mulege, La Paz, Cabo San Lucas)
- Add a name and email field for guest users (auto-fill from auth if logged in)
- Add a free-text "additional details" textarea

---

## 2. User Profile Page: `/portal` Profile Tab (`src/pages/Portal.tsx`)

Add a "Profile" tab to the existing Portal page where users can view and update their information:

### 2a. Profile Display and Edit
- Query `profiles` table for the current user
- Show editable fields: full_name, phone, avatar_url
- Save button updates the `profiles` table
- If no profile row exists, auto-create one on first visit using `upsert`

### 2b. Password Change
- Add a "Change Password" section using `supabase.auth.updateUser({ password })`
- Requires new password + confirmation

---

## 3. Notification Preferences (Simple)

Add a checkbox in the Profile tab:
- "Subscribe to newsletter" -- toggles a row in `newsletter_subscribers` using the user's email
- Check on load if the user's email is already subscribed

---

## 4. Enviar Page Route City Selects

Use the same route cities constant defined in ShipmentsManager for consistency:

```text
Tijuana, Ensenada, San Quintin, Guerrero Negro, Mulege, La Paz, Cabo San Lucas
```

---

## No Database Changes

All tables (`quote_requests`, `profiles`, `newsletter_subscribers`) already exist with the needed columns. No migrations required.

---

## Files to Modify

| File | Changes |
|---|---|
| `src/pages/Enviar.tsx` | Wire form to `quote_requests` table, add city selects, guest/auth flow |
| `src/pages/Portal.tsx` | Add "Profile" tab with edit form, password change, newsletter toggle |

## Implementation Order

1. Rewrite `Enviar.tsx` -- connect to database with auth-aware logic
2. Add Profile tab to `Portal.tsx` -- profile editing, password change, newsletter toggle

