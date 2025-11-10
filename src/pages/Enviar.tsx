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
import { useLanguage } from "@/contexts/LanguageContext";

const Enviar = () => {
  const { t } = useLanguage();
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
              <CardTitle className="text-2xl text-foreground">{t.send.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t.send.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoEnvio" className="text-foreground">{t.send.packageType}</Label>
                  <Select 
                    value={formData.tipoEnvio} 
                    onValueChange={(value) => setFormData({...formData, tipoEnvio: value})}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso" className="text-foreground">{t.send.weight}</Label>
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
                    <Label htmlFor="dimensiones" className="text-foreground">{t.send.dimensions}</Label>
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
                  <Label htmlFor="origen" className="text-foreground">{t.send.origin}</Label>
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
                  <Label htmlFor="destino" className="text-foreground">{t.send.destination}</Label>
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
                    {t.send.pickup}
                  </Label>
                </div>

                <Button type="submit" className="w-full" variant="hero">
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
