import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";

const Enviar = () => {
  const [formData, setFormData] = useState({
    tipoEnvio: "",
    peso: "",
    dimensiones: "",
    origen: "",
    destino: "",
    recoleccion: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement shipping with Supabase
    toast.success("Solicitud de envío recibida. Próximamente procesaremos tu pedido.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Enviar Paquete</CardTitle>
              <CardDescription className="text-muted-foreground">
                Completa los detalles de tu envío
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoEnvio" className="text-foreground">Tipo de Envío</Label>
                  <Select 
                    value={formData.tipoEnvio} 
                    onValueChange={(value) => setFormData({...formData, tipoEnvio: value})}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paquete">Paquete</SelectItem>
                      <SelectItem value="sobre">Sobre</SelectItem>
                      <SelectItem value="caja">Caja Grande</SelectItem>
                      <SelectItem value="pallet">Pallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso" className="text-foreground">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      placeholder="5.5"
                      value={formData.peso}
                      onChange={(e) => setFormData({...formData, peso: e.target.value})}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensiones" className="text-foreground">Dimensiones (cm)</Label>
                    <Input
                      id="dimensiones"
                      type="text"
                      placeholder="30x20x15"
                      value={formData.dimensiones}
                      onChange={(e) => setFormData({...formData, dimensiones: e.target.value})}
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origen" className="text-foreground">Dirección de Origen</Label>
                  <Input
                    id="origen"
                    type="text"
                    placeholder="Calle, Ciudad, Estado"
                    value={formData.origen}
                    onChange={(e) => setFormData({...formData, origen: e.target.value})}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destino" className="text-foreground">Dirección de Destino</Label>
                  <Input
                    id="destino"
                    type="text"
                    placeholder="Calle, Ciudad, Estado"
                    value={formData.destino}
                    onChange={(e) => setFormData({...formData, destino: e.target.value})}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="recoleccion"
                    checked={formData.recoleccion}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, recoleccion: checked as boolean})
                    }
                  />
                  <Label 
                    htmlFor="recoleccion" 
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Solicitar recolección a domicilio (+$50 MXN)
                  </Label>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Costo estimado:</p>
                  <p className="text-2xl font-bold text-primary">$250 MXN</p>
                </div>

                <Button type="submit" className="w-full" variant="hero">
                  Continuar al Pago
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
