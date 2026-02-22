import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus } from 'lucide-react';

const invoiceStatuses = ['pending', 'paid_full', 'paid_partial', 'cod', 'online_on_delivery', 'cancelled', 'overdue'];
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid_full: 'bg-green-500/20 text-green-400',
  paid_partial: 'bg-teal-500/20 text-teal-400',
  cod: 'bg-blue-500/20 text-blue-400',
  online_on_delivery: 'bg-indigo-500/20 text-indigo-400',
  cancelled: 'bg-red-500/20 text-red-400',
  overdue: 'bg-orange-500/20 text-orange-400',
  paid: 'bg-green-500/20 text-green-400',
};

interface InvoiceForm { shipment_id: string; user_id: string; amount: string; currency: string; }
const empty: InvoiceForm = { shipment_id: '', user_id: '', amount: '', currency: 'MXN' };

const InvoicesManager = () => {
  const qc = useQueryClient();
  const { language } = useLanguage();
  const es = language === 'es';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(empty);

  const { data: invoices } = useQuery({
    queryKey: ['admin_invoices'],
    queryFn: async () => { const { data } = await supabase.from('invoices').select('*, shipments(tracking_number)').order('created_at', { ascending: false }); return data || []; },
  });

  const { data: shipments } = useQuery({
    queryKey: ['admin_shipments_for_invoice'],
    queryFn: async () => { const { data } = await supabase.from('shipments').select('id, tracking_number, user_id'); return data || []; },
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = { amount: parseFloat(form.amount), currency: form.currency, user_id: form.user_id };
      if (form.shipment_id) payload.shipment_id = form.shipment_id;
      const { error } = await supabase.from('invoices').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_invoices'] }); toast.success(es ? 'Factura creada' : 'Invoice created'); setOpen(false); setForm(empty); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_invoices'] }); toast.success(es ? 'Actualizado' : 'Updated'); },
  });

  const handleShipmentSelect = (shipmentId: string) => {
    const ship = shipments?.find((s: any) => s.id === shipmentId);
    setForm({ ...form, shipment_id: shipmentId, user_id: ship?.user_id || form.user_id });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{es ? 'Facturas' : 'Invoices'}</h1>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setForm(empty); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />{es ? 'Nueva Factura' : 'New Invoice'}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{es ? 'Crear Factura' : 'Create Invoice'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>{es ? 'Envío' : 'Shipment'}</Label>
                <Select value={form.shipment_id} onValueChange={handleShipmentSelect}>
                  <SelectTrigger><SelectValue placeholder={es ? 'Seleccionar envío' : 'Select shipment'} /></SelectTrigger>
                  <SelectContent>{shipments?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.tracking_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{es ? 'ID de Usuario' : 'User ID'}</Label><Input value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} placeholder={es ? 'UUID del usuario' : 'UUID of user'} /></div>
              <div className="flex gap-4">
                <div className="flex-1"><Label>{es ? 'Monto' : 'Amount'}</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
                <div className="w-24"><Label>{es ? 'Moneda' : 'Currency'}</Label><Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
              </div>
              <Button className="w-full" onClick={() => create.mutate()}>{es ? 'Crear' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{es ? 'Factura #' : 'Invoice #'}</TableHead>
          <TableHead>{es ? 'Envío' : 'Shipment'}</TableHead>
          <TableHead>{es ? 'Monto' : 'Amount'}</TableHead>
          <TableHead>{es ? 'Estado' : 'Status'}</TableHead>
          <TableHead>{es ? 'Fecha' : 'Date'}</TableHead>
          <TableHead>{es ? 'Acciones' : 'Actions'}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {invoices?.map((inv: any) => (
            <TableRow key={inv.id}>
              <TableCell className="text-foreground font-mono text-sm">{inv.invoice_number}</TableCell>
              <TableCell className="text-muted-foreground">{inv.shipments?.tracking_number || '—'}</TableCell>
              <TableCell className="text-foreground">${inv.amount} {inv.currency}</TableCell>
              <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[inv.status] || ''}`}>{inv.status?.replace(/_/g, ' ')}</span></TableCell>
              <TableCell className="text-muted-foreground text-sm">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Select value={inv.status} onValueChange={v => updateStatus.mutate({ id: inv.id, status: v })}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{invoiceStatuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoicesManager;
