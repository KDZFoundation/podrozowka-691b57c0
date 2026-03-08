import { motion } from "framer-motion";
import { Trophy, Medal, Award, Heart, Globe2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface RankedUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  current_rank: string;
  countries: { iso2: string; name_pl: string }[];
}

const RANK_STYLE: Record<string, { badgeClass: string }> = {
  Zwiadowca: { badgeClass: "bg-muted text-muted-foreground border-border" },
  Ambasador: { badgeClass: "bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30" },
  "Misjonarz Kultury": { badgeClass: "bg-accent/10 text-accent border-accent/30" },
  "Legenda Podróżówki": { badgeClass: "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/40" },
};

const FLAG_URL = (iso2: string) =>
  `https://flagcdn.com/w40/${iso2.toLowerCase()}.png`;

const fetchRanking = async (): Promise<RankedUser[]> => {
  // Get top users by total_points
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, total_points, current_rank")
    .gt("total_points", 0)
    .order("total_points", { ascending: false })
    .limit(10);

  if (error) throw error;
  if (!profiles || profiles.length === 0) return [];

  // For each user, get their unique countries from inventory_units → card_designs → countries
  const userIds = profiles.map((p) => p.user_id);

  const { data: units } = await supabase
    .from("inventory_units")
    .select("traveler_user_id, card_designs!inner(country_id, countries!inner(iso2, name_pl))")
    .in("traveler_user_id", userIds);

  // Build country map per user
  const userCountryMap = new Map<string, Map<string, { iso2: string; name_pl: string }>>();
  (units || []).forEach((u: any) => {
    const uid = u.traveler_user_id;
    const country = u.card_designs?.countries;
    if (!uid || !country) return;
    if (!userCountryMap.has(uid)) userCountryMap.set(uid, new Map());
    userCountryMap.get(uid)!.set(country.iso2, { iso2: country.iso2, name_pl: country.name_pl });
  });

  return profiles.map((p) => ({
    ...p,
    countries: Array.from(userCountryMap.get(p.user_id)?.values() ?? []),
  }));
};

const UserRanking = () => {
  const { data: topUsers = [], isLoading } = useQuery({
    queryKey: ["user-ranking"],
    queryFn: fetchRanking,
    refetchInterval: 60_000,
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-[hsl(var(--gold))]" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
            {index + 1}
          </span>
        );
    }
  };

  const getRankBgColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-[hsl(var(--gold))]/10 border-[hsl(var(--gold))]/30";
      case 1:
        return "bg-gray-100 border-gray-300";
      case 2:
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-card border-border";
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Ładowanie rankingu...</div>
          </div>
        </div>
      </section>
    );
  }

  if (topUsers.length === 0) {
    return (
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block px-3 py-1 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] rounded-full text-sm font-medium mb-4">
              Top Ambasadorów Polski
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bądź pierwszym ambasadorem!
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Dołącz do społeczności, kupuj Podróżówki i zostań jednym z naszych ambasadorów promujących Polskę na
              świecie.
            </p>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
            >
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block px-3 py-1 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] rounded-full text-sm font-medium mb-4">
            Cultural Impact Ranking
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Top Ambasadorów Polski
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Użytkownicy z największym wpływem kulturowym — promują Polskę na świecie i budują relacje.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {topUsers.map((user, index) => {
            const rankStyle = RANK_STYLE[user.current_rank] ?? RANK_STYLE.Zwiadowca;
            const isLegend = user.current_rank === "Legenda Podróżówki";

            return (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className={`flex items-center gap-4 p-4 mb-3 rounded-xl border transition-all hover:shadow-soft ${getRankBgColor(index)}`}
              >
                {/* Rank icon */}
                <div className="flex-shrink-0">{getRankIcon(index)}</div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || "Użytkownik"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-background"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {(user.display_name || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name + badge + flags */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {user.display_name || "Anonim"}
                    </p>
                    <Badge className={`text-[10px] px-2 py-0 ${rankStyle.badgeClass}`}>
                      {isLegend && <Sparkles className="w-3 h-3 mr-1" />}
                      {user.current_rank}
                    </Badge>
                  </div>

                  {/* Country flags */}
                  {user.countries.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Globe2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <div className="flex items-center gap-1 flex-wrap">
                        {user.countries.slice(0, 8).map((c) => (
                          <img
                            key={c.iso2}
                            src={FLAG_URL(c.iso2)}
                            alt={c.name_pl}
                            title={c.name_pl}
                            className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm"
                          />
                        ))}
                        {user.countries.length > 8 && (
                          <span className="text-[10px] text-muted-foreground ml-0.5">
                            +{user.countries.length - 8}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Points */}
                <div className="flex-shrink-0 text-right">
                  <p
                    className={`font-display text-xl font-bold ${
                      isLegend ? "text-[hsl(var(--gold))]" : "text-primary"
                    }`}
                  >
                    {user.total_points.toLocaleString("pl-PL")}
                  </p>
                  <p className="text-xs text-muted-foreground">punktów</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserRanking;
