import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CountryCount {
  country: string;
  count: number;
}

// Country coordinates for Europe and beyond
const countryCoordinates: Record<string, { x: number; y: number; name: string }> = {
  "Polska": { x: 52, y: 35, name: "Polska" },
  "Niemcy": { x: 45, y: 38, name: "Niemcy" },
  "Francja": { x: 35, y: 45, name: "Francja" },
  "Włochy": { x: 48, y: 52, name: "Włochy" },
  "Hiszpania": { x: 28, y: 55, name: "Hiszpania" },
  "Wielka Brytania": { x: 32, y: 32, name: "Wielka Brytania" },
  "Ukraina": { x: 62, y: 38, name: "Ukraina" },
  "Czechy": { x: 50, y: 42, name: "Czechy" },
  "Węgry": { x: 54, y: 45, name: "Węgry" },
  "Chorwacja": { x: 51, y: 50, name: "Chorwacja" },
  "Grecja": { x: 56, y: 58, name: "Grecja" },
  "Norwegia": { x: 45, y: 22, name: "Norwegia" },
  "Turcja": { x: 68, y: 55, name: "Turcja" },
  "USA": { x: 15, y: 40, name: "USA" },
  "Chiny": { x: 82, y: 42, name: "Chiny" },
  "Indie": { x: 78, y: 55, name: "Indie" },
  "Tajlandia": { x: 85, y: 58, name: "Tajlandia" },
};

const DistributionMap = () => {
  const [countryData, setCountryData] = useState<CountryCount[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDistribution = async () => {
      const { data, error } = await supabase
        .from('postcards')
        .select('given_to_country')
        .eq('status', 'delivered')
        .not('given_to_country', 'is', null);

      if (!error && data) {
        // Count postcards per country
        const countMap: Record<string, number> = {};
        data.forEach((item) => {
          const country = item.given_to_country;
          if (country) {
            countMap[country] = (countMap[country] || 0) + 1;
          }
        });

        const countryArray = Object.entries(countMap).map(([country, count]) => ({
          country,
          count,
        }));

        setCountryData(countryArray);
      }
      setIsLoading(false);
    };

    fetchDistribution();
  }, []);

  const totalDelivered = countryData.reduce((sum, c) => sum + c.count, 0);

  return (
    <section id="distribution-map" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Globalna dystrybucja
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Gdzie są nasze Podróżówki?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Śledź, do których krajów trafiły Podróżówki rozdane przez naszą społeczność.
          </p>
        </motion.div>

        {/* Interactive Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative bg-card rounded-2xl shadow-card p-6 md:p-10 overflow-hidden"
        >
          {/* World map SVG background */}
          <div className="relative aspect-[2/1] min-h-[300px] md:min-h-[400px]">
            {/* Simple world map outline */}
            <svg
              viewBox="0 0 100 60"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Simplified continent shapes */}
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Europe rough shape */}
              <path
                d="M 25 25 Q 35 20 50 22 L 60 28 Q 65 35 60 45 L 50 55 Q 40 52 30 48 L 25 40 Q 22 32 25 25"
                fill="url(#mapGradient)"
                stroke="hsl(var(--border))"
                strokeWidth="0.3"
              />
              
              {/* Asia rough shape */}
              <path
                d="M 60 20 Q 75 15 90 25 L 95 45 Q 90 55 80 58 L 70 55 Q 62 45 60 35 L 60 20"
                fill="url(#mapGradient)"
                stroke="hsl(var(--border))"
                strokeWidth="0.3"
              />
              
              {/* Americas rough shape */}
              <path
                d="M 5 25 Q 15 20 22 28 L 20 45 Q 18 55 12 58 L 8 50 Q 3 40 5 25"
                fill="url(#mapGradient)"
                stroke="hsl(var(--border))"
                strokeWidth="0.3"
              />
            </svg>

            {/* Country markers */}
            {countryData.map((country) => {
              const coords = countryCoordinates[country.country];
              if (!coords) return null;

              const size = Math.min(Math.max(country.count * 2, 8), 24);

              return (
                <motion.div
                  key={country.country}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.random() * 0.5 }}
                  viewport={{ once: true }}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => setHoveredCountry(country.country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <div
                    className="relative flex items-center justify-center bg-primary rounded-full shadow-elevated animate-pulse-soft"
                    style={{ width: size, height: size }}
                  >
                    {hoveredCountry === country.country && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full mb-2 bg-foreground text-background text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-elevated z-10"
                      >
                        <span className="font-semibold">{coords.name}</span>
                        <br />
                        <span className="text-primary-foreground/80">{country.count} Podróżówek</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Poland marker (always visible) */}
            <div
              className="absolute"
              style={{
                left: `${countryCoordinates["Polska"].x}%`,
                top: `${countryCoordinates["Polska"].y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                <div className="w-6 h-6 bg-primary rounded-full shadow-elevated flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap">
                  Polska
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-sm text-muted-foreground">Podróżówka dostarczona</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Polska - punkt startu</span>
            </div>
          </div>

          {/* Stats summary */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Łącznie <span className="font-bold text-foreground">{totalDelivered}</span> Podróżówek 
              dotarło do <span className="font-bold text-foreground">{countryData.length}</span> krajów
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DistributionMap;
