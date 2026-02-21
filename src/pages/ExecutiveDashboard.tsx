import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reports from '@/pages/admin/Reports';

const ExecutiveDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <Reports />
      </div>
      <Footer />
    </div>
  );
};

export default ExecutiveDashboard;
