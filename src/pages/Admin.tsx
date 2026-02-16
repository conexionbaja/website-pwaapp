import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Newspaper, MessageSquare, Mail, Users, LogOut, Wrench, UserCheck, Truck, Package, Receipt } from 'lucide-react';
import PagesEditor from '@/pages/admin/PagesEditor';
import BlogEditor from '@/pages/admin/BlogEditor';
import QuoteRequests from '@/pages/admin/QuoteRequests';
import NewsletterComposer from '@/pages/admin/NewsletterComposer';
import Subscribers from '@/pages/admin/Subscribers';
import ServicesManager from '@/pages/admin/ServicesManager';
import DriversManager from '@/pages/admin/DriversManager';
import TrucksManager from '@/pages/admin/TrucksManager';
import ShipmentsManager from '@/pages/admin/ShipmentsManager';
import InvoicesManager from '@/pages/admin/InvoicesManager';

const tabs = [
  { key: 'pages', label: 'Pages', icon: FileText },
  { key: 'blog', label: 'Blog/News', icon: Newspaper },
  { key: 'services', label: 'Services', icon: Wrench },
  { key: 'quotes', label: 'Quote Requests', icon: MessageSquare },
  { key: 'shipments', label: 'Shipments', icon: Package },
  { key: 'drivers', label: 'Drivers', icon: UserCheck },
  { key: 'trucks', label: 'Trucks', icon: Truck },
  { key: 'invoices', label: 'Invoices', icon: Receipt },
  { key: 'newsletter', label: 'Newsletter', icon: Mail },
  { key: 'subscribers', label: 'Subscribers', icon: Users },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('pages');
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
        <h2 className="text-xl font-bold text-foreground mb-6">Admin CMS</h2>
        <nav className="flex-1 space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab(key)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </nav>
        <Button variant="ghost" className="justify-start text-destructive" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'pages' && <PagesEditor />}
        {activeTab === 'blog' && <BlogEditor />}
        {activeTab === 'services' && <ServicesManager />}
        {activeTab === 'quotes' && <QuoteRequests />}
        {activeTab === 'shipments' && <ShipmentsManager />}
        {activeTab === 'drivers' && <DriversManager />}
        {activeTab === 'trucks' && <TrucksManager />}
        {activeTab === 'invoices' && <InvoicesManager />}
        {activeTab === 'newsletter' && <NewsletterComposer />}
        {activeTab === 'subscribers' && <Subscribers />}
      </main>
    </div>
  );
};

export default Admin;
