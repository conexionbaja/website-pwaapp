import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface TruckForm { plate_number: string; model: string; capacity_kg: string; active: boolean; }
const empty: TruckForm = { plate_number: '', model: '', capacity_kg: '', active: true };

const TrucksManager = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<TruckForm>(empty);

  const { data: trucks } = useQuery({
    queryKey: ['admin_trucks'],
    queryFn: async () => { const { data } = await supabase.from('trucks').select('*').order('plate_number'); return data || []; },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = { plate_number: form.plate_number, model: form.model || null, capacity_kg: form.capacity_kg ? parseFloat(form.capacity_kg) : null, active: form.active };
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

  const openEdit = (t: any) => { setEditing(t.id); setForm({ plate_number: t.plate_number, model: t.model || '', capacity_kg: t.capacity_kg?.toString() || '', active: t.active }); setOpen(true); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Trucks</h1>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Truck</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Truck' : 'New Truck'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Plate Number</Label><Input value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })} /></div>
              <div><Label>Model</Label><Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
              <div><Label>Capacity (kg)</Label><Input type="number" value={form.capacity_kg} onChange={e => setForm({ ...form, capacity_kg: e.target.value })} /></div>
              <Button className="w-full" onClick={() => upsert.mutate()}>{editing ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Plate</TableHead><TableHead>Model</TableHead><TableHead>Capacity (kg)</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {trucks?.map((t: any) => (
            <TableRow key={t.id}>
              <TableCell className="text-foreground font-medium">{t.plate_number}</TableCell>
              <TableCell className="text-muted-foreground">{t.model}</TableCell>
              <TableCell className="text-muted-foreground">{t.capacity_kg}</TableCell>
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
  );
};

export default TrucksManager;
