import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Package, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  quoted: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-muted text-muted-foreground',
  loading: 'bg-orange-500/20 text-orange-400',
  in_transit: 'bg-blue-500/20 text-blue-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  paid: 'bg-green-500/20 text-green-400',
};

const Portal = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);

  const t = {
    title: language === 'es' ? 'Mi Portal' : 'My Portal',
    quotes: language === 'es' ? 'Mis Cotizaciones' : 'My Quotes',
    shipments: language === 'es' ? 'Mis Envíos' : 'My Shipments',
    invoices: language === 'es' ? 'Mis Facturas' : 'My Invoices',
    noData: language === 'es' ? 'No hay registros aún' : 'No records yet',
  };

  const { data: quotes } = useQuery({
    queryKey: ['portal_quotes', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('quote_requests').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: shipments } = useQuery({
    queryKey: ['portal_shipments', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('shipments').select('*, drivers(full_name)').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: pallets } = useQuery({
    queryKey: ['portal_pallets', expandedShipment],
    queryFn: async () => {
      if (!expandedShipment) return [];
      const { data } = await supabase.from('shipment_pallets').select('*').eq('shipment_id', expandedShipment).order('position');
      return data || [];
    },
    enabled: !!expandedShipment,
  });

  const { data: invoices } = useQuery({
    queryKey: ['portal_invoices', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('invoices').select('*, shipments(tracking_number)').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t.title}</h1>
        <Tabs defaultValue="quotes">
          <TabsList className="mb-6">
            <TabsTrigger value="quotes" className="flex items-center gap-2"><FileText className="h-4 w-4" />{t.quotes}</TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center gap-2"><Package className="h-4 w-4" />{t.shipments}</TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2"><Receipt className="h-4 w-4" />{t.invoices}</TabsTrigger>
          </TabsList>

          <TabsContent value="quotes">
            {quotes?.length === 0 ? <p className="text-muted-foreground">{t.noData}</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>{language === 'es' ? 'Origen' : 'Origin'}</TableHead><TableHead>{language === 'es' ? 'Destino' : 'Destination'}</TableHead><TableHead>Status</TableHead><TableHead>{language === 'es' ? 'Precio' : 'Price'}</TableHead><TableHead>{language === 'es' ? 'Fecha' : 'Date'}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {quotes?.map((q: any) => (
                    <TableRow key={q.id}>
                      <TableCell className="text-foreground">{q.origin}</TableCell>
                      <TableCell className="text-foreground">{q.destination}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[q.status]}`}>{q.status}</span></TableCell>
                      <TableCell className="text-foreground">{q.quote_price ? `$${q.quote_price}` : '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(q.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="shipments">
            {shipments?.length === 0 ? <p className="text-muted-foreground">{t.noData}</p> : (
              <Table>
                <TableHeader><TableRow><TableHead></TableHead><TableHead>Tracking #</TableHead><TableHead>{language === 'es' ? 'Ruta' : 'Route'}</TableHead><TableHead>Status</TableHead><TableHead>{language === 'es' ? 'Conductor' : 'Driver'}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {shipments?.map((s: any) => (
                    <>
                      <TableRow key={s.id}>
                        <TableCell><Button size="sm" variant="ghost" onClick={() => setExpandedShipment(expandedShipment === s.id ? null : s.id)}>{expandedShipment === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button></TableCell>
                        <TableCell className="text-foreground font-mono text-sm">{s.tracking_number}</TableCell>
                        <TableCell className="text-muted-foreground">{s.origin} → {s.destination}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[s.status]}`}>{s.status}</span></TableCell>
                        <TableCell className="text-muted-foreground">{s.drivers?.full_name || '—'}</TableCell>
                      </TableRow>
                      {expandedShipment === s.id && (
                        <TableRow key={`${s.id}-p`}>
                          <TableCell colSpan={5}>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold text-foreground mb-2">{language === 'es' ? 'Tarimas' : 'Pallets'}</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {pallets?.map((p: any) => (
                                  <div key={p.id} className="bg-primary/10 border border-primary/20 rounded p-2 text-xs">
                                    <p className="font-medium text-foreground">{p.description}</p>
                                    {p.weight_kg && <p className="text-muted-foreground">{p.weight_kg} kg</p>}
                                  </div>
                                ))}
                                {(!pallets || pallets.length === 0) && <p className="text-muted-foreground text-sm">{t.noData}</p>}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="invoices">
            {invoices?.length === 0 ? <p className="text-muted-foreground">{t.noData}</p> : (
              <Table>
                <TableHeader><TableRow><TableHead># Factura</TableHead><TableHead>{language === 'es' ? 'Envío' : 'Shipment'}</TableHead><TableHead>{language === 'es' ? 'Monto' : 'Amount'}</TableHead><TableHead>Status</TableHead><TableHead>{language === 'es' ? 'Fecha' : 'Date'}</TableHead><TableHead>PDF</TableHead></TableRow></TableHeader>
                <TableBody>
                  {invoices?.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-foreground font-mono text-sm">{inv.invoice_number}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.shipments?.tracking_number || '—'}</TableCell>
                      <TableCell className="text-foreground">${inv.amount} {inv.currency}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[inv.status]}`}>{inv.status}</span></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{inv.pdf_url ? <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">PDF</a> : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Portal;
