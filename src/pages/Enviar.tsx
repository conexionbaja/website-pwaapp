import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";

const ROUTE_CITIES = [
  "Tijuana",
  "Ensenada",
  "San Quintin",
  "Guerrero Negro",
  "Mulege",
  "La Paz",
  "Cabo San Lucas",
];

const Enviar = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    tipoEnvio: "",
    peso: "",
    dimensiones: "",
    origen: "",
    destino: "",
    recoleccion: false,
    name: "",
    email: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const labels = {
    subtitle: language === "es" ? "Completa los datos de tu envío" : "Fill in your shipment details",
    name: language === "es" ? "Nombre" : "Name",
    email: language === "es" ? "Correo" : "Email",
    details: language === "es" ? "Detalles adicionales" : "Additional details",
    selectCity: language === "es" ? "Seleccionar ciudad" : "Select city",
    success: language === "es" ? "¡Solicitud de envío recibida!" : "Shipping request received!",
    portalMsg: language === "es"
      ? "Regístrate o inicia sesión para dar seguimiento a tu solicitud"
      : "Register or log in to track your request",
    login: language === "es" ? "Iniciar Sesión" : "Login",
    signup: language === "es" ? "Registrarse" : "Sign Up",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("quote_requests").insert({
      name: formData.name,
      email: formData.email,
      origin: formData.origen,
      destination: formData.destino,
      package_type: formData.tipoEnvio || null,
      weight: formData.peso || null,
      description: [
        formData.dimensiones ? `Dim: ${formData.dimensiones}` : "",
        formData.recoleccion ? (language === "es" ? "Recolección solicitada" : "Pickup requested") : "",
        formData.description,
      ]
        .filter(Boolean)
        .join(" | ") || null,
      user_id: user?.id || null,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Fire notification (non-blocking)
    supabase.functions.invoke('send-contact-notification', {
      body: { type: 'quote', name: formData.name, email: formData.email, message: `${formData.origen} → ${formData.destino}` },
    }).catch(() => {});
    toast.success(labels.success);
    if (user) {
      navigate("/portal");
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center">
          <Card className="max-w-md mx-auto bg-card border-border">
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg text-foreground">{labels.success}</p>
              <p className="text-muted-foreground">{labels.portalMsg}</p>
              <div className="flex gap-2 justify-center">
                <Link to="/login">
                  <Button variant="outline">{labels.login}</Button>
                </Link>
                <Link to="/registro">
                  <Button>{labels.signup}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">{t.send.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {labels.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email (auto-filled for logged-in users) */}
                {!user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">{labels.name}</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">{labels.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>
                )}

                {/* Package Type */}
                <div className="space-y-2">
                  <Label htmlFor="tipoEnvio" className="text-foreground">{t.send.packageType}</Label>
                  <Select
                    value={formData.tipoEnvio}
                    onValueChange={(value) => setFormData({ ...formData, tipoEnvio: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder={t.send.selectType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">{t.send.types.document}</SelectItem>
                      <SelectItem value="package">{t.send.types.package}</SelectItem>
                      <SelectItem value="grocery">{t.send.types.grocery}</SelectItem>
                      <SelectItem value="household">{t.send.types.household}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Weight & Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso" className="text-foreground">{t.send.weight}</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      placeholder="5.5"
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensiones" className="text-foreground">{t.send.dimensions}</Label>
                    <Input
                      id="dimensiones"
                      type="text"
                      placeholder="30x20x15"
                      value={formData.dimensiones}
                      onChange={(e) => setFormData({ ...formData, dimensiones: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>

                {/* Origin & Destination (city selects) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">{t.send.origin}</Label>
                    <Select
                      value={formData.origen}
                      onValueChange={(value) => setFormData({ ...formData, origen: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={labels.selectCity} />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUTE_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">{t.send.destination}</Label>
                    <Select
                      value={formData.destino}
                      onValueChange={(value) => setFormData({ ...formData, destino: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={labels.selectCity} />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUTE_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">{labels.details}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background"
                  />
                </div>

                {/* Pickup checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recoleccion"
                    checked={formData.recoleccion}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, recoleccion: checked as boolean })
                    }
                  />
                  <Label
                    htmlFor="recoleccion"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {t.send.pickup}
                  </Label>
                </div>

                <Button type="submit" className="w-full" variant="hero" disabled={loading}>
                  {t.send.button}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Enviar;
