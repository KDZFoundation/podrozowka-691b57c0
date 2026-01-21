import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Package, MapPin, Calendar, CheckCircle, Clock, 
  Send, Image, User, ChevronDown, ChevronUp 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Postcard {
  id: string;
  tracking_code: string;
  language: string;
  status: string;
  given_to_name: string | null;
  given_to_country: string | null;
  given_at: string | null;
  received_at: string | null;
  photo_url: string | null;
  message: string | null;
  created_at: string;
}

interface MyPostcardsProps {
  userId: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  purchased: { label: "Zakupiona", color: "text-muted-foreground", icon: Package },
  in_transit: { label: "W podróży", color: "text-[hsl(var(--gold))]", icon: Send },
  delivered: { label: "Dostarczona", color: "text-accent", icon: CheckCircle },
};

const languageFlags: Record<string, string> = {
  de: "🇩🇪", it: "🇮🇹", es: "🇪🇸", en: "🇬🇧", fr: "🇫🇷",
  uk: "🇺🇦", th: "🇹🇭", hi: "🇮🇳", tr: "🇹🇷", "en-us": "🇺🇸",
  cs: "🇨🇿", hr: "🇭🇷", el: "🇬🇷", hu: "🇭🇺", zh: "🇨🇳", no: "🇳🇴",
};

const MyPostcards = ({ userId }: MyPostcardsProps) => {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'in_transit' | 'delivered'>('all');

  useEffect(() => {
    const fetchPostcards = async () => {
      const { data, error } = await supabase
        .from('postcards')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPostcards(data);
      }
      setIsLoading(false);
    };

    fetchPostcards();
  }, [userId]);

  const filteredPostcards = postcards.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
      </div>
    );
  }

  if (postcards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          Brak zarejestrowanych Podróżówek
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Gdy zarejestrujesz swoją pierwszą rozdaną Podróżówkę, pojawi się tutaj wraz z historią jej podróży.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Wszystkie ({postcards.length})
        </button>
        <button
          onClick={() => setFilter('in_transit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'in_transit'
              ? 'bg-[hsl(var(--gold))] text-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          W podróży ({postcards.filter(p => p.status === 'in_transit').length})
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'delivered'
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Dostarczone ({postcards.filter(p => p.status === 'delivered').length})
        </button>
      </div>

      {/* Postcards list */}
      <div className="space-y-4">
        {filteredPostcards.map((postcard, index) => {
          const status = statusLabels[postcard.status] || statusLabels.purchased;
          const StatusIcon = status.icon;
          const isExpanded = expandedId === postcard.id;

          return (
            <motion.div
              key={postcard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl shadow-soft overflow-hidden"
            >
              {/* Main row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : postcard.id)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
              >
                {/* Photo thumbnail or language flag */}
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {postcard.photo_url ? (
                    <img
                      src={postcard.photo_url}
                      alt="Podróżówka"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{languageFlags[postcard.language] || "🇵🇱"}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-muted-foreground">
                      {postcard.tracking_code}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                  <p className="font-medium text-foreground truncate">
                    {postcard.given_to_name ? (
                      <>
                        Dla: {postcard.given_to_name}
                        {postcard.given_to_country && ` • ${postcard.given_to_country}`}
                      </>
                    ) : (
                      "Nie przypisana"
                    )}
                  </p>
                  {postcard.given_at && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(postcard.given_at)}
                    </p>
                  )}
                </div>

                {/* Expand icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-4">
                    {/* Photo */}
                    {postcard.photo_url && (
                      <div className="rounded-lg overflow-hidden">
                        <img
                          src={postcard.photo_url}
                          alt="Moment wręczenia Podróżówki"
                          className="w-full max-h-64 object-cover"
                        />
                      </div>
                    )}

                    {/* Message */}
                    {postcard.message && (
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Historia:</p>
                        <p className="text-foreground">{postcard.message}</p>
                      </div>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Język</p>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <span className="text-xl">{languageFlags[postcard.language] || "🇵🇱"}</span>
                          {postcard.language.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className={`font-medium ${status.color} flex items-center gap-1`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </p>
                      </div>
                      {postcard.received_at && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Data dostarczenia</p>
                          <p className="font-medium text-foreground">
                            {formatDate(postcard.received_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MyPostcards;
