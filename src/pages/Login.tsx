import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication with Supabase
    toast.success("Función de inicio de sesión próximamente disponible");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">{t.login.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t.login.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">{t.login.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">{t.login.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <Button type="submit" className="w-full" variant="hero">
                  {t.login.button}
                </Button>
              </form>
              
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t.login.noAccount}{" "}
                  <NavLink to="/registro" className="text-primary hover:underline">
                    {t.login.register}
                  </NavLink>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
