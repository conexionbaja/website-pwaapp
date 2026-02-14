import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Menu, X, Globe, Shield } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/badge.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const navLinks = [
    { to: '/', label: t.header.home },
    { to: '/servicios', label: t.header.services },
    { to: '/enviar', label: t.header.send },
    { to: '/rastreo', label: t.header.track },
    { to: '/blog', label: t.header.blog },
    { to: '/cotizar', label: t.header.quote },
    { to: '/contacto', label: t.header.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center gap-3">
            <img src={logo} alt="Conexión Baja" className="h-12 w-12 object-contain" />
            <span className="text-xl font-bold text-foreground">Conexión Baja</span>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className="text-muted-foreground hover:text-foreground transition-colors text-sm" activeClassName="text-primary">
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-muted-foreground hover:text-foreground">
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-xs font-semibold">{language.toUpperCase()}</span>
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/admin"><Shield className="h-4 w-4 mr-1" />{t.header.admin}</NavLink>
              </Button>
            )}
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut}>{t.header.logout}</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild><NavLink to="/login">{t.header.login}</NavLink></Button>
                <Button variant="hero" size="sm" asChild><NavLink to="/registro">{t.header.register}</NavLink></Button>
              </>
            )}
          </div>

          <button className="lg:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t border-border">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className="block text-muted-foreground hover:text-foreground transition-colors py-1" activeClassName="text-primary" onClick={() => setMobileMenuOpen(false)}>
                {label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="ghost" onClick={toggleLanguage} className="w-full justify-center">
                <Globe className="h-5 w-5 mr-2" />{language === 'es' ? 'English' : 'Español'}
              </Button>
              {isAdmin && (
                <Button variant="ghost" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <NavLink to="/admin"><Shield className="h-4 w-4 mr-1" />{t.header.admin}</NavLink>
                </Button>
              )}
              {user ? (
                <Button variant="ghost" className="w-full" onClick={() => { signOut(); setMobileMenuOpen(false); }}>{t.header.logout}</Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full"><NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>{t.header.login}</NavLink></Button>
                  <Button variant="hero" asChild className="w-full"><NavLink to="/registro" onClick={() => setMobileMenuOpen(false)}>{t.header.register}</NavLink></Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
