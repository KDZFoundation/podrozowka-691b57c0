import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Globe2, Trophy, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  postcards_purchased: number;
  postcards_received: number;
}

interface UserStatsProps {
  profile: Profile | null;
  userId: string;
}

interface PostcardStats {
  total: number;
  purchased: number;
  registered: number;
  countriesReached: number;
}

const UserStats = ({ profile, userId }: UserStatsProps) => {
  const [stats, setStats] = useState<PostcardStats>({ total: 0, purchased: 0, registered: 0, countriesReached: 0 });
  const [recentCountries, setRecentCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('postcards')
        .select('id, status, designs!inner(countries!inner(name))')
        .eq('buyer_id', userId);

      if (!error && data) {
        const total = data.length;
        const purchased = data.filter((p: any) => p.status === 'purchased').length;
        const registered = data.filter((p: any) => p.status === 'registered').length;
        const countries = [...new Set(data.map((p: any) => p.designs?.countries?.name).filter(Boolean))];

        setStats({ total, purchased, registered, countriesReached: countries.length });
        setRecentCountries(countries.slice(0, 5) as string[]);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [userId]);

  const statsCards = [
    { icon: Package, value: stats.total, label: "Wszystkie Podróżówki", color: "text-primary", bgColor: "bg-primary/10" },
    { icon: ShoppingBag, value: stats.purchased, label: "Zakupione", color: "text-[hsl(var(--gold))]", bgColor: "bg-[hsl(var(--gold))]/10" },
    { icon: Trophy, value: stats.registered, label: "Zarejestrowane", color: "text-accent", bgColor: "bg-accent/10" },
    { icon: Globe2, value: stats.countriesReached, label: "Krajów", color: "text-primary", bgColor: "bg-primary/10" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 md:p-8 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-2xl font-bold text-primary">{(profile?.display_name || "U")[0].toUpperCase()}</span>
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">Witaj, {profile?.display_name || "Podróżniku"}!</h1>
            <p className="text-muted-foreground">{profile?.postcards_purchased || 0} zakupionych • {profile?.postcards_received || 0} otrzymanych</p>
            {profile?.city && profile?.country && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.city}, {profile.country}</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-card rounded-xl p-5 shadow-soft">
            <div className={`inline-flex items-center justify-center w-10 h-10 ${stat.bgColor} rounded-lg mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className={`font-display text-3xl font-bold ${stat.color}`}>{isLoading ? "..." : stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {recentCountries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[hsl(var(--gold))]" /> Kraje Twoich Podróżówek
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentCountries.map((country) => (
              <span key={country} className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-full text-sm font-medium text-foreground">
                <MapPin className="w-3 h-3 text-accent" />{country}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserStats;
