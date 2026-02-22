import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { Mail, Eye, CheckCheck } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

const ContactMessages = () => {
  const { language } = useLanguage();
  const es = language === 'es';
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error(error.message); }
    else { setMessages(data || []); }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(es ? `Marcado como ${status === 'read' ? 'leído' : status === 'replied' ? 'respondido' : status}` : `Marked as ${status}`);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const statusColor = (s: string) => {
    if (s === 'unread') return 'destructive';
    if (s === 'read') return 'secondary';
    return 'default';
  };

  const statusLabel = (s: string) => {
    if (es) {
      if (s === 'unread') return 'No leído';
      if (s === 'read') return 'Leído';
      if (s === 'replied') return 'Respondido';
    }
    return s;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2"><Mail className="h-5 w-5" />{es ? 'Mensajes de Contacto' : 'Contact Messages'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">{es ? 'Cargando...' : 'Loading...'}</p> : messages.length === 0 ? <p className="text-muted-foreground">{es ? 'No hay mensajes aún.' : 'No messages yet.'}</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{es ? 'Fecha' : 'Date'}</TableHead>
                  <TableHead>{es ? 'Nombre' : 'Name'}</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>{es ? 'Mensaje' : 'Message'}</TableHead>
                  <TableHead>{es ? 'Estado' : 'Status'}</TableHead>
                  <TableHead>{es ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground text-xs">{format(new Date(m.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-foreground font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{m.message}</TableCell>
                    <TableCell><Badge variant={statusColor(m.status)}>{statusLabel(m.status)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setSelected(m); if (m.status === 'unread') updateStatus(m.id, 'read'); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {m.status !== 'replied' && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(m.id, 'replied')}>
                            <CheckCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">{es ? 'Mensaje de' : 'Message from'} {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{selected.email} · {format(new Date(selected.created_at), 'PPpp')}</p>
              <p className="text-foreground whitespace-pre-wrap">{selected.message}</p>
              <div className="flex gap-2">
                <Badge variant={statusColor(selected.status)}>{statusLabel(selected.status)}</Badge>
                {selected.status !== 'replied' && (
                  <Button size="sm" onClick={() => updateStatus(selected.id, 'replied')}>{es ? 'Marcar Respondido' : 'Mark Replied'}</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessages;
