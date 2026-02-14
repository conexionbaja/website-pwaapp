import { Instagram, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from('newsletter_subscribers').insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === '23505') {
        toast.info(t.footer.newsletter.description);
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("¡Gracias por suscribirte!");
    setEmail("");
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Conexión Baja</h3>
            <p className="text-muted-foreground text-sm mb-4">{t.footer.about.description}</p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={24} /></a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><MessageCircle size={24} /></a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">{t.footer.quickLinks.title}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">{t.footer.quickLinks.home}</a></li>
              <li><a href="/enviar" className="text-muted-foreground hover:text-primary transition-colors">{t.footer.quickLinks.send}</a></li>
              <li><a href="/rastreo" className="text-muted-foreground hover:text-primary transition-colors">{t.footer.quickLinks.track}</a></li>
              <li><a href="/servicios" className="text-muted-foreground hover:text-primary transition-colors">{t.header?.services || 'Services'}</a></li>
              <li><a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">{t.header?.blog || 'Blog'}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">{t.footer.newsletter.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t.footer.newsletter.description}</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input type="email" placeholder={t.footer.newsletter.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background" />
              <Button type="submit" variant="default" disabled={loading}>{t.footer.newsletter.button}</Button>
            </form>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Conexión Baja Envíos PWA. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
