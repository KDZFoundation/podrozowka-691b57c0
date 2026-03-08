import { motion } from "framer-motion";
import { Trophy, Medal, Award, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RankedUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  country: string | null;
  postcards_purchased: number;
}

const fetchRanking = async (): Promise<RankedUser[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, country, postcards_purchased')
    .gt('postcards_purchased', 0)
    .order('postcards_purchased', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
};

const UserRanking = () => {
  const { data: topUsers = [], isLoading } = useQuery({
    queryKey: ['user-ranking'],
    queryFn: fetchRanking,
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-[hsl(var(--gold))]" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getRankBgColor = (index: number) => {
    switch (index) {
      case 0: return "bg-[hsl(var(--gold))]/10 border-[hsl(var(--gold))]/30";
      case 1: return "bg-gray-100 border-gray-300";
      case 2: return "bg-amber-50 border-amber-200";
      default: return "bg-card border-border";
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center"><div className="animate-pulse">Ładowanie rankingu...</div></div>
        </div>
      </section>
    );
  }

  if (topUsers.length === 0) {
    return (
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center">
            <span className="inline-block px-3 py-1 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] rounded-full text-sm font-medium mb-4">Ranking Ambasadorów</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Bądź pierwszym ambasadorem!</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">Dołącz do społeczności, kupuj Podróżówki i zostań jednym z naszych ambasadorów promujących Polskę na świecie.</p>
            <a href="#auth" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
              <Heart className="w-5 h-5" /> Dołącz teraz
            </a>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] rounded-full text-sm font-medium mb-4">Ranking Ambasadorów</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Najwięksi ambasadorzy Polski</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Użytkownicy, którzy kupili najwięcej Podróżówek i pomagają promować Polskę na świecie.</p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {topUsers.map((user, index) => (
            <motion.div key={user.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} viewport={{ once: true }}
              className={`flex items-center gap-4 p-4 mb-3 rounded-xl border ${getRankBgColor(index)} transition-all hover:shadow-soft`}>
              <div className="flex-shrink-0">{getRankIcon(index)}</div>
              <div className="flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.display_name || "Użytkownik"} className="w-12 h-12 rounded-full object-cover border-2 border-background" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{(user.display_name || "U")[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{user.display_name || "Anonim"}</p>
                {user.country && <p className="text-sm text-muted-foreground">{user.country}</p>}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-display text-xl font-bold text-primary">{user.postcards_purchased}</p>
                <p className="text-xs text-muted-foreground">zakupionych</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserRanking;
