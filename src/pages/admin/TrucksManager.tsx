import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const vehicleTypes = ['truck', 'half_box_trailer', 'full_box_trailer'];
const truckStatuses = ['available', 'in_transit', 'maintenance', 'inactive'];
const statusColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-400',
  in_transit: 'bg-blue-500/20 text-blue-400',
  maintenance: 'bg-yellow-500/20 text-yellow-400',
  inactive: 'bg-muted text-muted-foreground',
};

interface TruckForm {
  plate_number: string; model: string; capacity_kg: string; active: boolean;
  vin: string; vehicle_type: string; capacity_pallets: string; current_status: string;
  last_maintenance_date: Date | undefined; assigned_driver_id: string;
}
const empty: TruckForm = {
  plate_number: '', model: '', capacity_kg: '', active: true,
  vin: '', vehicle_type: 'truck', capacity_pallets: '', current_status: 'available',
  last_maintenance_date: undefined, assigned_driver_id: '',
};

const TrucksManager = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<TruckForm>(empty);

  const { data: trucks } = useQuery({
    queryKey: ['admin_trucks'],
    queryFn: async () => { const { data } = await supabase.from('trucks').select('*, drivers:assigned_driver_id(full_name)').order('plate_number'); return data || []; },
  });

  const { data: drivers } = useQuery({
    queryKey: ['admin_drivers_for_trucks'],
    queryFn: async () => { const { data } = await supabase.from('drivers').select('id, full_name').eq('active', true); return data || []; },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload: any = {
        plate_number: form.plate_number, model: form.model || null,
        capacity_kg: form.capacity_kg ? parseFloat(form.capacity_kg) : null, active: form.active,
        vin: form.vin || null, vehicle_type: form.vehicle_type, current_status: form.current_status,
        capacity_pallets: form.capacity_pallets ? parseInt(form.capacity_pallets) : null,
        last_maintenance_date: form.last_maintenance_date ? format(form.last_maintenance_date, 'yyyy-MM-dd') : null,
        assigned_driver_id: form.assigned_driver_id || null,
      };
      if (editing) { const { error } = await supabase.from('trucks').update(payload).eq('id', editing); if (error) throw error; }
      else { const { error } = await supabase.from('trucks').insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_trucks'] }); toast.success('Saved'); setOpen(false); setEditing(null); setForm(empty); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('trucks').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_trucks'] }); toast.success('Deleted'); },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => { const { error } = await supabase.from('trucks').update({ active }).eq('id', id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_trucks'] }),
  });

  const openEdit = (t: any) => {
    setEditing(t.id);
    setForm({
      plate_number: t.plate_number, model: t.model || '', capacity_kg: t.capacity_kg?.toString() || '', active: t.active,
      vin: t.vin || '', vehicle_type: t.vehicle_type || 'truck', capacity_pallets: t.capacity_pallets?.toString() || '',
      current_status: t.current_status || 'available',
      last_maintenance_date: t.last_maintenance_date ? new Date(t.last_maintenance_date) : undefined,
      assigned_driver_id: t.assigned_driver_id || '',
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Trucks</h1>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Truck</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Edit Truck' : 'New Truck'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Plate Number</Label><Input value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })} /></div>
              <div><Label>VIN</Label><Input value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} placeholder="Vehicle ID Number" /></div>
              <div><Label>Vehicle Type</Label>
                <Select value={form.vehicle_type} onValueChange={v => setForm({ ...form, vehicle_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{vehicleTypes.map(vt => <SelectItem key={vt} value={vt}>{vt.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Model</Label><Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
              <div className="flex gap-4">
                <div className="flex-1"><Label>Capacity (kg)</Label><Input type="number" value={form.capacity_kg} onChange={e => setForm({ ...form, capacity_kg: e.target.value })} /></div>
                <div className="flex-1"><Label>Capacity (pallets)</Label><Input type="number" value={form.capacity_pallets} onChange={e => setForm({ ...form, capacity_pallets: e.target.value })} /></div>
              </div>
              <div><Label>Status</Label>
                <Select value={form.current_status} onValueChange={v => setForm({ ...form, current_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{truckStatuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Assigned Driver</Label>
                <Select value={form.assigned_driver_id} onValueChange={v => setForm({ ...form, assigned_driver_id: v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {drivers?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Last Maintenance Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.last_maintenance_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.last_maintenance_date ? format(form.last_maintenance_date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.last_maintenance_date} onSelect={d => setForm({ ...form, last_maintenance_date: d })} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <Button className="w-full" onClick={() => upsert.mutate()}>{editing ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Plate</TableHead><TableHead>VIN</TableHead><TableHead>Type</TableHead><TableHead>Model</TableHead>
            <TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead>Driver</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {trucks?.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell className="text-foreground font-medium">{t.plate_number}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{t.vin || '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.vehicle_type?.replace(/_/g, ' ')}</TableCell>
                <TableCell className="text-muted-foreground">{t.model}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.capacity_kg ? `${t.capacity_kg}kg` : ''}{t.capacity_pallets ? ` / ${t.capacity_pallets}p` : ''}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[t.current_status] || ''}`}>{t.current_status?.replace(/_/g, ' ')}</span></TableCell>
                <TableCell className="text-muted-foreground">{t.drivers?.full_name || '—'}</TableCell>
                <TableCell><Switch checked={t.active} onCheckedChange={v => toggleActive.mutate({ id: t.id, active: v })} /></TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate(t.id)}><Trash2 className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TrucksManager;
