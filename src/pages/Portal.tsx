import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Package, Receipt, ChevronDown, ChevronUp, History, User, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  quoted: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-muted text-muted-foreground',
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
  loading: 'bg-orange-500/20 text-orange-400',
  paid: 'bg-green-500/20 text-green-400',
  paid_full: 'bg-green-500/20 text-green-400',
  paid_partial: 'bg-teal-500/20 text-teal-400',
  cod: 'bg-blue-500/20 text-blue-400',
  overdue: 'bg-orange-500/20 text-orange-400',
};

const Portal = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);

  const t = {
    title: language === 'es' ? 'Mi Portal' : 'My Portal',
    quotes: language === 'es' ? 'Mis Cotizaciones' : 'My Quotes',
    shipments: language === 'es' ? 'Mis Envíos' : 'My Shipments',
    invoices: language === 'es' ? 'Mis Facturas' : 'My Invoices',
    profile: language === 'es' ? 'Mi Perfil' : 'My Profile',
    noData: language === 'es' ? 'No hay registros aún' : 'No records yet',
    save: language === 'es' ? 'Guardar' : 'Save',
    saved: language === 'es' ? 'Guardado' : 'Saved',
    fullName: language === 'es' ? 'Nombre Completo' : 'Full Name',
    phone: language === 'es' ? 'Teléfono' : 'Phone',
    changePassword: language === 'es' ? 'Cambiar Contraseña' : 'Change Password',
    newPassword: language === 'es' ? 'Nueva Contraseña' : 'New Password',
    confirmPassword: language === 'es' ? 'Confirmar Contraseña' : 'Confirm Password',
    updatePassword: language === 'es' ? 'Actualizar Contraseña' : 'Update Password',
    passwordUpdated: language === 'es' ? 'Contraseña actualizada' : 'Password updated',
    passwordMismatch: language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match',
    newsletter: language === 'es' ? 'Suscrito al boletín' : 'Subscribed to newsletter',
  };

  // ---- Quotes ----
  const { data: quotes } = useQuery({
    queryKey: ['portal_quotes', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('quote_requests').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // ---- Shipments ----
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

  const { data: statusLogs } = useQuery({
    queryKey: ['portal_status_log', expandedShipment],
    queryFn: async () => {
      if (!expandedShipment) return [];
      const { data } = await supabase.from('shipment_status_log').select('*').eq('shipment_id', expandedShipment).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!expandedShipment,
  });

  // ---- Invoices ----
  const { data: invoices } = useQuery({
    queryKey: ['portal_invoices', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('invoices').select('*, shipments(tracking_number)').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // ---- Profile ----
  const { data: profile } = useQuery({
    queryKey: ['portal_profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '' });
  const [newsletterChecked, setNewsletterChecked] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({ full_name: profile.full_name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  // Newsletter check
  const { data: newsletterSub } = useQuery({
    queryKey: ['portal_newsletter', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('newsletter_subscribers').select('*').eq('email', user!.email!).maybeSingle();
      return data;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (newsletterSub) setNewsletterChecked(newsletterSub.active);
  }, [newsletterSub]);

  const profileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').upsert({
        user_id: user!.id,
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t.saved);
      queryClient.invalidateQueries({ queryKey: ['portal_profile'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handlePasswordChange = async () => {
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error(t.passwordMismatch);
      return;
    }
    if (passwordForm.password.length < 6) {
      toast.error(language === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password });
    if (error) { toast.error(error.message); return; }
    toast.success(t.passwordUpdated);
    setPasswordForm({ password: '', confirm: '' });
  };

  const handleNewsletterToggle = async (checked: boolean) => {
    setNewsletterChecked(checked);
    if (!user?.email) return;
    if (checked) {
      await supabase.from('newsletter_subscribers').upsert(
        { email: user.email, active: true, unsubscribed_at: null },
        { onConflict: 'email' }
      );
    } else {
      await supabase.from('newsletter_subscribers').update(
        { active: false, unsubscribed_at: new Date().toISOString() }
      ).eq('email', user.email);
    }
    queryClient.invalidateQueries({ queryKey: ['portal_newsletter'] });
  };

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
            <TabsTrigger value="profile" className="flex items-center gap-2"><User className="h-4 w-4" />{t.profile}</TabsTrigger>
          </TabsList>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            {quotes?.length === 0 ? <p className="text-muted-foreground">{t.noData}</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>{language === 'es' ? 'Origen' : 'Origin'}</TableHead><TableHead>{language === 'es' ? 'Destino' : 'Destination'}</TableHead><TableHead>Status</TableHead><TableHead>{language === 'es' ? 'Precio' : 'Price'}</TableHead><TableHead>{language === 'es' ? 'Fecha' : 'Date'}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {quotes?.map((q: any) => (
                    <TableRow key={q.id}>
                      <TableCell className="text-foreground">{q.origin}</TableCell>
                      <TableCell className="text-foreground">{q.destination}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[q.status] || ''}`}>{q.status}</span></TableCell>
                      <TableCell className="text-foreground">{q.quote_price ? `$${q.quote_price}` : '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(q.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Shipments Tab */}
          <TabsContent value="shipments">
            {shipments?.length === 0 ? <p className="text-muted-foreground">{t.noData}</p> : (
              <Table>
                <TableHeader><TableRow><TableHead></TableHead><TableHead>Tracking #</TableHead><TableHead>{language === 'es' ? 'Ruta' : 'Route'}</TableHead><TableHead>Status</TableHead><TableHead>ETA</TableHead><TableHead>{language === 'es' ? 'Conductor' : 'Driver'}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {shipments?.map((s: any) => (
                    <>
                      <TableRow key={s.id}>
                        <TableCell><Button size="sm" variant="ghost" onClick={() => setExpandedShipment(expandedShipment === s.id ? null : s.id)}>{expandedShipment === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button></TableCell>
                        <TableCell className="text-foreground font-mono text-sm">{s.tracking_number}</TableCell>
                        <TableCell className="text-muted-foreground">{s.origin} → {s.destination}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[s.status] || ''}`}>{s.status?.replace(/_/g, ' ')}</span></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{s.estimated_delivery_at ? new Date(s.estimated_delivery_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{s.drivers?.full_name || '—'}</TableCell>
                      </TableRow>
                      {expandedShipment === s.id && (
                        <TableRow key={`${s.id}-p`}>
                          <TableCell colSpan={6}>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                              {(s.current_location || s.delay_reason) && (
                                <div className="flex gap-4 text-sm">
                                  {s.current_location && <p className="text-muted-foreground">📍 {s.current_location}</p>}
                                  {s.delay_reason && <p className="text-orange-400">⚠️ {s.delay_reason}</p>}
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">{language === 'es' ? 'Tarimas' : 'Pallets'}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {pallets?.map((p: any) => (
                                    <div key={p.id} className="bg-primary/10 border border-primary/20 rounded p-2 text-xs">
                                      <p className="font-medium text-foreground">{p.description}</p>
                                      {p.destination_city && <p className="text-muted-foreground">→ {p.destination_city}</p>}
                                      {p.weight_kg && <p className="text-muted-foreground">{p.weight_kg} kg</p>}
                                    </div>
                                  ))}
                                  {(!pallets || pallets.length === 0) && <p className="text-muted-foreground text-sm">{t.noData}</p>}
                                </div>
                              </div>
                              {statusLogs && statusLogs.length > 0 && (
                                <div className="border-t border-border pt-3">
                                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><History className="h-4 w-4" />{language === 'es' ? 'Historial' : 'History'}</h4>
                                  <div className="space-y-2">
                                    {statusLogs.map((log: any) => (
                                      <div key={log.id} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                        <div>
                                          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[log.status] || ''}`}>{log.status?.replace(/_/g, ' ')}</span>
                                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                                          {log.location && <p className="text-xs text-muted-foreground">📍 {log.location}</p>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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
            )}
          </TabsContent>

          {/* Invoices Tab */}
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
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColors[inv.status] || ''}`}>{inv.status?.replace(/_/g, ' ')}</span></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{inv.pdf_url ? <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">PDF</a> : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="max-w-lg space-y-6">
              {/* Profile Info */}
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><User className="h-5 w-5" />{t.profile}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">{t.fullName}</Label>
                    <Input
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">{t.phone}</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={newsletterChecked}
                      onCheckedChange={(checked) => handleNewsletterToggle(checked as boolean)}
                    />
                    <Label htmlFor="newsletter" className="text-sm text-foreground cursor-pointer">{t.newsletter}</Label>
                  </div>
                  <Button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />{t.save}
                  </Button>
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Lock className="h-5 w-5" />{t.changePassword}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">{t.newPassword}</Label>
                    <Input
                      type="password"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">{t.confirmPassword}</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <Button onClick={handlePasswordChange} variant="outline" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />{t.updatePassword}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Portal;
