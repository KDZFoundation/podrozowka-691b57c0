import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface CountryCategory {
  id: string;
  name: string;
  nameLocal: string;
  flag: string;
  thankYou: string;
  sold: number;
  available: number;
}

const countries: CountryCategory[] = [
  { id: "china", name: "Chiny", nameLocal: "中国", flag: "🇨🇳", thankYou: "谢谢", sold: 342, available: 12 },
  { id: "italy", name: "Włochy", nameLocal: "Italia", flag: "🇮🇹", thankYou: "Grazie", sold: 287, available: 10 },
  { id: "thailand", name: "Tajlandia", nameLocal: "ประเทศไทย", flag: "🇹🇭", thankYou: "ขอบคุณ", sold: 198, available: 8 },
  { id: "germany", name: "Niemcy", nameLocal: "Deutschland", flag: "🇩🇪", thankYou: "Danke", sold: 256, available: 11 },
  { id: "france", name: "Francja", nameLocal: "France", flag: "🇫🇷", thankYou: "Merci", sold: 234, available: 9 },
  { id: "spain", name: "Hiszpania", nameLocal: "España", flag: "🇪🇸", thankYou: "Gracias", sold: 189, available: 8 },
  { id: "japan", name: "Japonia", nameLocal: "日本", flag: "🇯🇵", thankYou: "ありがとう", sold: 312, available: 10 },
  { id: "korea", name: "Korea Płd.", nameLocal: "한국", flag: "🇰🇷", thankYou: "감사합니다", sold: 167, available: 7 },
  { id: "usa", name: "USA", nameLocal: "United States", flag: "🇺🇸", thankYou: "Thank you", sold: 421, available: 14 },
  { id: "uk", name: "Wielka Brytania", nameLocal: "United Kingdom", flag: "🇬🇧", thankYou: "Thank you", sold: 298, available: 11 },
  { id: "portugal", name: "Portugalia", nameLocal: "Portugal", flag: "🇵🇹", thankYou: "Obrigado", sold: 134, available: 6 },
  { id: "netherlands", name: "Holandia", nameLocal: "Nederland", flag: "🇳🇱", thankYou: "Dank u", sold: 156, available: 7 },
  { id: "sweden", name: "Szwecja", nameLocal: "Sverige", flag: "🇸🇪", thankYou: "Tack", sold: 112, available: 5 },
  { id: "norway", name: "Norwegia", nameLocal: "Norge", flag: "🇳🇴", thankYou: "Takk", sold: 98, available: 5 },
  { id: "russia", name: "Rosja", nameLocal: "Россия", flag: "🇷🇺", thankYou: "Спасибо", sold: 145, available: 6 },
  { id: "arabic", name: "Arabski", nameLocal: "العربية", flag: "🇸🇦", thankYou: "شكراً", sold: 123, available: 5 },
];

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
};

const CountryCategories = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const totalSold = countries.reduce((acc, country) => acc + country.sold, 0);

  return (
    <section id="shop" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Sklep Podróżówka
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Wybierz język podziękowania
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Każda Podróżówka zawiera piękne zdjęcie Polski i napis "Dziękuję" lub "Pozdrowienia" 
            w wybranym języku. Idealna pamiątka dla osób, które spotkasz w podróży.
          </p>

          {/* Total counter */}
          <div className="inline-flex items-center gap-3 bg-accent/10 px-6 py-3 rounded-full">
            <TrendingUp className="w-5 h-5 text-accent" />
            <span className="text-foreground font-medium">
              Łącznie sprzedano: <span className="font-display font-bold text-accent"><AnimatedCounter value={totalSold} /></span> Podróżówek
            </span>
          </div>
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
          {countries.map((country, index) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredId(country.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative bg-card rounded-xl p-5 shadow-soft hover:shadow-card transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20"
            >
              {/* Flag and name */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{country.flag}</span>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
                  {country.available} wzorów
                </span>
              </div>

              <h3 className="font-display font-bold text-foreground text-lg mb-1">
                {country.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {country.nameLocal}
              </p>

              {/* Thank you in local language */}
              <div className="bg-secondary rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Dziękuję:</p>
                <p className="font-display text-lg text-foreground font-medium">
                  {country.thankYou}
                </p>
              </div>

              {/* Sales counter */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min((country.sold / 500) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    viewport={{ once: true }}
                  />
                </div>
                <span className="text-muted-foreground font-medium whitespace-nowrap">
                  {country.sold} sprzedanych
                </span>
              </div>

              {/* Hover overlay */}
              <div className={`absolute inset-0 bg-primary/5 rounded-xl transition-opacity duration-300 ${hoveredId === country.id ? "opacity-100" : "opacity-0"}`} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a 
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-soft hover:shadow-card"
          >
            Zamów pakiet Podróżówek
          </a>
          <p className="text-sm text-muted-foreground mt-3">
            Dostawa na całą Polskę • Pakiety od 10 sztuk
          </p>
        </div>
      </div>
    </section>
  );
};

export default CountryCategories;
