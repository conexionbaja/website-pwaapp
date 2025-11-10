import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Truck, MapPin, CheckCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo.jpeg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="Conexión Baja Logo" 
              className="w-64 h-auto object-contain animate-in fade-in duration-700"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Logística y Transporte
            <span className="block text-primary mt-2">de Tijuana a Los Cabos</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Conectamos tu negocio con envíos rápidos y seguros a través de toda Baja California.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Button variant="hero" size="lg" asChild>
              <NavLink to="/enviar">
                <Package className="mr-2" />
                Enviar Ahora
              </NavLink>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <NavLink to="/rastreo">
                <MapPin className="mr-2" />
                Rastrear Envío
              </NavLink>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            ¿Cómo Funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="p-6 bg-card border-border hover:border-primary transition-all hover:shadow-glow">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Regístrate</h3>
              <p className="text-muted-foreground">Crea tu cuenta en nuestra plataforma.</p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary transition-all hover:shadow-glow">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Ingresa Detalles</h3>
              <p className="text-muted-foreground">Proporciona información de tu paquete.</p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary transition-all hover:shadow-glow">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Solicita Recolección</h3>
              <p className="text-muted-foreground">Elige recolección a domicilio.</p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary transition-all hover:shadow-glow">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Rastrear</h3>
              <p className="text-muted-foreground">Monitorea tu paquete en tiempo real.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            ¿Por Qué Elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Envíos Rápidos</h3>
              <p className="text-muted-foreground">
                Entregas eficientes en toda la península de Baja California.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Rastreo en Tiempo Real</h3>
              <p className="text-muted-foreground">
                Monitorea tu paquete en cada etapa del viaje.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Servicio Confiable</h3>
              <p className="text-muted-foreground">
                Años de experiencia garantizando entregas seguras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            ¿Listo para Enviar?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Únete a miles de clientes satisfechos que confían en nosotros para sus envíos.
          </p>
          <Button variant="secondary" size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
            <NavLink to="/registro">
              Crear Cuenta Gratis
            </NavLink>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
