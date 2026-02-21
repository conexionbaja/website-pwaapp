import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { Truck, MapPin, Clock, ChevronDown, ChevronUp, Package, User } from "lucide-react";
import { format } from "date-fns";

const DRIVER_STATUSES = [
  { value: "picked_up", label: "Picked Up", color: "bg-blue-500" },
  { value: "in_transit", label: "In Transit", color: "bg-indigo-500" },
  { value: "passed_city", label: "Passed City", color: "bg-cyan-500" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "bg-amber-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-500" },
  { value: "delayed_mechanical", label: "Delayed - Mechanical", color: "bg-red-500" },
  { value: "delayed_weather", label: "Delayed - Weather", color: "bg-orange-500" },
  { value: "delayed_custom", label: "Delayed - Custom", color: "bg-rose-500" },
];

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available", color: "bg-green-500 text-white" },
  { value: "unavailable", label: "Unavailable", color: "bg-muted text-muted-foreground" },
  { value: "on_route", label: "On Route", color: "bg-blue-500 text-white" },
];

const statusBadgeColor = (status: string) => {
  const found = DRIVER_STATUSES.find(s => s.value === status);
  return found ? found.color : "bg-muted";
};

const DriverPortal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);

  // Fetch driver record
  const { data: driver } = useQuery({
    queryKey: ["driver-record", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch assigned shipments
  const { data: shipments = [] } = useQuery({
    queryKey: ["driver-shipments", driver?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("driver_id", driver!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!driver?.id,
  });

  // Update availability
  const availabilityMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("drivers")
        .update({ availability_status: status })
        .eq("id", driver!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-record"] });
      toast.success("Availability updated");
    },
    onError: () => toast.error("Failed to update availability"),
  });

  // Update shipment status + log
  const updateShipmentMutation = useMutation({
    mutationFn: async ({ id, status, location, notes }: { id: string; status?: string; location?: string; notes?: string }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (location !== undefined) updates.current_location = location;
      if (notes !== undefined) updates.driver_notes = notes;

      const { error } = await supabase.from("shipments").update(updates).eq("id", id);
      if (error) throw error;

      if (status) {
        await supabase.from("shipment_status_log").insert({
          shipment_id: id,
          status,
          changed_by: user!.id,
          location: location || null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-shipments"] });
      toast.success("Shipment updated");
    },
    onError: () => toast.error("Failed to update shipment"),
  });

  const activeShipments = shipments.filter(s => !["delivered", "cancelled"].includes(s.status));
  const completedShipments = shipments.filter(s => ["delivered", "cancelled"].includes(s.status));

  if (!driver) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center">
          <p className="text-muted-foreground">No driver record linked to your account.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-28 pb-20">
        {/* Driver Header */}
        <Card className="mb-6">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{driver.full_name}</h2>
                <p className="text-sm text-muted-foreground">{driver.phone || "No phone"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Status:</span>
              {AVAILABILITY_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={driver.availability_status === opt.value ? "default" : "outline"}
                  className={driver.availability_status === opt.value ? opt.color : ""}
                  onClick={() => availabilityMutation.mutate(opt.value)}
                  disabled={availabilityMutation.isPending}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipments */}
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active ({activeShipments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedShipments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ShipmentList
              shipments={activeShipments}
              expandedId={expandedShipment}
              onToggle={setExpandedShipment}
              onUpdate={updateShipmentMutation.mutate}
              isPending={updateShipmentMutation.isPending}
              userId={user!.id}
            />
          </TabsContent>
          <TabsContent value="completed">
            <ShipmentList
              shipments={completedShipments}
              expandedId={expandedShipment}
              onToggle={setExpandedShipment}
              onUpdate={updateShipmentMutation.mutate}
              isPending={updateShipmentMutation.isPending}
              userId={user!.id}
              readOnly
            />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

interface ShipmentListProps {
  shipments: any[];
  expandedId: string | null;
  onToggle: (id: string | null) => void;
  onUpdate: (data: { id: string; status?: string; location?: string; notes?: string }) => void;
  isPending: boolean;
  userId: string;
  readOnly?: boolean;
}

const ShipmentList = ({ shipments, expandedId, onToggle, onUpdate, isPending, userId, readOnly }: ShipmentListProps) => {
  if (!shipments.length) {
    return <p className="text-muted-foreground text-center py-8">No shipments found.</p>;
  }

  return (
    <div className="space-y-3">
      {shipments.map(s => (
        <ShipmentCard
          key={s.id}
          shipment={s}
          expanded={expandedId === s.id}
          onToggle={() => onToggle(expandedId === s.id ? null : s.id)}
          onUpdate={onUpdate}
          isPending={isPending}
          userId={userId}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};

interface ShipmentCardProps {
  shipment: any;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (data: { id: string; status?: string; location?: string; notes?: string }) => void;
  isPending: boolean;
  userId: string;
  readOnly?: boolean;
}

const ShipmentCard = ({ shipment, expanded, onToggle, onUpdate, isPending, userId, readOnly }: ShipmentCardProps) => {
  const [newStatus, setNewStatus] = useState(shipment.status);
  const [location, setLocation] = useState(shipment.current_location || "");
  const [notes, setNotes] = useState(shipment.driver_notes || "");

  // Pallets query
  const { data: pallets = [] } = useQuery({
    queryKey: ["driver-pallets", shipment.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipment_pallets")
        .select("*")
        .eq("shipment_id", shipment.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: expanded,
  });

  // Status log query
  const { data: statusLog = [] } = useQuery({
    queryKey: ["driver-status-log", shipment.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipment_status_log")
        .select("*")
        .eq("shipment_id", shipment.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: expanded,
  });

  const handleSave = () => {
    const updates: { id: string; status?: string; location?: string; notes?: string } = { id: shipment.id };
    if (newStatus !== shipment.status) updates.status = newStatus;
    updates.location = location;
    updates.notes = notes;
    onUpdate(updates);
  };

  return (
    <Card>
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <Truck className="h-5 w-5 text-primary shrink-0" />
          <span className="font-mono font-semibold text-foreground">{shipment.tracking_number}</span>
          <Badge className={`${statusBadgeColor(shipment.status)} text-white text-xs`}>{shipment.status.replace(/_/g, " ")}</Badge>
          <span className="text-sm text-muted-foreground">{shipment.origin} → {shipment.destination}</span>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <CardContent className="border-t border-border pt-4 space-y-6">
          {/* Info row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="text-foreground">{shipment.current_location || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ETA:</span>
              <span className="text-foreground">{shipment.estimated_delivery_at ? format(new Date(shipment.estimated_delivery_at), "MMM dd, yyyy") : "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Pallets:</span>
              <span className="text-foreground">{pallets.length}</span>
            </div>
          </div>

          {/* Update controls */}
          {!readOnly && (
            <div className="space-y-4 bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground">Update Shipment</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DRIVER_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Current Location</label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Ensenada checkpoint" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Driver Notes</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this shipment..." rows={2} />
              </div>
              <Button onClick={handleSave} disabled={isPending} variant="hero" size="sm">
                Save Changes
              </Button>
            </div>
          )}

          {/* Pallet list */}
          {pallets.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Load ({pallets.length} items)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pallets.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 text-sm">
                    <span className="font-mono text-muted-foreground">#{i + 1}</span>
                    <Badge variant="outline" className="text-xs">{p.load_type}</Badge>
                    <span className="text-foreground flex-1 truncate">{p.description || "—"}</span>
                    <span className="text-muted-foreground">{p.destination_city || ""}</span>
                    {p.weight_kg && <span className="text-muted-foreground">{p.weight_kg}kg</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status history */}
          {statusLog.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Status History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {statusLog.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${statusBadgeColor(log.status)}`} />
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

export default DriverPortal;
