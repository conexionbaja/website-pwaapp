import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Newspaper, MessageSquare, Mail, Users, LogOut, Wrench, UserCheck, Truck, Package, Receipt, BarChart3 } from 'lucide-react';
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
import Reports from '@/pages/admin/Reports';
import ContactMessages from '@/pages/admin/ContactMessages';
import { Inbox } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('pages');
  const { signOut } = useAuth();
  const { language } = useLanguage();
  const es = language === 'es';

  const tabs = [
    { key: 'pages', label: es ? 'Páginas' : 'Pages', icon: FileText },
    { key: 'blog', label: es ? 'Blog/Noticias' : 'Blog/News', icon: Newspaper },
    { key: 'services', label: es ? 'Servicios' : 'Services', icon: Wrench },
    { key: 'quotes', label: es ? 'Cotizaciones' : 'Quote Requests', icon: MessageSquare },
    { key: 'contacts', label: es ? 'Mensajes' : 'Contact Messages', icon: Inbox },
    { key: 'shipments', label: es ? 'Envíos' : 'Shipments', icon: Package },
    { key: 'drivers', label: es ? 'Choferes' : 'Drivers', icon: UserCheck },
    { key: 'trucks', label: es ? 'Camiones' : 'Trucks', icon: Truck },
    { key: 'invoices', label: es ? 'Facturas' : 'Invoices', icon: Receipt },
    { key: 'reports', label: es ? 'Reportes' : 'Reports', icon: BarChart3 },
    { key: 'newsletter', label: es ? 'Boletín' : 'Newsletter', icon: Mail },
    { key: 'subscribers', label: es ? 'Suscriptores' : 'Subscribers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
        <h2 className="text-xl font-bold text-foreground mb-6">{es ? 'Admin CMS' : 'Admin CMS'}</h2>
        <nav className="flex-1 space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <Button key={key} variant={activeTab === key ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab(key)}>
              <Icon className="h-4 w-4 mr-2" />{label}
            </Button>
          ))}
        </nav>
        <Button variant="ghost" className="justify-start text-destructive" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />{es ? 'Cerrar Sesión' : 'Sign Out'}
        </Button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'pages' && <PagesEditor />}
        {activeTab === 'blog' && <BlogEditor />}
        {activeTab === 'services' && <ServicesManager />}
        {activeTab === 'quotes' && <QuoteRequests />}
        {activeTab === 'contacts' && <ContactMessages />}
        {activeTab === 'shipments' && <ShipmentsManager />}
        {activeTab === 'drivers' && <DriversManager />}
        {activeTab === 'trucks' && <TrucksManager />}
        {activeTab === 'invoices' && <InvoicesManager />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'newsletter' && <NewsletterComposer />}
        {activeTab === 'subscribers' && <Subscribers />}
      </main>
    </div>
  );
};

export default Admin;
