import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Servicios = () => {
  const { language } = useLanguage();

  const { data: services } = useQuery({
    queryKey: ['public_services', language],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .eq('language', language)
        .order('sort_order');
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-bold text-foreground mb-8">{language === 'es' ? 'Nuestros Servicios' : 'Our Services'}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((s: any) => (
            <Card key={s.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              {s.image_url && <img src={s.image_url} alt={s.name} className="w-full h-48 object-cover rounded-t-lg" />}
              <CardHeader>
                <CardTitle className="text-foreground">{s.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{s.description}</p>
                {s.price_info && <p className="text-sm text-primary mb-4">{s.price_info}</p>}
                <Link to="/cotizar">
                  <Button variant="outline" className="w-full">{language === 'es' ? 'Solicitar Cotización' : 'Request Quote'}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          {services?.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              {language === 'es' ? 'Próximamente más servicios' : 'More services coming soon'}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Servicios;
