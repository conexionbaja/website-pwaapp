import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Clock, Loader2, MapPin, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = [
  'created', 'assigned', 'picked_up', 'in_transit', 'passed_city',
  'out_for_delivery', 'delivered',
];

const Rastreo = () => {
  const { t, language } = useLanguage();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<any>(null);
  const [pallets, setPallets] = useState<any[]>([]);
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const statusLabel: Record<string, string> = {
    created: language === 'es' ? 'Creado' : 'Created',
    assigned: language === 'es' ? 'Asignado' : 'Assigned',
    picked_up: language === 'es' ? 'Recogido' : 'Picked Up',
    in_transit: language === 'es' ? 'En Tránsito' : 'In Transit',
    passed_city: language === 'es' ? 'Pasó Ciudad' : 'Passed City',
    out_for_delivery: language === 'es' ? 'En Reparto' : 'Out for Delivery',
    delivered: language === 'es' ? 'Entregado' : 'Delivered',
    delayed_mechanical: language === 'es' ? 'Retraso Mecánico' : 'Delayed (Mechanical)',
    delayed_weather: language === 'es' ? 'Retraso Clima' : 'Delayed (Weather)',
    delayed_custom: language === 'es' ? 'Retraso Otro' : 'Delayed (Other)',
    on_time: language === 'es' ? 'A Tiempo' : 'On Time',
    cancelled: language === 'es' ? 'Cancelado' : 'Cancelled',
    // legacy
    pending: language === 'es' ? 'Pendiente' : 'Pending',
    loading: language === 'es' ? 'Cargando' : 'Loading',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) return;
    setSearching(true);
    setNotFound(false);
    setShipment(null);
    setPallets([]);
    setStatusLogs([]);

    const { data } = await supabase
      .from('shipments')
      .select('*, drivers(full_name)')
      .eq('tracking_number', trackingNumber.trim().toUpperCase())
      .maybeSingle();

    if (!data) {
      setNotFound(true);
      setSearching(false);
      toast.error(language === 'es' ? 'Envío no encontrado' : 'Shipment not found');
      return;
    }

    setShipment(data);

    const [palletRes, logRes] = await Promise.all([
      supabase.from('shipment_pallets').select('*').eq('shipment_id', data.id).order('position'),
      supabase.from('shipment_status_log').select('*').eq('shipment_id', data.id).order('created_at', { ascending: true }),
    ]);

    setPallets(palletRes.data || []);
    setStatusLogs(logRes.data || []);
    setSearching(false);
  };

  const currentStep = shipment ? statusSteps.indexOf(shipment.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">{t.track.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {language === 'es' ? 'Ingresa tu número de rastreo para ver el estado de tu envío' : 'Enter your tracking number to see your shipment status'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking" className="text-foreground">{t.track.trackingNumber}</Label>
                  <Input id="tracking" type="text" placeholder={t.track.placeholder} value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} required className="bg-background" />
                </div>
                <Button type="submit" className="w-full" variant="hero" disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t.track.button}
                </Button>
              </form>

              {notFound && (
                <div className="mt-6 text-center text-muted-foreground">
                  {language === 'es' ? 'No se encontró ningún envío con ese número.' : 'No shipment found with that number.'}
                </div>
              )}

              {shipment && (
                <div className="mt-8 space-y-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">{language === 'es' ? 'Estado actual' : 'Current status'}:</p>
                    <p className="text-lg font-semibold text-primary">{statusLabel[shipment.status] || shipment.status}</p>
                    <p className="text-sm text-muted-foreground mt-1">{shipment.origin} → {shipment.destination}</p>
                    {shipment.drivers?.full_name && <p className="text-xs text-muted-foreground mt-1">{language === 'es' ? 'Conductor' : 'Driver'}: {shipment.drivers.full_name}</p>}
                    {shipment.estimated_delivery_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ETA: {new Date(shipment.estimated_delivery_at).toLocaleDateString()}
                      </p>
                    )}
                    {shipment.current_location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{shipment.current_location}
                      </p>
                    )}
                    {shipment.delay_reason && (
                      <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />{shipment.delay_reason}
                      </p>
                    )}
                    {shipment.driver_notes && (
                      <p className="text-xs text-muted-foreground mt-1">📝 {shipment.driver_notes}</p>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    {statusSteps.map((step, i) => {
                      const done = i <= currentStep;
                      const logEntry = statusLogs.find(l => l.status === step);
                      return (
                        <div key={step} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-primary' : 'bg-muted'}`}>
                              {done ? <CheckCircle className="w-5 h-5 text-primary-foreground" /> : <Clock className="w-5 h-5 text-muted-foreground" />}
                            </div>
                            {i < statusSteps.length - 1 && <div className={`w-0.5 h-8 mt-2 ${done ? 'bg-primary/50' : 'bg-muted'}`}></div>}
                          </div>
                          <div className="pt-2">
                            <p className={`font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{statusLabel[step]}</p>
                            {logEntry && <p className="text-xs text-muted-foreground">{new Date(logEntry.created_at).toLocaleString()}</p>}
                            {logEntry?.location && <p className="text-xs text-muted-foreground">📍 {logEntry.location}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {pallets.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Package className="h-4 w-4" />{language === 'es' ? 'Contenido / Tarimas' : 'Contents / Pallets'}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {pallets.map((p: any) => (
                          <div key={p.id} className="bg-primary/10 border border-primary/20 rounded p-2 text-xs">
                            <p className="font-medium text-foreground">{p.description}</p>
                            {p.destination_city && <p className="text-muted-foreground">→ {p.destination_city}</p>}
                            {p.weight_kg && <p className="text-muted-foreground">{p.weight_kg} kg</p>}
                            {p.dimensions && <p className="text-muted-foreground">{p.dimensions}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Rastreo;
