import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Package, DollarSign, Truck, FileQuestion, Clock, MapPin, User } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(45 93% 47%)',
  confirmed: 'hsl(210 80% 55%)',
  picked_up: 'hsl(280 60% 55%)',
  in_transit: 'hsl(200 80% 50%)',
  passed_city: 'hsl(170 60% 45%)',
  out_for_delivery: 'hsl(30 90% 55%)',
  delivered: 'hsl(142 71% 45%)',
  cancelled: 'hsl(0 84% 60%)',
  delayed_mechanical: 'hsl(0 60% 50%)',
  delayed_weather: 'hsl(220 50% 60%)',
  delayed_custom: 'hsl(330 50% 50%)',
};

const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'Available',
  unavailable: 'Unavailable',
  on_route: 'On Route',
};

interface KPIs {
  activeShipments: number;
  monthlyRevenue: number;
  fleetUtilization: number;
  pendingQuotes: number;
}

interface RevenueMonth {
  month: string;
  revenue: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface ActivityEntry {
  id: string;
  created_at: string;
  status: string;
  location: string | null;
  notes: string | null;
  tracking_number: string;
}

interface DriverCount {
  status: string;
  count: number;
}

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue (MXN)', color: 'hsl(var(--primary))' },
};

const Reports = () => {
  const [kpis, setKpis] = useState<KPIs>({ activeShipments: 0, monthlyRevenue: 0, fleetUtilization: 0, pendingQuotes: 0 });
  const [revenueData, setRevenueData] = useState<RevenueMonth[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [driverSummary, setDriverSummary] = useState<DriverCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchKPIs(), fetchRevenue(), fetchStatusBreakdown(), fetchActivity(), fetchDriverSummary()]);
    setLoading(false);
  };

  const fetchKPIs = async () => {
    const [shipmentsRes, invoicesRes, trucksRes, quotesRes] = await Promise.all([
      supabase.from('shipments').select('status'),
      supabase.from('invoices').select('amount, status, created_at'),
      supabase.from('trucks').select('current_status, active'),
      supabase.from('quote_requests').select('status'),
    ]);

    const shipments = shipmentsRes.data ?? [];
    const invoices = invoicesRes.data ?? [];
    const trucks = trucksRes.data ?? [];
    const quotes = quotesRes.data ?? [];

    const activeShipments = shipments.filter(s => !['delivered', 'cancelled'].includes(s.status)).length;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthlyRevenue = invoices
      .filter(i => i.status === 'paid' && new Date(i.created_at) >= monthStart && new Date(i.created_at) <= monthEnd)
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const activeTrucks = trucks.filter(t => t.active);
    const inTransit = activeTrucks.filter(t => t.current_status === 'in_transit').length;
    const fleetUtilization = activeTrucks.length > 0 ? Math.round((inTransit / activeTrucks.length) * 100) : 0;

    const pendingQuotes = quotes.filter(q => q.status === 'pending').length;

    setKpis({ activeShipments, monthlyRevenue, fleetUtilization, pendingQuotes });
  };

  const fetchRevenue = async () => {
    const { data } = await supabase.from('invoices').select('amount, created_at, status');
    if (!data) return;

    const months: RevenueMonth[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const ms = startOfMonth(d);
      const me = endOfMonth(d);
      const total = data
        .filter(inv => inv.status === 'paid' && new Date(inv.created_at) >= ms && new Date(inv.created_at) <= me)
        .reduce((s, inv) => s + Number(inv.amount), 0);
      months.push({ month: format(d, 'MMM yyyy'), revenue: total });
    }
    setRevenueData(months);
  };

  const fetchStatusBreakdown = async () => {
    const { data } = await supabase.from('shipments').select('status');
    if (!data) return;
    const counts: Record<string, number> = {};
    data.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
    setStatusData(Object.entries(counts).map(([status, count]) => ({ status, count })));
  };

  const fetchActivity = async () => {
    const { data: logs } = await supabase
      .from('shipment_status_log')
      .select('id, created_at, status, location, notes, shipment_id')
      .order('created_at', { ascending: false })
      .limit(10);
    if (!logs?.length) return;

    const shipmentIds = [...new Set(logs.map(l => l.shipment_id))];
    const { data: shipments } = await supabase
      .from('shipments')
      .select('id, tracking_number')
      .in('id', shipmentIds);

    const trackingMap = new Map(shipments?.map(s => [s.id, s.tracking_number]) ?? []);
    setActivity(logs.map(l => ({
      id: l.id,
      created_at: l.created_at,
      status: l.status,
      location: l.location,
      notes: l.notes,
      tracking_number: trackingMap.get(l.shipment_id) ?? 'Unknown',
    })));
  };

  const fetchDriverSummary = async () => {
    const { data } = await supabase.from('drivers').select('availability_status').eq('active', true);
    if (!data) return;
    const counts: Record<string, number> = {};
    data.forEach(d => { counts[d.availability_status] = (counts[d.availability_status] || 0) + 1; });
    setDriverSummary(Object.entries(counts).map(([status, count]) => ({ status, count })));
  };

  const pieChartConfig: ChartConfig = statusData.reduce((acc, item) => {
    acc[item.status] = { label: item.status.replace(/_/g, ' '), color: STATUS_COLORS[item.status] || 'hsl(var(--muted))' };
    return acc;
  }, {} as ChartConfig);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Shipments</p>
                <p className="text-3xl font-bold text-foreground">{kpis.activeShipments}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (Month)</p>
                <p className="text-3xl font-bold text-foreground">${kpis.monthlyRevenue.toLocaleString()} MXN</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fleet Utilization</p>
                <p className="text-3xl font-bold text-foreground">{kpis.fleetUtilization}%</p>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Quotes</p>
                <p className="text-3xl font-bold text-foreground">{kpis.pendingQuotes}</p>
              </div>
              <FileQuestion className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
              <BarChart data={revenueData}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Shipment Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Shipment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status.replace(/_/g, ' ')} (${count})`}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || 'hsl(var(--muted))'} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 text-sm border-b border-border pb-3 last:border-0">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-medium text-foreground">{entry.tracking_number}</span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{ backgroundColor: STATUS_COLORS[entry.status] || 'hsl(var(--muted))', color: 'white' }}>
                          {entry.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {entry.location && (
                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {entry.location}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1">{format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Availability Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Driver Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {driverSummary.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active drivers.</p>
            ) : (
              <div className="space-y-3">
                {driverSummary.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium capitalize">{AVAILABILITY_LABELS[status] || status}</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
