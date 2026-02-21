import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Enviar from "./pages/Enviar";
import Rastreo from "./pages/Rastreo";
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Cotizar from "./pages/Cotizar";
import Contacto from "./pages/Contacto";
import Admin from "./pages/Admin";
import Portal from "./pages/Portal";
import AdminRoute, { RoleRoute } from "./components/AdminRoute";
import WhatsAppButton from "./components/WhatsAppButton";
import NotFound from "./pages/NotFound";
import DriverPortal from "./pages/DriverPortal";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/enviar" element={<Enviar />} />
          <Route path="/rastreo" element={<Rastreo />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/cotizar" element={<Cotizar />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
          <Route path="/driver" element={<RoleRoute allowedRoles={['driver']}><DriverPortal /></RoleRoute>} />
          <Route path="/executive" element={<RoleRoute allowedRoles={['executive']}><ExecutiveDashboard /></RoleRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
