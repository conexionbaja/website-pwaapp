import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download } from 'lucide-react';

const Subscribers = () => {
  const { language } = useLanguage();
  const es = language === 'es';

  const { data: subscribers } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const { data } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
      return data || [];
    },
  });

  const exportCSV = () => {
    if (!subscribers) return;
    const csv = 'Email,Subscribed At,Active\n' + subscribers.map(s => `${s.email},${s.subscribed_at},${s.active}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{es ? 'Suscriptores' : 'Subscribers'} ({subscribers?.length || 0})</h1>
        <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />{es ? 'Exportar CSV' : 'Export CSV'}</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>{es ? 'Suscrito' : 'Subscribed'}</TableHead>
            <TableHead>{es ? 'Activo' : 'Active'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers?.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="text-foreground">{s.email}</TableCell>
              <TableCell className="text-muted-foreground">{new Date(s.subscribed_at).toLocaleDateString()}</TableCell>
              <TableCell><span className={s.active ? 'text-primary' : 'text-destructive'}>{s.active ? (es ? 'Sí' : 'Yes') : 'No'}</span></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Subscribers;
