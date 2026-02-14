import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

const NewsletterComposer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<any>(null);

  const { data: emails } = useQuery({
    queryKey: ['newsletter_emails'],
    queryFn: async () => {
      const { data } = await supabase.from('newsletter_emails').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (email: any) => {
      if (email.id) {
        const { error } = await supabase.from('newsletter_emails').update({ subject: email.subject, content: email.content }).eq('id', email.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('newsletter_emails').insert({ subject: email.subject, content: email.content, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter_emails'] });
      toast.success('Saved!');
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const sendMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await supabase.functions.invoke('send-newsletter', { body: { emailId } });
      if (error) throw error;
      await supabase.from('newsletter_emails').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', emailId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter_emails'] });
      toast.success('Newsletter sent!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (editing) {
    return (
      <div className="max-w-2xl">
        <Button variant="ghost" onClick={() => setEditing(null)} className="mb-4">← Back</Button>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">{editing.id ? 'Edit Email' : 'New Email'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Subject</Label>
              <Input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Content (HTML)</Label>
              <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={12} className="bg-background font-mono text-sm" />
            </div>
            <Button variant="hero" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}>Save Draft</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Newsletter</h1>
        <Button variant="hero" onClick={() => setEditing({ subject: '', content: '' })}><Plus className="h-4 w-4 mr-1" />New Email</Button>
      </div>
      <div className="space-y-2">
        {emails?.map((email) => (
          <div key={email.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <div>
              <span className="text-foreground font-medium">{email.subject}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded ${email.status === 'sent' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{email.status}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing({ ...email })}>Edit</Button>
              {email.status === 'draft' && <Button variant="default" size="sm" onClick={() => sendMutation.mutate(email.id)}>Send</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsletterComposer;
