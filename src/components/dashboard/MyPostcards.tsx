import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Calendar, CheckCircle, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Postcard {
  id: string;
  status: string;
  buyer_display_name: string | null;
  purchased_at: string | null;
  recipient_name: string | null;
  recipient_message: string | null;
  registered_at: string | null;
  country_name: string | null;
  country_flag: string | null;
  design_view_name: string | null;
}

interface MyPostcardsProps {
  userId: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: typeof Package }> = {
  purchased: { label: "Zakupiona", color: "text-[hsl(var(--gold))]", icon: ShoppingBag },
  registered: { label: "Zarejestrowana", color: "text-accent", icon: CheckCircle },
};

const MyPostcards = ({ userId }: MyPostcardsProps) => {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'purchased' | 'registered'>('all');

  useEffect(() => {
    const fetchPostcards = async () => {
      const { data, error } = await supabase
        .from('postcards')
        .select(`
          id, status, buyer_display_name, purchased_at,
          recipient_name, recipient_message, registered_at,
          designs!inner(view_name, countries!inner(name, flag))
        `)
        .eq('buyer_id', userId)
        .order('purchased_at', { ascending: false });

      if (!error && data) {
        const mapped: Postcard[] = data.map((p: any) => ({
          id: p.id,
          status: p.status,
          buyer_display_name: p.buyer_display_name,
          purchased_at: p.purchased_at,
          recipient_name: p.recipient_name,
          recipient_message: p.recipient_message,
          registered_at: p.registered_at,
          country_name: p.designs?.countries?.name || null,
          country_flag: p.designs?.countries?.flag || null,
          design_view_name: p.designs?.view_name || null,
        }));
        setPostcards(mapped);
      }
      setIsLoading(false);
    };

    fetchPostcards();
  }, [userId]);

  const filteredPostcards = postcards.filter(p => filter === 'all' || p.status === filter);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return <div className="text-center py-12"><div className="animate-pulse text-muted-foreground">Ładowanie...</div></div>;
  }

  if (postcards.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">Brak zakupionych Podróżówek</h3>
        <p className="text-muted-foreground max-w-md mx-auto">Po zakupie Podróżówek w sklepie pojawią się one tutaj.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
          Wszystkie ({postcards.length})
        </button>
        <button onClick={() => setFilter('purchased')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'purchased' ? 'bg-[hsl(var(--gold))] text-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
          Zakupione ({postcards.filter(p => p.status === 'purchased').length})
        </button>
        <button onClick={() => setFilter('registered')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'registered' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
          Zarejestrowane ({postcards.filter(p => p.status === 'registered').length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredPostcards.map((postcard, index) => {
          const status = statusLabels[postcard.status] || statusLabels.purchased;
          const StatusIcon = status.icon;
          const isExpanded = expandedId === postcard.id;

          return (
            <motion.div key={postcard.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl shadow-soft overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : postcard.id)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors">
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{postcard.country_flag || "🇵🇱"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{postcard.country_name}</span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />{status.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{postcard.design_view_name}</p>
                  {postcard.purchased_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />{formatDate(postcard.purchased_at)}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-border">
                  <div className="p-4 space-y-3">
                    {postcard.recipient_name && (
                      <div className="bg-accent/10 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Zarejestrowana przez:</p>
                        <p className="font-medium text-foreground">{postcard.recipient_name}</p>
                        {postcard.recipient_message && <p className="text-sm text-foreground mt-2">"{postcard.recipient_message}"</p>}
                        {postcard.registered_at && <p className="text-xs text-muted-foreground mt-2">{formatDate(postcard.registered_at)}</p>}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Kraj</p>
                        <p className="font-medium text-foreground">{postcard.country_flag} {postcard.country_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className={`font-medium ${status.color} flex items-center gap-1`}><StatusIcon className="w-4 h-4" />{status.label}</p>
                      </div>
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
