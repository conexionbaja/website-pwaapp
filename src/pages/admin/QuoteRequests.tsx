import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  quoted: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-muted text-muted-foreground',
};

const QuoteRequests = () => {
  const queryClient = useQueryClient();

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Quote Requests</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Origin → Dest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-foreground">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                <TableCell className="text-muted-foreground">{r.origin} → {r.destination}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[r.status]}`}>{r.status}</span></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-1">
                  {r.status !== 'quoted' && <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: r.id, status: 'quoted' })}>Quoted</Button>}
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
