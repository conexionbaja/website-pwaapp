import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Plus, Package, Trash2, ChevronDown, ChevronUp, ArrowUpDown, CalendarIcon, History } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statuses = [
  'created', 'assigned', 'picked_up', 'in_transit', 'passed_city',
  'out_for_delivery', 'delivered', 'delayed_mechanical',
  'delayed_weather', 'delayed_custom', 'on_time', 'cancelled',
];
const statusColors: Record<string, string> = {
  created: 'bg-muted text-muted-foreground',
  assigned: 'bg-purple-500/20 text-purple-400',
  picked_up: 'bg-indigo-500/20 text-indigo-400',
  in_transit: 'bg-blue-500/20 text-blue-400',
  passed_city: 'bg-cyan-500/20 text-cyan-400',
  out_for_delivery: 'bg-teal-500/20 text-teal-400',
  delivered: 'bg-green-500/20 text-green-400',
  delayed_mechanical: 'bg-orange-500/20 text-orange-400',
  delayed_weather: 'bg-amber-500/20 text-amber-400',
  delayed_custom: 'bg-yellow-500/20 text-yellow-400',
  on_time: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  loading: 'bg-orange-500/20 text-orange-400',
};

const routeCities = ['Tijuana', 'Ensenada', 'San Quintin', 'Guerrero Negro', 'Mulege', 'La Paz', 'Cabo San Lucas'];
const routeOrder: Record<string, number> = { 'Tijuana': 0, 'Ensenada': 1, 'San Quintin': 2, 'Guerrero Negro': 3, 'Mulege': 4, 'La Paz': 5, 'Cabo San Lucas': 6 };
const loadTypes = ['pallet', 'package', 'box', 'envelope'];
const paymentStatuses = ['pending', 'paid', 'partial', 'cod'];

interface ShipmentForm { origin: string; destination: string; driver_id: string; truck_id: string; user_id: string; notes: string; estimated_delivery_at: Date | undefined; current_location: string; }
const empty: ShipmentForm = { origin: '', destination: '', driver_id: '', truck_id: '', user_id: '', notes: '', estimated_delivery_at: undefined, current_location: '' };

interface PalletForm {
  description: string; weight_kg: string; dimensions: string; load_type: string;
  origin_city: string; destination_city: string; client_name: string;
  delivery_address: string; delivery_contact: string; cost: string;
  payment_status: string; special_handling: string;
}
const emptyPallet: PalletForm = {
  description: '', weight_kg: '', dimensions: '', load_type: 'pallet',
  origin_city: '', destination_city: '', client_name: '',
  delivery_address: '', delivery_contact: '', cost: '',
  payment_status: 'pending', special_handling: '',
};

const ShipmentsManager = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { language } = useLanguage();
  const es = language === 'es';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ShipmentForm>(empty);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [palletForm, setPalletForm] = useState<PalletForm>(emptyPallet);
  const [showHistory, setShowHistory] = useState<string | null>(null);

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

  const { data: statusLogs } = useQuery({
    queryKey: ['admin_status_log', showHistory],
    queryFn: async () => {
      if (!showHistory) return [];
      const { data } = await supabase.from('shipment_status_log').select('*').eq('shipment_id', showHistory).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!showHistory,
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = { origin: form.origin, destination: form.destination, notes: form.notes || null, current_location: form.current_location || null };
      if (form.driver_id) payload.driver_id = form.driver_id;
      if (form.truck_id) payload.truck_id = form.truck_id;
      if (form.user_id) payload.user_id = form.user_id;
      if (form.estimated_delivery_at) payload.estimated_delivery_at = form.estimated_delivery_at.toISOString();
      const { error } = await supabase.from('shipments').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_shipments'] }); toast.success(es ? 'Envío creado' : 'Shipment created'); setOpen(false); setForm(empty); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('shipments').update({ status }).eq('id', id);
      if (error) throw error;
      await supabase.from('shipment_status_log').insert({ shipment_id: id, status, changed_by: user?.id || null });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin_shipments'] });
      qc.invalidateQueries({ queryKey: ['admin_status_log'] });
      toast.success(es ? 'Estado actualizado' : 'Status updated');
    },
  });

  const addPallet = useMutation({
    mutationFn: async () => {
      if (!expanded) return;
      const { error } = await supabase.from('shipment_pallets').insert({
        shipment_id: expanded, description: palletForm.description,
        weight_kg: palletForm.weight_kg ? parseFloat(palletForm.weight_kg) : null,
        dimensions: palletForm.dimensions || null, load_type: palletForm.load_type,
        origin_city: palletForm.origin_city || null, destination_city: palletForm.destination_city || null,
        client_name: palletForm.client_name || null, delivery_address: palletForm.delivery_address || null,
        delivery_contact: palletForm.delivery_contact || null,
        cost: palletForm.cost ? parseFloat(palletForm.cost) : null,
        payment_status: palletForm.payment_status, special_handling: palletForm.special_handling || null,
        position: (pallets?.length || 0),
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_pallets', expanded] }); toast.success(es ? 'Tarima agregada' : 'Pallet added'); setPalletForm(emptyPallet); },
  });

  const delPallet = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('shipment_pallets').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_pallets', expanded] }); toast.success(es ? 'Tarima eliminada' : 'Pallet removed'); },
  });

  const autoSort = useMutation({
    mutationFn: async () => {
      if (!pallets || pallets.length === 0) return;
      const sorted = [...pallets].sort((a, b) => {
        const aIdx = routeOrder[a.destination_city || ''] ?? -1;
        const bIdx = routeOrder[b.destination_city || ''] ?? -1;
        return bIdx - aIdx;
      });
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].position !== i) {
          await supabase.from('shipment_pallets').update({ position: i }).eq('id', sorted[i].id);
        }
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_pallets', expanded] }); toast.success(es ? 'Tarimas ordenadas por ruta' : 'Pallets sorted by route'); },
  });

  const toggleExpand = (id: string) => {
    if (expanded === id) { setExpanded(null); setShowHistory(null); }
    else { setExpanded(id); setShowHistory(null); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{es ? 'Envíos' : 'Shipments'}</h1>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setForm(empty); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />{es ? 'Nuevo Envío' : 'New Shipment'}</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{es ? 'Crear Envío' : 'Create Shipment'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>{es ? 'Origen' : 'Origin'}</Label><Input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} /></div>
              <div><Label>{es ? 'Destino' : 'Destination'}</Label><Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></div>
              <div><Label>{es ? 'Conductor' : 'Driver'}</Label>
                <Select value={form.driver_id} onValueChange={v => setForm({ ...form, driver_id: v })}>
                  <SelectTrigger><SelectValue placeholder={es ? 'Seleccionar conductor' : 'Select driver'} /></SelectTrigger>
                  <SelectContent>{drivers?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{es ? 'Camión' : 'Truck'}</Label>
                <Select value={form.truck_id} onValueChange={v => setForm({ ...form, truck_id: v })}>
                  <SelectTrigger><SelectValue placeholder={es ? 'Seleccionar camión' : 'Select truck'} /></SelectTrigger>
                  <SelectContent>{trucks?.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.plate_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{es ? 'Entrega Estimada' : 'Estimated Delivery'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.estimated_delivery_at && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.estimated_delivery_at ? format(form.estimated_delivery_at, 'PPP') : (es ? 'Seleccionar fecha' : 'Pick a date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.estimated_delivery_at} onSelect={d => setForm({ ...form, estimated_delivery_at: d })} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div><Label>{es ? 'Ubicación Actual' : 'Current Location'}</Label><Input value={form.current_location} onChange={e => setForm({ ...form, current_location: e.target.value })} placeholder={es ? 'Opcional' : 'Optional'} /></div>
              <div><Label>{es ? 'Notas' : 'Notes'}</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button className="w-full" onClick={() => create.mutate()}>{es ? 'Crear' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>{es ? 'Rastreo #' : 'Tracking #'}</TableHead>
              <TableHead>{es ? 'Origen → Dest' : 'Origin → Dest'}</TableHead>
              <TableHead>{es ? 'Conductor' : 'Driver'}</TableHead>
              <TableHead>{es ? 'Camión' : 'Truck'}</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>{es ? 'Estado' : 'Status'}</TableHead>
              <TableHead>{es ? 'Acciones' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments?.map((s: any) => (
              <>
                <TableRow key={s.id}>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => toggleExpand(s.id)}>
                      {expanded === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell className="text-foreground font-mono text-sm">{s.tracking_number}</TableCell>
                  <TableCell className="text-muted-foreground">{s.origin} → {s.destination}</TableCell>
                  <TableCell className="text-muted-foreground">{s.drivers?.full_name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{s.trucks?.plate_number || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.estimated_delivery_at ? new Date(s.estimated_delivery_at).toLocaleDateString() : '—'}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[s.status] || ''}`}>{s.status?.replace(/_/g, ' ')}</span></TableCell>
                  <TableCell>
                    <Select value={s.status} onValueChange={v => updateStatus.mutate({ id: s.id, status: v })}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>{statuses.map(st => <SelectItem key={st} value={st}>{st.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                {expanded === s.id && (
                  <TableRow key={`${s.id}-details`}>
                    <TableCell colSpan={8}>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                        {(s.current_location || s.delay_reason) && (
                          <div className="flex gap-4 text-sm">
                            {s.current_location && <p className="text-muted-foreground">📍 {es ? 'Ubicación' : 'Location'}: <span className="text-foreground">{s.current_location}</span></p>}
                            {s.delay_reason && <p className="text-muted-foreground">⚠️ {es ? 'Retraso' : 'Delay'}: <span className="text-foreground">{s.delay_reason}</span></p>}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><Package className="h-4 w-4" />{es ? 'Tarimas / Pallets' : 'Pallets / Bytarimas'}</h3>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => autoSort.mutate()} disabled={!pallets?.length}>
                                <ArrowUpDown className="h-3 w-3 mr-1" />{es ? 'Auto-Ordenar' : 'Auto-Sort'}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setShowHistory(showHistory === s.id ? null : s.id)}>
                                <History className="h-3 w-3 mr-1" />{es ? 'Historial' : 'History'}
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                            {pallets?.map((p: any) => (
                              <div key={p.id} className="bg-primary/10 border border-primary/20 rounded p-2 text-xs relative group">
                                <span className={`inline-block px-1 rounded text-[10px] mb-1 ${p.load_type === 'pallet' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{p.load_type}</span>
                                <p className="font-medium text-foreground truncate">{p.description}</p>
                                {p.destination_city && <p className="text-muted-foreground">→ {p.destination_city}</p>}
                                {p.weight_kg && <p className="text-muted-foreground">{p.weight_kg} kg</p>}
                                {p.cost != null && <p className="text-foreground">${p.cost}</p>}
                                {p.payment_status && <span className={`inline-block px-1 rounded text-[10px] ${p.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{p.payment_status}</span>}
                                <Button size="sm" variant="ghost" className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-destructive" onClick={() => delPallet.mutate(p.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            {(!pallets || pallets.length === 0) && <p className="text-muted-foreground text-sm col-span-full">{es ? 'Sin tarimas aún' : 'No pallets yet'}</p>}
                          </div>

                          <div className="border border-border rounded p-3 space-y-2">
                            <p className="text-sm font-medium text-foreground">{es ? 'Agregar Tarima' : 'Add Pallet'}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div><Label className="text-xs">{es ? 'Descripción' : 'Description'}</Label><Input value={palletForm.description} onChange={e => setPalletForm({ ...palletForm, description: e.target.value })} className="h-8 text-sm" /></div>
                              <div><Label className="text-xs">{es ? 'Tipo de Carga' : 'Load Type'}</Label>
                                <Select value={palletForm.load_type} onValueChange={v => setPalletForm({ ...palletForm, load_type: v })}>
                                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>{loadTypes.map(lt => <SelectItem key={lt} value={lt}>{lt}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div><Label className="text-xs">{es ? 'Ciudad Origen' : 'Origin City'}</Label>
                                <Select value={palletForm.origin_city} onValueChange={v => setPalletForm({ ...palletForm, origin_city: v })}>
                                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={es ? 'Seleccionar' : 'Select'} /></SelectTrigger>
                                  <SelectContent>{routeCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div><Label className="text-xs">{es ? 'Ciudad Destino' : 'Destination City'}</Label>
                                <Select value={palletForm.destination_city} onValueChange={v => setPalletForm({ ...palletForm, destination_city: v })}>
                                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={es ? 'Seleccionar' : 'Select'} /></SelectTrigger>
                                  <SelectContent>{routeCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div><Label className="text-xs">{es ? 'Nombre del Cliente' : 'Client Name'}</Label><Input value={palletForm.client_name} onChange={e => setPalletForm({ ...palletForm, client_name: e.target.value })} className="h-8 text-sm" /></div>
                              <div><Label className="text-xs">{es ? 'Peso (kg)' : 'Weight (kg)'}</Label><Input type="number" value={palletForm.weight_kg} onChange={e => setPalletForm({ ...palletForm, weight_kg: e.target.value })} className="h-8 text-sm" /></div>
                              <div><Label className="text-xs">{es ? 'Dimensiones' : 'Dimensions'}</Label><Input value={palletForm.dimensions} onChange={e => setPalletForm({ ...palletForm, dimensions: e.target.value })} className="h-8 text-sm" placeholder="LxWxH" /></div>
                              <div><Label className="text-xs">{es ? 'Costo' : 'Cost'}</Label><Input type="number" value={palletForm.cost} onChange={e => setPalletForm({ ...palletForm, cost: e.target.value })} className="h-8 text-sm" /></div>
                              <div><Label className="text-xs">{es ? 'Estado de Pago' : 'Payment Status'}</Label>
                                <Select value={palletForm.payment_status} onValueChange={v => setPalletForm({ ...palletForm, payment_status: v })}>
                                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>{paymentStatuses.map(ps => <SelectItem key={ps} value={ps}>{ps}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div><Label className="text-xs">{es ? 'Dirección de Entrega' : 'Delivery Address'}</Label><Input value={palletForm.delivery_address} onChange={e => setPalletForm({ ...palletForm, delivery_address: e.target.value })} className="h-8 text-sm" /></div>
                              <div><Label className="text-xs">{es ? 'Contacto de Entrega' : 'Delivery Contact'}</Label><Input value={palletForm.delivery_contact} onChange={e => setPalletForm({ ...palletForm, delivery_contact: e.target.value })} className="h-8 text-sm" /></div>
                              <div><Label className="text-xs">{es ? 'Manejo Especial' : 'Special Handling'}</Label><Input value={palletForm.special_handling} onChange={e => setPalletForm({ ...palletForm, special_handling: e.target.value })} className="h-8 text-sm" /></div>
                            </div>
                            <Button size="sm" onClick={() => addPallet.mutate()} disabled={!palletForm.description}><Plus className="h-3 w-3 mr-1" />{es ? 'Agregar' : 'Add'}</Button>
                          </div>
                        </div>

                        {showHistory === s.id && (
                          <div className="border-t border-border pt-4">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><History className="h-4 w-4" />{es ? 'Historial de Estado' : 'Status History'}</h4>
                            {statusLogs && statusLogs.length > 0 ? (
                              <div className="space-y-2">
                                {statusLogs.map((log: any) => (
                                  <div key={log.id} className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                    <div>
                                      <span className={`px-2 py-0.5 rounded text-xs ${statusColors[log.status] || ''}`}>{log.status?.replace(/_/g, ' ')}</span>
                                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                                      {log.location && <p className="text-xs text-muted-foreground">📍 {log.location}</p>}
                                      {log.notes && <p className="text-xs text-muted-foreground">{log.notes}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : <p className="text-muted-foreground text-sm">{es ? 'Sin historial aún' : 'No history yet'}</p>}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShipmentsManager;
