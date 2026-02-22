import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import PageMeta from '@/components/PageMeta';

const BlogPost = () => {
  const { slug } = useParams();

  const { data: post } = useQuery({
    queryKey: ['blog_post', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={post?.title || 'Blog'} description={post?.short_desc || ''} />
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
        {post ? (
          <>
            <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>
            <p className="text-muted-foreground mb-6">{new Date(post.created_at).toLocaleDateString()}</p>
            {post.image_url && <img src={post.image_url} alt={post.title} className="w-full rounded-lg mb-8" />}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;
