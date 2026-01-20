import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "pl", name: "Polski" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("pl");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="font-display text-xl md:text-2xl font-semibold text-foreground">
              Podróżówka
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              O projekcie
            </a>
            <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Mapa
            </a>
            <a href="#shop" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Sklep
            </a>
            <a href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Galeria
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <select 
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Button variant="default" className="hidden md:flex">
              Kup Podróżówkę
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#about" className="text-foreground py-2 text-lg">O projekcie</a>
              <a href="#map" className="text-foreground py-2 text-lg">Mapa</a>
              <a href="#shop" className="text-foreground py-2 text-lg">Sklep</a>
              <a href="#gallery" className="text-foreground py-2 text-lg">Galeria</a>
              <Button variant="default" className="mt-2">Kup Podróżówkę</Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
