import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  quoted: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-muted text-muted-foreground',
};

const QuoteRequests = () => {
  const queryClient = useQueryClient();
  const [quoteDialog, setQuoteDialog] = useState<any>(null);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

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
      toast.success('Status updated!');
    },
  });

  const saveQuote = useMutation({
    mutationFn: async () => {
      if (!quoteDialog) return;
      const updates: any = { status: 'quoted' };
      if (price) updates.quote_price = parseFloat(price);
      if (notes) updates.quote_notes = notes;
      const { error } = await supabase.from('quote_requests').update(updates).eq('id', quoteDialog.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote_requests'] });
      toast.success('Quote saved!');
      setQuoteDialog(null); setPrice(''); setNotes('');
    },
  });

  const convertToShipment = useMutation({
    mutationFn: async (r: any) => {
      const { error } = await supabase.from('shipments').insert({
        quote_request_id: r.id,
        user_id: r.user_id || null,
        origin: r.origin,
        destination: r.destination,
        notes: `From quote: ${r.name} - ${r.description || ''}`,
      });
      if (error) throw error;
      await supabase.from('quote_requests').update({ status: 'closed' }).eq('id', r.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote_requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin_shipments'] });
      toast.success('Shipment created from quote!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openQuoteDialog = (r: any) => {
    setQuoteDialog(r);
    setPrice(r.quote_price?.toString() || '');
    setNotes(r.quote_notes || '');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Quote Requests</h1>

      <Dialog open={!!quoteDialog} onOpenChange={o => { if (!o) setQuoteDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Quote Price & Notes</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Price</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></div>
            <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Quote details..." /></div>
            <Button className="w-full" onClick={() => saveQuote.mutate()}>Save & Mark as Quoted</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Origin → Dest</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="text-foreground">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                <TableCell className="text-muted-foreground">{r.origin} → {r.destination}</TableCell>
                <TableCell className="text-foreground">{r.quote_price ? `$${r.quote_price}` : '—'}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[r.status]}`}>{r.status}</span></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openQuoteDialog(r)}>Quote</Button>
                  {r.status === 'quoted' && (
                    <Button size="sm" variant="outline" onClick={() => convertToShipment.mutate(r)}>
                      <Package className="h-3 w-3 mr-1" />Shipment
                    </Button>
                  )}
                  {r.status !== 'closed' && <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: r.id, status: 'closed' })}>Close</Button>}
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
