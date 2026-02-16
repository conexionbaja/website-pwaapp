import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface ServiceForm {
  name: string;
  description: string;
  image_url: string;
  price_info: string;
  sort_order: number;
  language: string;
  active: boolean;
}

const empty: ServiceForm = { name: '', description: '', image_url: '', price_info: '', sort_order: 0, language: 'es', active: true };

const ServicesManager = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(empty);

  const { data: services } = useQuery({
    queryKey: ['admin_services'],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('*').order('sort_order');
      return data || [];
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from('services').update(form).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin_services'] });
      toast.success(editing ? 'Service updated' : 'Service created');
      setOpen(false);
      setEditing(null);
      setForm(empty);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_services'] }); toast.success('Deleted'); },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('services').update({ active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_services'] }),
  });

  const openEdit = (s: any) => { setEditing(s.id); setForm({ name: s.name, description: s.description, image_url: s.image_url || '', price_info: s.price_info || '', sort_order: s.sort_order, language: s.language, active: s.active }); setOpen(true); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Services</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Service</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'New Service'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>
              <div><Label>Price Info</Label><Input value={form.price_info} onChange={e => setForm({ ...form, price_info: e.target.value })} /></div>
              <div className="flex gap-4">
                <div className="flex-1"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex-1"><Label>Language</Label><Input value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} /></div>
              </div>
              <Button className="w-full" onClick={() => upsert.mutate()}>{editing ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services?.map((s: any) => (
            <TableRow key={s.id}>
              <TableCell className="text-foreground font-medium">{s.name}</TableCell>
              <TableCell className="text-muted-foreground">{s.language}</TableCell>
              <TableCell className="text-muted-foreground">{s.sort_order}</TableCell>
              <TableCell><Switch checked={s.active} onCheckedChange={v => toggleActive.mutate({ id: s.id, active: v })} /></TableCell>
              <TableCell className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate(s.id)}><Trash2 className="h-3 w-3" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServicesManager;
