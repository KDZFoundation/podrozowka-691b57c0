import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Heart, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DeliveredPostcard {
  id: string;
  tracking_code: string;
  given_to_name: string | null;
  given_to_country: string | null;
  given_at: string | null;
  photo_url: string | null;
  message: string | null;
  language: string;
  owner_display_name: string | null;
}

const CommunityGallery = () => {
  const [postcards, setPostcards] = useState<DeliveredPostcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      // Fetch delivered postcards with owner profile info
      const { data: postcardsData, error: postcardsError } = await supabase
        .from('postcards')
        .select('id, tracking_code, given_to_name, given_to_country, given_at, photo_url, message, language, owner_id')
        .eq('status', 'delivered')
        .not('photo_url', 'is', null)
        .order('given_at', { ascending: false })
        .limit(12);

      if (!postcardsError && postcardsData) {
        // Fetch owner profiles
        const ownerIds = [...new Set(postcardsData.map(p => p.owner_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', ownerIds);

        const profileMap = new Map(profilesData?.map(p => [p.user_id, p.display_name]) || []);

        const enrichedPostcards: DeliveredPostcard[] = postcardsData.map(p => ({
          id: p.id,
          tracking_code: p.tracking_code,
          given_to_name: p.given_to_name,
          given_to_country: p.given_to_country,
          given_at: p.given_at,
          photo_url: p.photo_url,
          message: p.message,
          language: p.language,
          owner_display_name: profileMap.get(p.owner_id) || null,
        }));

        setPostcards(enrichedPostcards);
      }
      setIsLoading(false);
    };

    fetchGallery();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <section id="community-gallery" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Ładowanie galerii...</div>
          </div>
        </div>
      </section>
    );
  }

  if (postcards.length === 0) {
    return (
      <section id="community-gallery" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
              Galeria Społeczności
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bądź pierwszym, który podzieli się zdjęciem!
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Po przekazaniu Podróżówki komuś w podróży, dodaj zdjęcie i podziel się swoją historią z całą społecznością.
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="#auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
              >
                <Heart className="w-5 h-5" />
                Dołącz do społeczności
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="community-gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Galeria Społeczności
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Podróżówki na świecie
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Zobacz zdjęcia Podróżówek przekazanych przez naszą społeczność ludziom na całym świecie.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {postcards.map((postcard, index) => (
            <motion.div
              key={postcard.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all"
            >
              {/* Photo */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={postcard.photo_url || '/placeholder.svg'}
                  alt={`Podróżówka w ${postcard.given_to_country}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                {/* Location */}
                {postcard.given_to_country && (
                  <div className="flex items-center gap-2 text-sm text-accent mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{postcard.given_to_country}</span>
                    {postcard.given_to_name && (
                      <span className="text-muted-foreground">• dla {postcard.given_to_name}</span>
                    )}
                  </div>
                )}

                {/* Message preview */}
                {postcard.message && (
                  <p className="text-sm text-foreground line-clamp-2 mb-3">
                    "{postcard.message}"
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{postcard.owner_display_name || "Anonim"}</span>
                  </div>
                  {postcard.given_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(postcard.given_at)}</span>
                    </div>
                  )}
                </div>

                {/* Tracking code */}
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs font-mono text-muted-foreground">
                    {postcard.tracking_code}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityGallery;
