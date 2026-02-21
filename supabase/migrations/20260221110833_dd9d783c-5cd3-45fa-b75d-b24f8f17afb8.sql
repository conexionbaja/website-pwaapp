
-- 2. Add columns to trucks
ALTER TABLE public.trucks
  ADD COLUMN IF NOT EXISTS vin text,
  ADD COLUMN IF NOT EXISTS vehicle_type text NOT NULL DEFAULT 'truck',
  ADD COLUMN IF NOT EXISTS capacity_pallets integer,
  ADD COLUMN IF NOT EXISTS current_status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS last_maintenance_date date,
  ADD COLUMN IF NOT EXISTS assigned_driver_id uuid REFERENCES public.drivers(id);

-- 3. Add columns to drivers
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS availability_status text NOT NULL DEFAULT 'unavailable';

-- 4. Add columns to shipments
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS estimated_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS actual_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS current_location text,
  ADD COLUMN IF NOT EXISTS delay_reason text,
  ADD COLUMN IF NOT EXISTS driver_notes text;

-- 5. Add columns to shipment_pallets
ALTER TABLE public.shipment_pallets
  ADD COLUMN IF NOT EXISTS load_type text NOT NULL DEFAULT 'pallet',
  ADD COLUMN IF NOT EXISTS origin_city text,
  ADD COLUMN IF NOT EXISTS destination_city text,
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS delivery_contact text,
  ADD COLUMN IF NOT EXISTS cost numeric,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS special_handling text;

-- 6. Add column to quote_requests
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS valid_until timestamptz;

-- 7. Create shipment_status_log table
CREATE TABLE IF NOT EXISTS public.shipment_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text,
  notes text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_status_log ENABLE ROW LEVEL SECURITY;

-- 8. Helper function
CREATE OR REPLACE FUNCTION public.get_driver_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.drivers WHERE user_id = _user_id LIMIT 1
$$;

-- 9. RLS for shipment_status_log
CREATE POLICY "Admins full access status log"
ON public.shipment_status_log FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own shipment logs"
ON public.shipment_status_log FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_status_log.shipment_id AND s.user_id = auth.uid()));

CREATE POLICY "Drivers can view assigned shipment logs"
ON public.shipment_status_log FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_status_log.shipment_id AND s.driver_id = public.get_driver_id_for_user(auth.uid())));

CREATE POLICY "Drivers can insert assigned shipment logs"
ON public.shipment_status_log FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_status_log.shipment_id AND s.driver_id = public.get_driver_id_for_user(auth.uid())));

-- 10. Driver RLS on shipments
CREATE POLICY "Drivers can view assigned shipments"
ON public.shipments FOR SELECT TO authenticated
USING (driver_id = public.get_driver_id_for_user(auth.uid()));

CREATE POLICY "Drivers can update assigned shipments"
ON public.shipments FOR UPDATE TO authenticated
USING (driver_id = public.get_driver_id_for_user(auth.uid()));

-- 11. Driver RLS on shipment_pallets
CREATE POLICY "Drivers can view assigned pallets"
ON public.shipment_pallets FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_pallets.shipment_id AND s.driver_id = public.get_driver_id_for_user(auth.uid())));

-- 12. Driver RLS on drivers
CREATE POLICY "Drivers can view own record"
ON public.drivers FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 13. Executive RLS
CREATE POLICY "Executives can view shipments"
ON public.shipments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Executives can view invoices"
ON public.invoices FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Executives can view trucks"
ON public.trucks FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Executives can view drivers"
ON public.drivers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Executives can view pallets"
ON public.shipment_pallets FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Executives can view status logs"
ON public.shipment_status_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'executive'));

-- 14. Logistics manager RLS
CREATE POLICY "Logistics managers full shipments"
ON public.shipments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'logistics_manager'))
WITH CHECK (public.has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Logistics managers full pallets"
ON public.shipment_pallets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'logistics_manager'))
WITH CHECK (public.has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Logistics managers full status log"
ON public.shipment_status_log FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'logistics_manager'))
WITH CHECK (public.has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Logistics managers can view trucks"
ON public.trucks FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Logistics managers can view drivers"
ON public.drivers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'logistics_manager'));
