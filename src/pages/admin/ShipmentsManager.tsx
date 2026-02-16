import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Package, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const statuses = ['pending', 'loading', 'in_transit', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  loading: 'bg-orange-500/20 text-orange-400',
  in_transit: 'bg-blue-500/20 text-blue-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

interface ShipmentForm { origin: string; destination: string; driver_id: string; truck_id: string; user_id: string; notes: string; }
const empty: ShipmentForm = { origin: '', destination: '', driver_id: '', truck_id: '', user_id: '', notes: '' };

const ShipmentsManager = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ShipmentForm>(empty);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [palletDesc, setPalletDesc] = useState('');
  const [palletWeight, setPalletWeight] = useState('');
  const [palletDims, setPalletDims] = useState('');

  const { data: shipments } = useQuery({
    queryKey: ['admin_shipments'],
    queryFn: async () => {
      const { data } = await supabase.from('shipments').select('*, drivers(full_name), trucks(plate_number)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: drivers } = useQuery({ queryKey: ['admin_drivers_list'], queryFn: async () => { const { data } = await supabase.from('drivers').select('id, full_name').eq('active', true); return data || []; } });
  const { data: trucks } = useQuery({ queryKey: ['admin_trucks_list'], queryFn: async () => { const { data } = await supabase.from('trucks').select('id, plate_number').eq('active', true); return data || []; } });

  const { data: pallets } = useQuery({
    queryKey: ['admin_pallets', expanded],
    queryFn: async () => {
      if (!expanded) return [];
      const { data } = await supabase.from('shipment_pallets').select('*').eq('shipment_id', expanded).order('position');
      return data || [];
    },
    enabled: !!expanded,
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = { origin: form.origin, destination: form.destination, notes: form.notes || null };
      if (form.driver_id) payload.driver_id = form.driver_id;
      if (form.truck_id) payload.truck_id = form.truck_id;
      if (form.user_id) payload.user_id = form.user_id;
      const { error } = await supabase.from('shipments').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_shipments'] }); toast.success('Shipment created'); setOpen(false); setForm(empty); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('shipments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_shipments'] }); toast.success('Status updated'); },
  });

  const addPallet = useMutation({
    mutationFn: async () => {
      if (!expanded) return;
      const { error } = await supabase.from('shipment_pallets').insert({
        shipment_id: expanded,
        description: palletDesc,
        weight_kg: palletWeight ? parseFloat(palletWeight) : null,
        dimensions: palletDims || null,
        position: (pallets?.length || 0),
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_pallets', expanded] }); toast.success('Pallet added'); setPalletDesc(''); setPalletWeight(''); setPalletDims(''); },
  });

  const delPallet = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('shipment_pallets').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_pallets', expanded] }); toast.success('Pallet removed'); },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Shipments</h1>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setForm(empty); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Shipment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Shipment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Origin</Label><Input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} /></div>
              <div><Label>Destination</Label><Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></div>
              <div><Label>Driver</Label>
                <Select value={form.driver_id} onValueChange={v => setForm({ ...form, driver_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                  <SelectContent>{drivers?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Truck</Label>
                <Select value={form.truck_id} onValueChange={v => setForm({ ...form, truck_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select truck" /></SelectTrigger>
                  <SelectContent>{trucks?.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.plate_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button className="w-full" onClick={() => create.mutate()}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Tracking #</TableHead>
            <TableHead>Origin → Dest</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Truck</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments?.map((s: any) => (
            <>
              <TableRow key={s.id}>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                    {expanded === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell className="text-foreground font-mono text-sm">{s.tracking_number}</TableCell>
                <TableCell className="text-muted-foreground">{s.origin} → {s.destination}</TableCell>
                <TableCell className="text-muted-foreground">{s.drivers?.full_name || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{s.trucks?.plate_number || '—'}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[s.status]}`}>{s.status}</span></TableCell>
                <TableCell>
                  <Select value={s.status} onValueChange={v => updateStatus.mutate({ id: s.id, status: v })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
              {expanded === s.id && (
                <TableRow key={`${s.id}-pallets`}>
                  <TableCell colSpan={7}>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Package className="h-4 w-4" />Pallets / Bytarimas</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                        {pallets?.map((p: any) => (
                          <div key={p.id} className="bg-primary/10 border border-primary/20 rounded p-2 text-xs relative group">
                            <p className="font-medium text-foreground truncate">{p.description}</p>
                            {p.weight_kg && <p className="text-muted-foreground">{p.weight_kg} kg</p>}
                            {p.dimensions && <p className="text-muted-foreground">{p.dimensions}</p>}
                            <Button size="sm" variant="ghost" className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-destructive" onClick={() => delPallet.mutate(p.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {(!pallets || pallets.length === 0) && <p className="text-muted-foreground text-sm col-span-full">No pallets yet</p>}
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1"><Label className="text-xs">Description</Label><Input value={palletDesc} onChange={e => setPalletDesc(e.target.value)} className="h-8 text-sm" /></div>
                        <div className="w-24"><Label className="text-xs">Weight</Label><Input value={palletWeight} onChange={e => setPalletWeight(e.target.value)} className="h-8 text-sm" placeholder="kg" /></div>
                        <div className="w-28"><Label className="text-xs">Dimensions</Label><Input value={palletDims} onChange={e => setPalletDims(e.target.value)} className="h-8 text-sm" placeholder="LxWxH" /></div>
                        <Button size="sm" onClick={() => addPallet.mutate()} disabled={!palletDesc}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ShipmentsManager;
