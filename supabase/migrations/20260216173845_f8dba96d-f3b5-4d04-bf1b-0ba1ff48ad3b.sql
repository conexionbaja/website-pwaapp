
-- =============================================
-- Phase 1: New tables for logistics management
-- =============================================

-- 1. SERVICES table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  price_info text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  language text NOT NULL DEFAULT 'es',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert services" ON public.services
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. DRIVERS table
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  license_number text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select drivers" ON public.drivers
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert drivers" ON public.drivers
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update drivers" ON public.drivers
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete drivers" ON public.drivers
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. TRUCKS table
CREATE TABLE public.trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text NOT NULL,
  model text,
  capacity_kg numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select trucks" ON public.trucks
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert trucks" ON public.trucks
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update trucks" ON public.trucks
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete trucks" ON public.trucks
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_trucks_updated_at
  BEFORE UPDATE ON public.trucks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. SHIPMENTS table
CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL DEFAULT ('SHP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  quote_request_id uuid REFERENCES public.quote_requests(id),
  user_id uuid,
  driver_id uuid REFERENCES public.drivers(id),
  truck_id uuid REFERENCES public.trucks(id),
  origin text NOT NULL,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access shipments select" ON public.shipments
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
CREATE POLICY "Admins can insert shipments" ON public.shipments
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update shipments" ON public.shipments
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete shipments" ON public.shipments
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. SHIPMENT_PALLETS table
CREATE TABLE public.shipment_pallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  weight_kg numeric,
  dimensions text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shipment_pallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access pallets select" ON public.shipment_pallets
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Admins can insert pallets" ON public.shipment_pallets
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pallets" ON public.shipment_pallets
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pallets" ON public.shipment_pallets
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 6. INVOICES table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES public.shipments(id),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'MXN',
  status text NOT NULL DEFAULT 'pending',
  invoice_number text UNIQUE NOT NULL DEFAULT ('INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access invoices select" ON public.invoices
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
CREATE POLICY "Admins can insert invoices" ON public.invoices
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update invoices" ON public.invoices
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete invoices" ON public.invoices
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Add columns to quote_requests
ALTER TABLE public.quote_requests
  ADD COLUMN quote_price numeric,
  ADD COLUMN quote_notes text;

-- Allow public tracking lookup by tracking number
CREATE POLICY "Anyone can lookup shipment by tracking number" ON public.shipments
  FOR SELECT USING (true);
