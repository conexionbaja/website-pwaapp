import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/badge.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center gap-3">
            <img src={logo} alt="Conexión Baja" className="h-12 w-12 object-contain" />
            <span className="text-xl font-bold text-foreground">Conexión Baja</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              {t.header.home}
            </NavLink>
            <NavLink
              to="/enviar"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              {t.header.send}
            </NavLink>
            <NavLink
              to="/rastreo"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              {t.header.track}
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-xs font-semibold">{language.toUpperCase()}</span>
            </Button>
            <Button variant="ghost" asChild>
              <NavLink to="/login">{t.header.login}</NavLink>
            </Button>
            <Button variant="hero" asChild>
              <NavLink to="/registro">{t.header.register}</NavLink>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <NavLink
              to="/"
              className="block text-muted-foreground hover:text-foreground transition-colors py-2"
              activeClassName="text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.header.home}
            </NavLink>
            <NavLink
              to="/enviar"
              className="block text-muted-foreground hover:text-foreground transition-colors py-2"
              activeClassName="text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.header.send}
            </NavLink>
            <NavLink
              to="/rastreo"
              className="block text-muted-foreground hover:text-foreground transition-colors py-2"
              activeClassName="text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.header.track}
            </NavLink>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="w-full justify-center"
              >
                <Globe className="h-5 w-5 mr-2" />
                {language === 'es' ? 'English' : 'Español'}
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <NavLink to="/login">{t.header.login}</NavLink>
              </Button>
              <Button variant="hero" asChild className="w-full">
                <NavLink to="/registro">{t.header.register}</NavLink>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
