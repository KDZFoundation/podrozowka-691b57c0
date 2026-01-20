import { motion } from "framer-motion";
import krakowImage from "@/assets/krakow-square.jpg";
import polishArtImage from "@/assets/polish-art.jpg";
import wroclawImage from "@/assets/wroclaw.jpg";
import heroImage from "@/assets/hero-poland.jpg";

interface Photo {
  id: string;
  src: string;
  alt: string;
  title: string;
  location: string;
  photographer: string;
  category: "landscape" | "architecture" | "art";
}

const photos: Photo[] = [
  {
    id: "1",
    src: heroImage,
    alt: "Krajobraz polskiej wsi z Tatrami",
    title: "Podhalańska wieś o zachodzie słońca",
    location: "Podhale, Małopolska",
    photographer: "Jan Kowalski",
    category: "landscape"
  },
  {
    id: "2",
    src: krakowImage,
    alt: "Rynek Główny w Krakowie",
    title: "Bazylika Mariacka nocą",
    location: "Kraków, Małopolska",
    photographer: "Anna Nowak",
    category: "architecture"
  },
  {
    id: "3",
    src: polishArtImage,
    alt: "Polska wycinanka ludowa",
    title: "Tradycyjna wycinanka łowicka",
    location: "Łowicz, Łódzkie",
    photographer: "Maria Wiśniewska",
    category: "art"
  },
  {
    id: "4",
    src: wroclawImage,
    alt: "Kolorowe kamienice we Wrocławiu",
    title: "Nadodrzańskie kamienice",
    location: "Wrocław, Dolnośląskie",
    photographer: "Piotr Zieliński",
    category: "architecture"
  }
];

const PhotoGallery = () => {
  return (
    <section id="gallery" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-gold/20 text-foreground rounded-full text-sm font-medium mb-4">
            Fotografie Polski
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Piękno naszego kraju
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Każda Podróżówka prezentuje wyjątkowe zdjęcie z Polski – krajobrazy, architekturę 
            i sztukę ludową uwiecznione przez utalentowanych polskich fotografów.
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative overflow-hidden rounded-2xl ${
                index === 0 ? "md:col-span-2 aspect-[2/1]" : "aspect-square"
              }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block px-2 py-1 bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground text-xs rounded-full mb-2">
                  {photo.category === "landscape" ? "Krajobraz" : 
                   photo.category === "architecture" ? "Architektura" : "Sztuka ludowa"}
                </span>
                <h3 className="font-display text-xl font-bold text-primary-foreground mb-1">
                  {photo.title}
                </h3>
                <p className="text-primary-foreground/80 text-sm mb-2">
                  {photo.location}
                </p>
                <p className="text-primary-foreground/60 text-xs">
                  Fot. {photo.photographer}
                </p>
              </div>

              {/* Category badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                  photo.category === "landscape" ? "bg-accent/80 text-accent-foreground" :
                  photo.category === "architecture" ? "bg-primary/80 text-primary-foreground" :
                  "bg-gold/80 text-foreground"
                }`}>
                  {photo.category === "landscape" ? "🏔️" : 
                   photo.category === "architecture" ? "🏛️" : "🎨"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Photographers note */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Wszystkie zdjęcia pochodzą od polskich fotografów. 
            <a href="#contact" className="text-primary hover:underline ml-1">
              Chcesz współpracować?
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
