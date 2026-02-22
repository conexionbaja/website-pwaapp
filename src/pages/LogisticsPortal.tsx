import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { useState } from "react";
import { Truck, MapPin, Clock, ChevronDown, ChevronUp, Package, Users } from "lucide-react";
import { format } from "date-fns";

const SHIPMENT_STATUSES = [
  'created', 'assigned', 'picked_up', 'in_transit', 'passed_city',
  'out_for_delivery', 'delivered', 'delayed_mechanical',
  'delayed_weather', 'delayed_custom', 'on_time', 'cancelled',
];

const statusColors: Record<string, string> = {
  created: 'bg-muted text-muted-foreground', assigned: 'bg-purple-500/20 text-purple-400',
  picked_up: 'bg-indigo-500/20 text-indigo-400', in_transit: 'bg-blue-500/20 text-blue-400',
  passed_city: 'bg-cyan-500/20 text-cyan-400', out_for_delivery: 'bg-teal-500/20 text-teal-400',
  delivered: 'bg-green-500/20 text-green-400', delayed_mechanical: 'bg-orange-500/20 text-orange-400',
  delayed_weather: 'bg-amber-500/20 text-amber-400', delayed_custom: 'bg-yellow-500/20 text-yellow-400',
  on_time: 'bg-emerald-500/20 text-emerald-400', cancelled: 'bg-red-500/20 text-red-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
};

const availabilityColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-400', unavailable: 'bg-muted text-muted-foreground', on_route: 'bg-blue-500/20 text-blue-400',
};

const truckStatusColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-400', in_use: 'bg-blue-500/20 text-blue-400', maintenance: 'bg-orange-500/20 text-orange-400',
};

const LogisticsPortal = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const es = language === 'es';
  const queryClient = useQueryClient();
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);

  const { data: shipments = [] } = useQuery({
    queryKey: ["logistics-shipments"],
    queryFn: async () => { const { data, error } = await supabase.from("shipments").select("*, drivers(full_name), trucks(plate_number)").order("created_at", { ascending: false }); if (error) throw error; return data || []; },
  });

  const { data: trucks = [] } = useQuery({
    queryKey: ["logistics-trucks"],
    queryFn: async () => { const { data, error } = await supabase.from("trucks").select("*, drivers:assigned_driver_id(full_name)").order("plate_number"); if (error) throw error; return data || []; },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["logistics-drivers"],
    queryFn: async () => { const { data, error } = await supabase.from("drivers").select("*").order("full_name"); if (error) throw error; return data || []; },
  });

  const { data: statusLog = [] } = useQuery({
    queryKey: ["logistics-status-log", expandedShipment],
    queryFn: async () => { if (!expandedShipment) return []; const { data, error } = await supabase.from("shipment_status_log").select("*").eq("shipment_id", expandedShipment).order("created_at", { ascending: false }); if (error) throw error; return data || []; },
    enabled: !!expandedShipment,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, location, notes }: { id: string; status: string; location?: string; notes?: string }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (location !== undefined) updates.current_location = location;
      const { error } = await supabase.from("shipments").update(updates).eq("id", id);
      if (error) throw error;
      await supabase.from("shipment_status_log").insert({ shipment_id: id, status, changed_by: user!.id, location: location || null, notes: notes || null });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["logistics-shipments"] }); queryClient.invalidateQueries({ queryKey: ["logistics-status-log"] }); toast.success(es ? "Estado actualizado" : "Status updated"); },
    onError: () => toast.error(es ? "Error al actualizar estado" : "Failed to update status"),
  });

  const activeShipments = shipments.filter((s: any) => !["delivered", "cancelled"].includes(s.status));
  const completedShipments = shipments.filter((s: any) => ["delivered", "cancelled"].includes(s.status));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <h1 className="text-3xl font-bold text-foreground mb-6">{es ? "Portal de Operaciones" : "Operations Portal"}</h1>

        <Tabs defaultValue="shipments">
          <TabsList className="mb-6">
            <TabsTrigger value="shipments"><Package className="h-4 w-4 mr-2" />{es ? "Envíos" : "Shipments"} ({shipments.length})</TabsTrigger>
            <TabsTrigger value="trucks"><Truck className="h-4 w-4 mr-2" />{es ? "Camiones" : "Trucks"} ({trucks.length})</TabsTrigger>
            <TabsTrigger value="drivers"><Users className="h-4 w-4 mr-2" />{es ? "Choferes" : "Drivers"} ({drivers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="shipments">
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">{es ? "Activos" : "Active"} ({activeShipments.length})</TabsTrigger>
                <TabsTrigger value="completed">{es ? "Completados" : "Completed"} ({completedShipments.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <ShipmentsList shipments={activeShipments} expandedId={expandedShipment} onToggle={(id) => setExpandedShipment(expandedShipment === id ? null : id)} statusLog={statusLog} onUpdateStatus={(data) => updateStatusMutation.mutate(data)} isPending={updateStatusMutation.isPending} es={es} />
              </TabsContent>
              <TabsContent value="completed">
                <ShipmentsList shipments={completedShipments} expandedId={expandedShipment} onToggle={(id) => setExpandedShipment(expandedShipment === id ? null : id)} statusLog={statusLog} onUpdateStatus={(data) => updateStatusMutation.mutate(data)} isPending={updateStatusMutation.isPending} readOnly es={es} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="trucks">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{es ? "Placa" : "Plate"}</TableHead>
                    <TableHead>{es ? "Tipo" : "Type"}</TableHead>
                    <TableHead>{es ? "Modelo" : "Model"}</TableHead>
                    <TableHead>{es ? "Capacidad" : "Capacity"}</TableHead>
                    <TableHead>{es ? "Chofer Asignado" : "Assigned Driver"}</TableHead>
                    <TableHead>{es ? "Estado" : "Status"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trucks.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-foreground">{t.plate_number}</TableCell>
                      <TableCell className="text-muted-foreground">{t.vehicle_type}</TableCell>
                      <TableCell className="text-muted-foreground">{t.model || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{t.capacity_pallets ? `${t.capacity_pallets} ${es ? "tarimas" : "pallets"}` : "—"}{t.capacity_kg ? ` / ${t.capacity_kg}kg` : ""}</TableCell>
                      <TableCell className="text-muted-foreground">{t.drivers?.full_name || "—"}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${truckStatusColors[t.current_status] || 'bg-muted text-muted-foreground'}`}>{t.current_status}</span></TableCell>
                    </TableRow>
                  ))}
                  {trucks.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{es ? "No se encontraron camiones." : "No trucks found."}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="drivers">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{es ? "Nombre" : "Name"}</TableHead>
                    <TableHead>{es ? "Teléfono" : "Phone"}</TableHead>
                    <TableHead>{es ? "Licencia" : "License"}</TableHead>
                    <TableHead>{es ? "Estado" : "Status"}</TableHead>
                    <TableHead>{es ? "Activo" : "Active"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium text-foreground">{d.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{d.phone || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{d.license_number || "—"}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${availabilityColors[d.availability_status] || 'bg-muted text-muted-foreground'}`}>{d.availability_status}</span></TableCell>
                      <TableCell><Badge variant={d.active ? "default" : "secondary"}>{d.active ? (es ? "Sí" : "Yes") : "No"}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {drivers.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{es ? "No se encontraron choferes." : "No drivers found."}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

interface ShipmentsListProps {
  shipments: any[]; expandedId: string | null; onToggle: (id: string) => void; statusLog: any[];
  onUpdateStatus: (data: { id: string; status: string; location?: string; notes?: string }) => void;
  isPending: boolean; readOnly?: boolean; es: boolean;
}

const ShipmentsList = ({ shipments, expandedId, onToggle, statusLog, onUpdateStatus, isPending, readOnly, es }: ShipmentsListProps) => {
  if (!shipments.length) return <p className="text-muted-foreground text-center py-8">{es ? "No se encontraron envíos." : "No shipments found."}</p>;
  return (
    <div className="space-y-3">
      {shipments.map((s: any) => (
        <ShipmentCard key={s.id} shipment={s} expanded={expandedId === s.id} onToggle={() => onToggle(s.id)} statusLog={expandedId === s.id ? statusLog : []} onUpdateStatus={onUpdateStatus} isPending={isPending} readOnly={readOnly} es={es} />
      ))}
    </div>
  );
};

interface ShipmentCardProps {
  shipment: any; expanded: boolean; onToggle: () => void; statusLog: any[];
  onUpdateStatus: (data: { id: string; status: string; location?: string; notes?: string }) => void;
  isPending: boolean; readOnly?: boolean; es: boolean;
}

const ShipmentCard = ({ shipment, expanded, onToggle, statusLog, onUpdateStatus, isPending, readOnly, es }: ShipmentCardProps) => {
  const [newStatus, setNewStatus] = useState(shipment.status);
  const [location, setLocation] = useState(shipment.current_location || "");
  const [notes, setNotes] = useState("");

  const handleSave = () => { onUpdateStatus({ id: shipment.id, status: newStatus, location, notes: notes || undefined }); setNotes(""); };

  return (
    <Card>
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <Truck className="h-5 w-5 text-primary shrink-0" />
          <span className="font-mono font-semibold text-foreground">{shipment.tracking_number}</span>
          <span className={`px-2 py-1 rounded text-xs ${statusColors[shipment.status] || ''}`}>{shipment.status.replace(/_/g, " ")}</span>
          <span className="text-sm text-muted-foreground">{shipment.origin} → {shipment.destination}</span>
          {shipment.drivers?.full_name && <span className="text-sm text-muted-foreground">🚗 {shipment.drivers.full_name}</span>}
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <CardContent className="border-t border-border pt-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{es ? "Ubicación:" : "Location:"}</span>
              <span className="text-foreground">{shipment.current_location || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ETA:</span>
              <span className="text-foreground">{shipment.estimated_delivery_at ? format(new Date(shipment.estimated_delivery_at), "MMM dd, yyyy") : "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{es ? "Camión:" : "Truck:"}</span>
              <span className="text-foreground">{shipment.trucks?.plate_number || "—"}</span>
            </div>
          </div>

          {!readOnly && (
            <div className="space-y-4 bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground">{es ? "Actualizar Estado" : "Update Status"}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{es ? "Estado" : "Status"}</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SHIPMENT_STATUSES.map(s => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{es ? "Ubicación" : "Location"}</label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder={es ? "Ej. Punto de control Ensenada" : "e.g. Ensenada checkpoint"} />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{es ? "Notas" : "Notes"}</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={es ? "Notas de actualización..." : "Status update notes..."} rows={2} />
              </div>
              <Button onClick={handleSave} disabled={isPending} variant="hero" size="sm">{es ? "Guardar Cambios" : "Save Changes"}</Button>
            </div>
          )}

          {statusLog.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">{es ? "Historial de Estado" : "Status History"}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {statusLog.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${statusColors[log.status]?.split(' ')[0] || 'bg-muted'}`} />
                    <div>
                      <span className="font-medium text-foreground">{log.status.replace(/_/g, " ")}</span>
                      {log.location && <span className="text-muted-foreground"> — {log.location}</span>}
                      <p className="text-xs text-muted-foreground">{format(new Date(log.created_at), "MMM dd, yyyy HH:mm")}</p>
                      {log.notes && <p className="text-xs text-muted-foreground italic">{log.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default LogisticsPortal;
