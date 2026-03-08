import { useState } from "react";
import { Menu, X, Globe, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import NotificationsBell from "@/components/NotificationsBell";

const languages = [
  { code: "pl", name: "Polski" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("pl");
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate("/auth");
    }
  };

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
            <a href="#distribution-map" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Mapa
            </a>
            <a href="#shop" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Sklep
            </a>
            <a href="#community-gallery" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Społeczność
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

            {/* Dashboard button for logged in users */}
            {!isLoading && user && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Mój Panel
              </Button>
            )}

            {/* Auth button */}
            {!isLoading && (
              <Button
                variant={user ? "ghost" : "default"}
                size="sm"
                className="hidden md:flex"
                onClick={handleAuthAction}
              >
                {user ? (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Zaloguj się
                  </>
                )}
              </Button>
            )}

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
              <a href="#about" className="text-foreground py-2 text-lg" onClick={() => setIsMenuOpen(false)}>O projekcie</a>
              <a href="#distribution-map" className="text-foreground py-2 text-lg" onClick={() => setIsMenuOpen(false)}>Mapa</a>
              <a href="#shop" className="text-foreground py-2 text-lg" onClick={() => setIsMenuOpen(false)}>Sklep</a>
              <a href="#community-gallery" className="text-foreground py-2 text-lg" onClick={() => setIsMenuOpen(false)}>Społeczność</a>
              
              {user && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Mój Panel
                </Button>
              )}
              
              <Button
                variant={user ? "ghost" : "default"}
                className="mt-2"
                onClick={() => {
                  handleAuthAction();
                  setIsMenuOpen(false);
                }}
              >
                {user ? (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Zaloguj się
                  </>
                )}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
