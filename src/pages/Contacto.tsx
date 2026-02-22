import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import PageMeta from '@/components/PageMeta';

const Contacto = () => {
  const { language } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const t = {
    title: language === 'es' ? 'Contáctanos' : 'Contact Us',
    name: language === 'es' ? 'Nombre' : 'Name',
    email: language === 'es' ? 'Correo' : 'Email',
    message: language === 'es' ? 'Mensaje' : 'Message',
    submit: language === 'es' ? 'Enviar' : 'Send',
    address: 'Tijuana, Baja California, México',
    phone: '+52 664 000 0000',
    emailAddr: 'info@conexionbaja.com',
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      message: form.message,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    // Fire notification (non-blocking)
    supabase.functions.invoke('send-contact-notification', {
      body: { type: 'contact', name: form.name, email: form.email, message: form.message },
    }).catch(() => {});
    toast.success(language === 'es' ? '¡Mensaje enviado!' : 'Message sent!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={t.title} description={language === 'es' ? 'Contáctanos para cotizaciones y servicios de transporte' : 'Contact us for quotes and transport services'} />
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-bold text-foreground mb-8">{t.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-foreground">{t.title}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">{t.name}</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">{t.email}</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">{t.message}</Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="bg-background" rows={5} />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>{t.submit}</Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div><h3 className="font-semibold text-foreground">{language === 'es' ? 'Dirección' : 'Address'}</h3><p className="text-muted-foreground">{t.address}</p></div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary mt-1" />
              <div><h3 className="font-semibold text-foreground">{language === 'es' ? 'Teléfono' : 'Phone'}</h3><p className="text-muted-foreground">{t.phone}</p></div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div><h3 className="font-semibold text-foreground">Email</h3><p className="text-muted-foreground">{t.emailAddr}</p></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contacto;
