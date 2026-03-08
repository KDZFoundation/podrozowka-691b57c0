import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Heart, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RegisteredPostcard {
  id: string;
  buyer_display_name: string | null;
  recipient_name: string | null;
  recipient_message: string | null;
  registered_at: string | null;
  country_name: string | null;
  country_flag: string | null;
  design_view_name: string | null;
}

const CommunityGallery = () => {
  const [postcards, setPostcards] = useState<RegisteredPostcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('postcards')
        .select(`
          id, buyer_display_name, recipient_name, recipient_message, registered_at,
          designs!inner(view_name, countries!inner(name, flag))
        `)
        .eq('status', 'registered')
        .order('registered_at', { ascending: false })
        .limit(12);

      if (!error && data) {
        const enriched: RegisteredPostcard[] = data.map((p: any) => ({
          id: p.id,
          buyer_display_name: p.buyer_display_name,
          recipient_name: p.recipient_name,
          recipient_message: p.recipient_message,
          registered_at: p.registered_at,
          country_name: p.designs?.countries?.name || null,
          country_flag: p.designs?.countries?.flag || null,
          design_view_name: p.designs?.view_name || null,
        }));
        setPostcards(enriched);
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
              Bądź pierwszym, który zarejestruje kartkę!
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Po otrzymaniu Podróżówki zeskanuj QR kod i zarejestruj ją — Twoja kartka pojawi się tutaj.
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
            Zarejestrowane Podróżówki
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Zobacz kartki zarejestrowane przez obdarowanych z całego świata.
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
              className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all p-5"
            >
              {/* Country & Design */}
              <div className="flex items-center gap-2 text-sm text-accent mb-3">
                {postcard.country_flag && <span className="text-xl">{postcard.country_flag}</span>}
                <span className="font-medium">{postcard.country_name}</span>
              </div>

              {postcard.design_view_name && (
                <p className="text-xs text-muted-foreground mb-3">{postcard.design_view_name}</p>
              )}

              {/* Message */}
              {postcard.recipient_message && (
                <p className="text-sm text-foreground line-clamp-3 mb-3">
                  "{postcard.recipient_message}"
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Od: {postcard.buyer_display_name || "Podróżnik"}</span>
                </div>
                {postcard.registered_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(postcard.registered_at)}</span>
                  </div>
                )}
              </div>

              {postcard.recipient_name && (
                <p className="text-xs text-muted-foreground mt-2">
                  Zarejestrowana przez: {postcard.recipient_name}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityGallery;
