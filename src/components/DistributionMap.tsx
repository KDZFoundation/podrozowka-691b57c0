import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Globe2 } from "lucide-react";
import L from "leaflet";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface CountryCount {
  country: string;
  count: number;
  lat: number;
  lng: number;
}

// Country coordinates
const countryCoordinates: Record<string, { lat: number; lng: number; name: string }> = {
  "Polska": { lat: 52.0693, lng: 19.4803, name: "Polska" },
  "Niemcy": { lat: 51.1657, lng: 10.4515, name: "Niemcy" },
  "Francja": { lat: 46.2276, lng: 2.2137, name: "Francja" },
  "Włochy": { lat: 41.8719, lng: 12.5674, name: "Włochy" },
  "Hiszpania": { lat: 40.4637, lng: -3.7492, name: "Hiszpania" },
  "Wielka Brytania": { lat: 55.3781, lng: -3.4360, name: "Wielka Brytania" },
  "Ukraina": { lat: 48.3794, lng: 31.1656, name: "Ukraina" },
  "Czechy": { lat: 49.8175, lng: 15.4730, name: "Czechy" },
  "Węgry": { lat: 47.1625, lng: 19.5033, name: "Węgry" },
  "Chorwacja": { lat: 45.1000, lng: 15.2000, name: "Chorwacja" },
  "Grecja": { lat: 39.0742, lng: 21.8243, name: "Grecja" },
  "Norwegia": { lat: 60.4720, lng: 8.4689, name: "Norwegia" },
  "Turcja": { lat: 38.9637, lng: 35.2433, name: "Turcja" },
  "USA": { lat: 37.0902, lng: -95.7129, name: "USA" },
  "Chiny": { lat: 35.8617, lng: 104.1954, name: "Chiny" },
  "Indie": { lat: 20.5937, lng: 78.9629, name: "Indie" },
  "Tajlandia": { lat: 15.8700, lng: 100.9925, name: "Tajlandia" },
  "Austria": { lat: 47.5162, lng: 14.5501, name: "Austria" },
  "Holandia": { lat: 52.1326, lng: 5.2913, name: "Holandia" },
  "Belgia": { lat: 50.5039, lng: 4.4699, name: "Belgia" },
  "Portugalia": { lat: 39.3999, lng: -8.2245, name: "Portugalia" },
  "Szwecja": { lat: 60.1282, lng: 18.6435, name: "Szwecja" },
  "Dania": { lat: 56.2639, lng: 9.5018, name: "Dania" },
  "Szwajcaria": { lat: 46.8182, lng: 8.2275, name: "Szwajcaria" },
  "Japonia": { lat: 36.2048, lng: 138.2529, name: "Japonia" },
  "Korea Południowa": { lat: 35.9078, lng: 127.7669, name: "Korea Południowa" },
  "Australia": { lat: -25.2744, lng: 133.7751, name: "Australia" },
  "Kanada": { lat: 56.1304, lng: -106.3468, name: "Kanada" },
  "Meksyk": { lat: 23.6345, lng: -102.5528, name: "Meksyk" },
  "Brazylia": { lat: -14.2350, lng: -51.9253, name: "Brazylia" },
  "Argentyna": { lat: -38.4161, lng: -63.6167, name: "Argentyna" },
};

// Custom red icon for Poland
const polandIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DistributionMap = () => {
  const [countryData, setCountryData] = useState<CountryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const leafletColors = useMemo(() => {
    // These are CSS variables defined in index.css (HSL channels)
    if (typeof window === "undefined") {
      return {
        primary: "hsl(0 72% 45%)",
        accent: "hsl(145 35% 32%)",
      };
    }
    const root = getComputedStyle(document.documentElement);
    const primaryHsl = root.getPropertyValue("--primary").trim();
    const accentHsl = root.getPropertyValue("--accent").trim();
    return {
      primary: primaryHsl ? `hsl(${primaryHsl})` : "hsl(0 72% 45%)",
      accent: accentHsl ? `hsl(${accentHsl})` : "hsl(145 35% 32%)",
    };
  }, []);

  useEffect(() => {
    const fetchDistribution = async () => {
      const { data, error } = await supabase
        .from("postcards")
        .select("given_to_country")
        .eq("status", "delivered")
        .not("given_to_country", "is", null);

      if (!error && data) {
        const countMap: Record<string, number> = {};
        data.forEach((item) => {
          const country = item.given_to_country;
          if (country) {
            countMap[country] = (countMap[country] || 0) + 1;
          }
        });

        const countryArray: CountryCount[] = Object.entries(countMap)
          .map(([country, count]) => {
            const coords = countryCoordinates[country];
            if (coords) {
              return {
                country,
                count,
                lat: coords.lat,
                lng: coords.lng,
              };
            }
            return null;
          })
          .filter((item): item is CountryCount => item !== null);

        setCountryData(countryArray);
      }
      setIsLoading(false);
    };

    fetchDistribution();
  }, []);

  // Init Leaflet map once (no react-leaflet to avoid React context consumer issues)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [52.0693, 19.4803],
      zoom: 3,
      zoomControl: true,
      scrollWheelZoom: true,
      worldCopyJump: false,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
      minZoom: 2,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layer = (L as any).markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      animate: true,
      animateAddingMarkers: true,
      spiderLegPolylineOptions: { weight: 2, color: 'hsl(0, 72%, 45%)', opacity: 0.6 },
      zoomToBoundsOnClick: true,
    }).addTo(map);

    // Tooltip on cluster hover
    layer.on("clustermouseover", (e: any) => {
      const cluster = e.layer;
      const count = cluster.getChildCount();
      const label = count === 1 ? "Podróżówka" : count < 5 ? "Podróżówki" : "Podróżówek";
      cluster.bindTooltip(`${count} ${label}`, {
        direction: "top",
        className: "cluster-tooltip",
        offset: [0, -10],
      }).openTooltip();
    });

    layer.on("clustermouseout", (e: any) => {
      e.layer.closeTooltip();
    });

    mapRef.current = map;
    markersLayerRef.current = layer;

    return () => {
      layer.clearLayers();
      map.remove();
      markersLayerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  // Render markers whenever data changes
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    // Poland origin marker
    L.marker([52.0693, 19.4803], { icon: polandIcon })
      .bindPopup(
        `<div style="text-align:center; padding:8px;">
            <div style="font-weight:700;">🇵🇱 Polska</div>
            <div style="font-size:12px;">Punkt startu wszystkich Podróżówek</div>
         </div>`,
      )
      .addTo(layer);

    // Delivered markers (circle size by count)
    countryData.forEach((c) => {
      const radius = Math.min(Math.max(c.count * 3, 8), 25);
      L.circleMarker([c.lat, c.lng], {
        radius,
        color: leafletColors.accent,
        fillColor: leafletColors.accent,
        fillOpacity: 0.7,
        weight: 2,
      })
        .bindPopup(
          `<div style="text-align:center; padding:8px;">
              <div style="font-weight:700;">${c.country}</div>
              <div style="font-size:12px;">
                <span style="font-weight:700; color:${leafletColors.accent};">${c.count}</span>
                ${c.count === 1 ? "Podróżówka" : "Podróżówek"}
              </div>
           </div>`,
        )
        .addTo(layer);
    });
  }, [countryData, leafletColors.accent]);

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
            Śledź na żywo, do których krajów trafiły Podróżówki rozdane przez naszą społeczność.
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-soft">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="text-foreground font-medium">
              {countryData.length} krajów
            </span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-soft">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">
              {totalDelivered} Podróżówek dostarczonych
            </span>
          </div>
        </div>

        {/* Leaflet Map (OpenStreetMap) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-card"
        >
          <div
            ref={mapContainerRef}
            className="h-[400px] md:h-[500px] w-full"
            aria-label="Mapa dystrybucji Podróżówek"
          />
        </motion.div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded-full" />
            <span className="text-muted-foreground">Polska - punkt startu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent rounded-full" />
            <span className="text-muted-foreground">Kraje z dostarczonymi Podróżówkami</span>
          </div>
        </div>

        {/* Empty state */}
        {!isLoading && countryData.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Brak jeszcze dostarczonych Podróżówek. Bądź pierwszy i zarejestruj swoją!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DistributionMap;
