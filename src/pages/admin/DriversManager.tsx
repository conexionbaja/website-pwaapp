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
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const availabilityStatuses = ['available', 'unavailable', 'on_route'];
const availabilityColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-400',
  unavailable: 'bg-red-500/20 text-red-400',
  on_route: 'bg-blue-500/20 text-blue-400',
};

interface DriverForm { full_name: string; phone: string; license_number: string; active: boolean; availability_status: string; user_id: string; }
const empty: DriverForm = { full_name: '', phone: '', license_number: '', active: true, availability_status: 'unavailable', user_id: '' };

const DriversManager = () => {
  const qc = useQueryClient();
  const { language } = useLanguage();
  const es = language === 'es';
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<DriverForm>(empty);

  const availabilityLabels: Record<string, string> = {
    available: es ? 'Disponible' : 'Available',
    unavailable: es ? 'No Disponible' : 'Unavailable',
    on_route: es ? 'En Ruta' : 'On Route',
  };

  const { data: drivers } = useQuery({
    queryKey: ['admin_drivers'],
    queryFn: async () => { const { data } = await supabase.from('drivers').select('*').order('full_name'); return data || []; },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload: any = {
        full_name: form.full_name, phone: form.phone || null, license_number: form.license_number || null,
        active: form.active, availability_status: form.availability_status, user_id: form.user_id || null,
      };
      if (editing) { const { error } = await supabase.from('drivers').update(payload).eq('id', editing); if (error) throw error; }
      else { const { error } = await supabase.from('drivers').insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_drivers'] }); toast.success(es ? 'Guardado' : 'Saved'); setOpen(false); setEditing(null); setForm(empty); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('drivers').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_drivers'] }); toast.success(es ? 'Eliminado' : 'Deleted'); },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => { const { error } = await supabase.from('drivers').update({ active }).eq('id', id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_drivers'] }),
  });

  const openEdit = (d: any) => {
    setEditing(d.id);
    setForm({ full_name: d.full_name, phone: d.phone || '', license_number: d.license_number || '', active: d.active, availability_status: d.availability_status || 'unavailable', user_id: d.user_id || '' });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{es ? 'Conductores' : 'Drivers'}</h1>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />{es ? 'Agregar Conductor' : 'Add Driver'}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? (es ? 'Editar Conductor' : 'Edit Driver') : (es ? 'Nuevo Conductor' : 'New Driver')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>{es ? 'Nombre Completo' : 'Full Name'}</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>{es ? 'Teléfono' : 'Phone'}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>{es ? 'Número de Licencia' : 'License Number'}</Label><Input value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} /></div>
              <div><Label>{es ? 'Estado de Disponibilidad' : 'Availability Status'}</Label>
                <Select value={form.availability_status} onValueChange={v => setForm({ ...form, availability_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{availabilityStatuses.map(s => <SelectItem key={s} value={s}>{availabilityLabels[s]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{es ? 'ID de Usuario (opcional)' : 'User ID (optional)'}</Label><Input value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} placeholder={es ? 'Vincular a UUID de usuario' : 'Link to auth user UUID'} /></div>
              <Button className="w-full" onClick={() => upsert.mutate()}>{editing ? (es ? 'Actualizar' : 'Update') : (es ? 'Crear' : 'Create')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{es ? 'Nombre' : 'Name'}</TableHead>
          <TableHead>{es ? 'Teléfono' : 'Phone'}</TableHead>
          <TableHead>{es ? 'Licencia' : 'License'}</TableHead>
          <TableHead>{es ? 'Disponibilidad' : 'Availability'}</TableHead>
          <TableHead>{es ? 'Activo' : 'Active'}</TableHead>
          <TableHead>{es ? 'Acciones' : 'Actions'}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {drivers?.map((d: any) => (
            <TableRow key={d.id}>
              <TableCell className="text-foreground font-medium">{d.full_name}</TableCell>
              <TableCell className="text-muted-foreground">{d.phone}</TableCell>
              <TableCell className="text-muted-foreground">{d.license_number}</TableCell>
              <TableCell><span className={`px-2 py-1 rounded text-xs ${availabilityColors[d.availability_status] || ''}`}>{availabilityLabels[d.availability_status] || d.availability_status?.replace(/_/g, ' ')}</span></TableCell>
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
