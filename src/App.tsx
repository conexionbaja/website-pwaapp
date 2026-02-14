import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminRoute from "./components/AdminRoute";
import WhatsAppButton from "./components/WhatsAppButton";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
