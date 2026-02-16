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

interface DriverForm { full_name: string; phone: string; license_number: string; active: boolean; }
const empty: DriverForm = { full_name: '', phone: '', license_number: '', active: true };

const DriversManager = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<DriverForm>(empty);

  const { data: drivers } = useQuery({
    queryKey: ['admin_drivers'],
    queryFn: async () => { const { data } = await supabase.from('drivers').select('*').order('full_name'); return data || []; },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = { ...form, phone: form.phone || null, license_number: form.license_number || null };
      if (editing) { const { error } = await supabase.from('drivers').update(payload).eq('id', editing); if (error) throw error; }
      else { const { error } = await supabase.from('drivers').insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_drivers'] }); toast.success('Saved'); setOpen(false); setEditing(null); setForm(empty); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('drivers').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_drivers'] }); toast.success('Deleted'); },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => { const { error } = await supabase.from('drivers').update({ active }).eq('id', id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_drivers'] }),
  });

  const openEdit = (d: any) => { setEditing(d.id); setForm({ full_name: d.full_name, phone: d.phone || '', license_number: d.license_number || '', active: d.active }); setOpen(true); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Driver</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Driver' : 'New Driver'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>License Number</Label><Input value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} /></div>
              <Button className="w-full" onClick={() => upsert.mutate()}>{editing ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>License</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {drivers?.map((d: any) => (
            <TableRow key={d.id}>
              <TableCell className="text-foreground font-medium">{d.full_name}</TableCell>
              <TableCell className="text-muted-foreground">{d.phone}</TableCell>
              <TableCell className="text-muted-foreground">{d.license_number}</TableCell>
              <TableCell><Switch checked={d.active} onCheckedChange={v => toggleActive.mutate({ id: d.id, active: v })} /></TableCell>
              <TableCell className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(d)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate(d.id)}><Trash2 className="h-3 w-3" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriversManager;
