
# Complete Bilingual Translation for All Admin Sub-Pages

Add `useLanguage` hook and language-aware ternaries to every remaining admin sub-page that currently has hardcoded English-only strings.

---

## Files to Modify (11 files)

### 1. `src/pages/admin/BlogEditor.tsx`
- Add `import { useLanguage } from '@/contexts/LanguageContext'`
- Add `const { language } = useLanguage()` and inline `es` flag
- Translate: "Blog / News", "New Post", "Edit Post", "Title", "Slug", "Short Description", "Language", "Content (HTML)", "Published", "Save", "Delete", "Back", "Edit", toast messages ("Post created!", "Post updated!", "Post deleted!")

### 2. `src/pages/admin/ServicesManager.tsx`
- Add `useLanguage` hook
- Translate: "Services", "Add Service", "Edit Service", "New Service", "Name", "Description", "Price Info", "Sort Order", "Language", "Active", "Actions", "Update", "Create", toast messages ("Service updated", "Service created", "Deleted")

### 3. `src/pages/admin/DriversManager.tsx`
- Add `useLanguage` hook
- Translate: "Drivers", "Add Driver", "Edit Driver", "New Driver", "Full Name", "Phone", "License Number", "Availability Status", "User ID (optional)", "Active", "Actions", "Update", "Create", availability status labels, toast messages

### 4. `src/pages/admin/TrucksManager.tsx`
- Add `useLanguage` hook
- Translate: "Trucks", "Add Truck", "Edit Truck", "New Truck", "Plate Number", "VIN", "Vehicle Type", "Model", "Capacity (kg)", "Capacity (pallets)", "Status", "Assigned Driver", "None", "Last Maintenance Date", "Pick a date", "Active", "Actions", "Update", "Create", vehicle type labels, truck status labels, toast messages

### 5. `src/pages/admin/ShipmentsManager.tsx`
- Add `useLanguage` hook
- Translate: "Shipments", "New Shipment", "Create Shipment", "Origin", "Destination", "Driver", "Truck", "Estimated Delivery", "Current Location", "Notes", "Tracking #", "ETA", "Status", "Actions", "Pick a date", "Optional", "Select driver", "Select truck", "Pallets / Bytarimas", "Auto-Sort", "History", "Add Pallet", "Description", "Load Type", "Origin City", "Destination City", "Client Name", "Weight (kg)", "Dimensions", "Cost", "Payment Status", "Delivery Address", "Delivery Contact", "Special Handling", "Add", "Status History", "No pallets yet", "No history yet", "Location:", "Delay:", all toast messages, status labels

### 6. `src/pages/admin/InvoicesManager.tsx`
- Add `useLanguage` hook
- Translate: "Invoices", "New Invoice", "Create Invoice", "Shipment", "User ID", "Amount", "Currency", "Invoice #", "Status", "Date", "Actions", "Select shipment", "UUID of user", "Create", toast messages, invoice status labels

### 7. `src/pages/admin/NewsletterComposer.tsx`
- Add `useLanguage` hook
- Translate: "Newsletter", "New Email", "Edit Email", "Back", "Subject", "Content (HTML)", "Save Draft", "Edit", "Send", toast messages ("Saved!", "Newsletter sent!")

### 8. `src/pages/admin/Subscribers.tsx`
- Add `useLanguage` hook
- Translate: "Subscribers", "Export CSV", "Email", "Subscribed", "Active", "Yes", "No"

### 9. `src/pages/admin/PagesEditor.tsx`
- Add `useLanguage` hook
- Translate: "CMS Pages", "Back", "Title", "Short Description", "Content (HTML)", "Save Changes", "Edit", toast message ("Page updated!")

### 10. `src/pages/admin/QuoteRequests.tsx`
- Add `useLanguage` hook
- Translate: "Quote Requests", "Set Quote Price & Notes", "Price", "Valid Until", "Pick a date", "Notes", "Quote details...", "Save & Mark as Quoted", table headers (Name, Email, Origin/Dest, Price, Valid Until, Status, Date, Actions), "Quote", "Shipment", "Invoice", "Close", toast messages

### 11. `src/pages/admin/ContactMessages.tsx`
- Add `useLanguage` hook
- Translate: "Contact Messages", "Loading...", "No messages yet.", table headers (Date, Name, Email, Message, Status, Actions), "Message from", "Mark Replied", status labels (unread, read, replied), toast messages

---

## Translation Pattern

Each file will follow the same pattern already used in Portal.tsx, Rastreo.tsx, etc.:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const Component = () => {
  const { language } = useLanguage();
  const es = language === 'es';
  
  // Then use: es ? 'Spanish text' : 'English text'
};
```

---

## No Database Changes Required

All changes are frontend-only string replacements.

## Implementation Order

1. BlogEditor, ServicesManager, DriversManager (smaller files)
2. TrucksManager, InvoicesManager, NewsletterComposer
3. ShipmentsManager (largest file, ~375 lines, most strings)
4. Subscribers, PagesEditor, QuoteRequests, ContactMessages
