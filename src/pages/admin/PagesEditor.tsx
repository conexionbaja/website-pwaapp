import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const PagesEditor = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data: pages } = useQuery({
    queryKey: ['cms_pages_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('cms_pages').select('*').order('slug').order('sort_order');
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (page: any) => {
      const { error } = await supabase.from('cms_pages').update({
        title: page.title,
        short_desc: page.short_desc,
        content: page.content,
        image_url: page.image_url,
      }).eq('id', page.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms_pages_admin'] });
      toast.success('Page updated!');
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (editing) {
    return (
      <div className="max-w-2xl">
        <Button variant="ghost" onClick={() => setEditing(null)} className="mb-4">← Back</Button>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">{editing.slug} / {editing.section_key} ({editing.language})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Title</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Short Description</Label>
              <Input value={editing.short_desc} onChange={(e) => setEditing({ ...editing, short_desc: e.target.value })} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Content (HTML)</Label>
              <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={10} className="bg-background font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Image URL</Label>
              <Input value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="bg-background" />
            </div>
            <Button variant="hero" onClick={() => updateMutation.mutate(editing)} disabled={updateMutation.isPending}>
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">CMS Pages</h1>
      <div className="space-y-2">
        {pages?.map((page) => (
          <div key={page.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <div>
              <span className="text-foreground font-medium">{page.slug}/{page.section_key}</span>
              <span className="text-muted-foreground text-sm ml-2">({page.language})</span>
              <span className="text-muted-foreground text-sm ml-2">— {page.title}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing({ ...page })}>Edit</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesEditor;
