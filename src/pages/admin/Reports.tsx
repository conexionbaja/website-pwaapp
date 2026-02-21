import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">Reports</h1>
      <p className="text-muted-foreground">Coming soon — analytics and reporting module.</p>
    </div>
  );
};

export default Reports;
