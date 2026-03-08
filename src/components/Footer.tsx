import { Heart, Instagram, Facebook, Mail } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold mb-4">Podróżówka</h3>
            <p className="text-primary-foreground/70 mb-4 max-w-md">
              Odwrócona pocztówka z Polski. Podziękuj osobom spotkanym w podróży 
              i pokaż im piękno naszego kraju.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="mailto:kontakt@podrozowka.pl" 
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Nawigacja</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">O projekcie</a></li>
              <li><a href="#map" className="hover:text-primary-foreground transition-colors">Mapa</a></li>
              <li><a href="#shop" className="hover:text-primary-foreground transition-colors">Sklep</a></li>
              <li><a href="#gallery" className="hover:text-primary-foreground transition-colors">Galeria</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>kontakt@podrozowka.pl</li>
              <li>Polska</li>
              <li className="pt-2">
                <a 
                  href="#contact" 
                  className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  Zamów Podróżówki
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2024 Podróżówka. Wszystkie prawa zastrzeżone.
          </p>
          <p className="flex items-center gap-1 text-primary-foreground/50 text-sm">
            Stworzone z <Heart className="w-4 h-4 text-primary" /> w Polsce
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
