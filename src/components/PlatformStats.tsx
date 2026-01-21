import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Globe2, Gift, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  total_members: number;
  total_countries: number;
  total_given: number;
  total_purchased: number;
}

const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString('pl-PL')}</span>;
};

const PlatformStats = () => {
  const [stats, setStats] = useState<Stats>({
    total_members: 0,
    total_countries: 0,
    total_given: 0,
    total_purchased: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('platform_stats')
        .select('*')
        .maybeSingle();

      if (!error && data) {
        setStats(data);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      icon: Users,
      value: stats.total_members,
      label: "Członków platformy",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Globe2,
      value: stats.total_countries,
      label: "Krajów osiągniętych",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Gift,
      value: stats.total_given,
      label: "Podróżówek rozdanych",
      color: "text-[hsl(var(--gold))]",
      bgColor: "bg-[hsl(var(--gold))]/10",
    },
    {
      icon: ShoppingBag,
      value: stats.total_purchased,
      label: "W podróży (zakupione)",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

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
          <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Społeczność Podróżówka
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Statystyki platformy
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 shadow-soft text-center"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.bgColor} rounded-full mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className={`font-display text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                {isLoading ? "..." : <AnimatedCounter value={stat.value} />}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformStats;
