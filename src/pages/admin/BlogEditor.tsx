import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const emptyPost = { title: '', slug: '', short_desc: '', content: '', image_url: '', language: 'es', published: false };

const BlogEditor = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { language } = useLanguage();
  const es = language === 'es';
  const [editing, setEditing] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ['blog_posts_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (post: any) => {
      if (isNew) {
        const { error } = await supabase.from('blog_posts').insert({ ...post, author_id: user?.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').update(post).eq('id', post.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts_admin'] });
      toast.success(isNew ? (es ? '¡Post creado!' : 'Post created!') : (es ? '¡Post actualizado!' : 'Post updated!'));
      setEditing(null);
      setIsNew(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts_admin'] });
      toast.success(es ? '¡Post eliminado!' : 'Post deleted!');
      setEditing(null);
    },
  });

  if (editing) {
    return (
      <div className="max-w-2xl">
        <Button variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }} className="mb-4">← {es ? 'Volver' : 'Back'}</Button>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">{isNew ? (es ? 'Nuevo Post' : 'New Post') : (es ? 'Editar Post' : 'Edit Post')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'title', label: es ? 'Título' : 'Title' },
              { key: 'slug', label: 'Slug' },
              { key: 'short_desc', label: es ? 'Descripción Corta' : 'Short Description' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label className="text-foreground">{label}</Label>
                <Input value={editing[key] || ''} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} className="bg-background" />
              </div>
            ))}
            <ImageUpload value={editing.image_url || ''} onChange={(url) => setEditing({ ...editing, image_url: url })} label={es ? 'Imagen' : 'Image'} />
            <div className="space-y-2">
              <Label className="text-foreground">{es ? 'Idioma' : 'Language'}</Label>
              <select value={editing.language} onChange={(e) => setEditing({ ...editing, language: e.target.value })} className="w-full rounded-md border border-border bg-background text-foreground p-2">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{es ? 'Contenido (HTML)' : 'Content (HTML)'}</Label>
              <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={12} className="bg-background font-mono text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
              <Label className="text-foreground">{es ? 'Publicado' : 'Published'}</Label>
            </div>
            <div className="flex gap-2">
              <Button variant="hero" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}>{es ? 'Guardar' : 'Save'}</Button>
              {!isNew && <Button variant="destructive" onClick={() => deleteMutation.mutate(editing.id)}>{es ? 'Eliminar' : 'Delete'}</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{es ? 'Blog / Noticias' : 'Blog / News'}</h1>
        <Button variant="hero" onClick={() => { setEditing({ ...emptyPost }); setIsNew(true); }}><Plus className="h-4 w-4 mr-1" />{es ? 'Nuevo Post' : 'New Post'}</Button>
      </div>
      <div className="space-y-2">
        {posts?.map((post) => (
          <div key={post.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <div>
              <span className="text-foreground font-medium">{post.title}</span>
              <span className="text-muted-foreground text-sm ml-2">({post.language})</span>
              {post.published && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{es ? 'Publicado' : 'Published'}</span>}
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditing({ ...post }); setIsNew(false); }}>{es ? 'Editar' : 'Edit'}</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogEditor;
