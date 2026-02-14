import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Blog = () => {
  const { language, t } = useLanguage();

  const { data: posts } = useQuery({
    queryKey: ['blog_posts', language],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('language', language)
        .eq('published', true)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-bold text-foreground mb-8">{t.header.blog || (language === 'es' ? 'Blog / Noticias' : 'Blog / News')}</h1>
        {posts?.length === 0 && <p className="text-muted-foreground">{language === 'es' ? 'No hay publicaciones aún.' : 'No posts yet.'}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <NavLink key={post.id} to={`/blog/${post.slug}`}>
              <Card className="bg-card border-border hover:border-primary transition-all overflow-hidden h-full">
                {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">{post.title}</h2>
                  <p className="text-muted-foreground text-sm mb-2">{post.short_desc}</p>
                  <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </Card>
            </NavLink>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
