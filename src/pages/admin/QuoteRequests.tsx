import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Receipt, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  quoted: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-muted text-muted-foreground',
};

const QuoteRequests = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const es = language === 'es';
  const [quoteDialog, setQuoteDialog] = useState<any>(null);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState<Date | undefined>(undefined);

  const { data: requests } = useQuery({
    queryKey: ['quote_requests'],
    queryFn: async () => {
      const { data } = await supabase.from('quote_requests').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('quote_requests').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote_requests'] });
      toast.success(es ? '¡Estado actualizado!' : 'Status updated!');
    },
  });

  const saveQuote = useMutation({
    mutationFn: async () => {
      if (!quoteDialog) return;
      const updates: any = { status: 'quoted' };
      if (price) updates.quote_price = parseFloat(price);
      if (notes) updates.quote_notes = notes;
      if (validUntil) updates.valid_until = validUntil.toISOString();
      const { error } = await supabase.from('quote_requests').update(updates).eq('id', quoteDialog.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote_requests'] });
      toast.success(es ? '¡Cotización guardada!' : 'Quote saved!');
      setQuoteDialog(null); setPrice(''); setNotes(''); setValidUntil(undefined);
    },
  });

  const convertToShipment = useMutation({
    mutationFn: async (r: any) => {
      const { error } = await supabase.from('shipments').insert({
        quote_request_id: r.id, user_id: r.user_id || null,
        origin: r.origin, destination: r.destination,
        notes: `From quote: ${r.name} - ${r.description || ''}`,
      });
      if (error) throw error;
      await supabase.from('quote_requests').update({ status: 'closed' }).eq('id', r.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote_requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin_shipments'] });
      toast.success(es ? '¡Envío creado desde cotización!' : 'Shipment created from quote!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const convertToInvoice = useMutation({
    mutationFn: async (r: any) => {
      if (!r.quote_price) { toast.error(es ? 'No hay precio en esta cotización' : 'No price set on this quote'); throw new Error('No price'); }
      if (!r.user_id) { toast.error(es ? 'No hay usuario vinculado' : 'No user linked to this quote'); throw new Error('No user'); }
      const { error } = await supabase.from('invoices').insert({
        amount: r.quote_price, user_id: r.user_id,
      });
      if (error) throw error;
      await supabase.from('quote_requests').update({ status: 'closed' }).eq('id', r.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote_requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin_invoices'] });
      toast.success(es ? '¡Factura creada desde cotización!' : 'Invoice created from quote!');
    },
    onError: (e: any) => { if (e.message !== 'No price' && e.message !== 'No user') toast.error(e.message); },
  });

  const openQuoteDialog = (r: any) => {
    setQuoteDialog(r);
    setPrice(r.quote_price?.toString() || '');
    setNotes(r.quote_notes || '');
    setValidUntil(r.valid_until ? new Date(r.valid_until) : undefined);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{es ? 'Solicitudes de Cotización' : 'Quote Requests'}</h1>

      <Dialog open={!!quoteDialog} onOpenChange={o => { if (!o) setQuoteDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{es ? 'Establecer Precio y Notas' : 'Set Quote Price & Notes'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{es ? 'Precio' : 'Price'}</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></div>
            <div><Label>{es ? 'Válido Hasta' : 'Valid Until'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !validUntil && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validUntil ? format(validUntil, 'PPP') : (es ? 'Seleccionar fecha' : 'Pick a date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={validUntil} onSelect={setValidUntil} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div><Label>{es ? 'Notas' : 'Notes'}</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={es ? 'Detalles de la cotización...' : 'Quote details...'} /></div>
            <Button className="w-full" onClick={() => saveQuote.mutate()}>{es ? 'Guardar y Marcar como Cotizado' : 'Save & Mark as Quoted'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{es ? 'Nombre' : 'Name'}</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>{es ? 'Origen → Dest' : 'Origin → Dest'}</TableHead>
              <TableHead>{es ? 'Precio' : 'Price'}</TableHead>
              <TableHead>{es ? 'Válido Hasta' : 'Valid Until'}</TableHead>
              <TableHead>{es ? 'Estado' : 'Status'}</TableHead>
              <TableHead>{es ? 'Fecha' : 'Date'}</TableHead>
              <TableHead>{es ? 'Acciones' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="text-foreground">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                <TableCell className="text-muted-foreground">{r.origin} → {r.destination}</TableCell>
                <TableCell className="text-foreground">{r.quote_price ? `$${r.quote_price}` : '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.valid_until ? new Date(r.valid_until).toLocaleDateString() : '—'}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[r.status] || ''}`}>{r.status}</span></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openQuoteDialog(r)}>{es ? 'Cotizar' : 'Quote'}</Button>
                  {r.status === 'quoted' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => convertToShipment.mutate(r)}>
                        <Package className="h-3 w-3 mr-1" />{es ? 'Envío' : 'Shipment'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => convertToInvoice.mutate(r)}>
                        <Receipt className="h-3 w-3 mr-1" />{es ? 'Factura' : 'Invoice'}
                      </Button>
                    </>
                  )}
                  {r.status !== 'closed' && <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: r.id, status: 'closed' })}>{es ? 'Cerrar' : 'Close'}</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuoteRequests;
