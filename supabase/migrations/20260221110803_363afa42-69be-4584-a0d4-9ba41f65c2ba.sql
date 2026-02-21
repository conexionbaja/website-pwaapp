
-- Step 1: Only extend the enum (must be committed separately)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'logistics_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'executive';
