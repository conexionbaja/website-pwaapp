import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Package, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Rastreo = () => {
  const { t } = useLanguage();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber) {
      setShowResults(true);
      toast.success("Mostrando información de rastreo");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">{t.track.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t.track.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking" className="text-foreground">{t.track.trackingNumber}</Label>
                  <Input
                    id="tracking"
                    type="text"
                    placeholder={t.track.placeholder}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <Button type="submit" className="w-full" variant="hero">
                  {t.track.button}
                </Button>
              </form>

              {showResults && (
                <div className="mt-8 space-y-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">{t.track.status.transit}:</p>
                    <p className="text-lg font-semibold text-primary">{t.track.status.transit}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="w-0.5 h-full bg-primary/30 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <p className="font-semibold text-foreground">{t.track.status.pickup}</p>
                        <p className="text-sm text-muted-foreground">Tijuana, BC - 10:30 AM</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="w-0.5 h-full bg-primary/30 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <p className="font-semibold text-foreground">{t.track.status.transit}</p>
                        <p className="text-sm text-muted-foreground">Ensenada, BC - 2:15 PM</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary/40 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-foreground" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t.track.status.transit}</p>
                        <p className="text-sm text-muted-foreground">Los Cabos, BCS</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Rastreo;
