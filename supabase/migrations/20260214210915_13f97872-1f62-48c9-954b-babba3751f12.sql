
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- has_role function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CMS Pages table
CREATE TABLE public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  short_desc TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, section_key, language)
);
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cms pages" ON public.cms_pages FOR SELECT USING (true);
CREATE POLICY "Admins can insert cms pages" ON public.cms_pages FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cms pages" ON public.cms_pages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cms pages" ON public.cms_pages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blog Posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_desc TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
  published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert posts" ON public.blog_posts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update posts" ON public.blog_posts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete posts" ON public.blog_posts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quote Requests table
CREATE TABLE public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  package_type TEXT,
  weight TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quote requests" ON public.quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read all quote requests" ON public.quote_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
CREATE POLICY "Admins can update quote requests" ON public.quote_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Newsletter Subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read subscribers" ON public.newsletter_subscribers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update subscribers" ON public.newsletter_subscribers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Newsletter Emails table
CREATE TABLE public.newsletter_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletter emails" ON public.newsletter_emails FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- CMS Images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-images', 'cms-images', true);

CREATE POLICY "Anyone can view cms images" ON storage.objects FOR SELECT USING (bucket_id = 'cms-images');
CREATE POLICY "Admins can upload cms images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cms images" ON storage.objects FOR UPDATE USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cms images" ON storage.objects FOR DELETE USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));

-- Seed default CMS pages for both languages
INSERT INTO public.cms_pages (slug, section_key, title, short_desc, content, sort_order, language) VALUES
('home', 'hero', 'Envíos Rápidos y Seguros en Tijuana', 'Tu servicio de paquetería confiable para envíos locales y más allá', '', 0, 'es'),
('home', 'hero', 'Fast and Secure Shipping in Tijuana', 'Your reliable parcel service for local deliveries and beyond', '', 0, 'en'),
('home', 'how_it_works', '¿Cómo Funciona?', '', '', 1, 'es'),
('home', 'how_it_works', 'How It Works?', '', '', 1, 'en'),
('home', 'why_choose', '¿Por Qué Elegirnos?', '', '', 2, 'es'),
('home', 'why_choose', 'Why Choose Us?', '', '', 2, 'en'),
('home', 'cta', '¿Listo para Enviar?', 'Únete a miles de clientes satisfechos', '', 3, 'es'),
('home', 'cta', 'Ready to Send?', 'Join thousands of satisfied customers', '', 3, 'en'),
('about', 'main', 'Acerca de Nosotros', 'Conoce nuestra historia y misión', '<p>Conexión Baja es tu servicio de paquetería confiable en Tijuana.</p>', 0, 'es'),
('about', 'main', 'About Us', 'Learn about our story and mission', '<p>Conexión Baja is your reliable parcel service in Tijuana.</p>', 0, 'en'),
('services', 'main', 'Nuestros Servicios', 'Soluciones de envío para todas tus necesidades', '<p>Ofrecemos envíos locales, nacionales e internacionales.</p>', 0, 'es'),
('services', 'main', 'Our Services', 'Shipping solutions for all your needs', '<p>We offer local, national, and international shipping.</p>', 0, 'en');
