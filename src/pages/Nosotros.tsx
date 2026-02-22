import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import PageMeta from '@/components/PageMeta';

const Nosotros = () => {
  const { language, t } = useLanguage();

  const { data: page } = useQuery({
    queryKey: ['cms', 'about', 'main', language],
    queryFn: async () => {
      const { data } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', 'about')
        .eq('section_key', 'main')
        .eq('language', language)
        .maybeSingle();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={page?.title || t.footer.about.title} description={page?.short_desc || ''} />
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-bold text-foreground mb-4">{page?.title || t.footer.about.title}</h1>
        <p className="text-lg text-muted-foreground mb-8">{page?.short_desc}</p>
        {page?.image_url && <img src={page.image_url} alt={page.title} className="w-full max-w-2xl rounded-lg mb-8" />}
        {page?.content && (
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Nosotros;
