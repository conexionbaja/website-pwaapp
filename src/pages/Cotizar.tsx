import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Cotizar = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', origin: '', destination: '', package_type: '', weight: '', description: '' });

  const t = {
    title: language === 'es' ? 'Solicitar Cotización' : 'Request a Quote',
    name: language === 'es' ? 'Nombre' : 'Name',
    email: language === 'es' ? 'Correo' : 'Email',
    phone: language === 'es' ? 'Teléfono' : 'Phone',
    origin: language === 'es' ? 'Origen' : 'Origin',
    destination: language === 'es' ? 'Destino' : 'Destination',
    packageType: language === 'es' ? 'Tipo de Paquete' : 'Package Type',
    weight: language === 'es' ? 'Peso (kg)' : 'Weight (kg)',
    description: language === 'es' ? 'Descripción' : 'Description',
    submit: language === 'es' ? 'Enviar Solicitud' : 'Submit Request',
    success: language === 'es' ? '¡Solicitud enviada exitosamente!' : 'Request submitted successfully!',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('quote_requests').insert({
      ...form,
      user_id: user?.id || null,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t.success);
    setForm({ name: '', email: '', phone: '', origin: '', destination: '', package_type: '', weight: '', description: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-lg mx-auto">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-2xl text-foreground">{t.title}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { id: 'name', label: t.name, type: 'text', required: true },
                  { id: 'email', label: t.email, type: 'email', required: true },
                  { id: 'phone', label: t.phone, type: 'tel' },
                  { id: 'origin', label: t.origin, type: 'text', required: true },
                  { id: 'destination', label: t.destination, type: 'text', required: true },
                  { id: 'package_type', label: t.packageType, type: 'text' },
                  { id: 'weight', label: t.weight, type: 'text' },
                ].map(({ id, label, type, required }) => (
                  <div key={id} className="space-y-2">
                    <Label htmlFor={id} className="text-foreground">{label}</Label>
                    <Input id={id} type={type} value={(form as any)[id]} onChange={handleChange} required={required} className="bg-background" />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">{t.description}</Label>
                  <Textarea id="description" value={form.description} onChange={handleChange} className="bg-background" />
                </div>
                <Button type="submit" className="w-full" variant="hero" disabled={loading}>
                  {t.submit}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cotizar;
