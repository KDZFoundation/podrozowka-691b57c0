import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Award, Globe2, Users, ChevronRight, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface RankCardProps {
  totalPoints: number;
  currentRank: string;
  uniqueCountries: number;
  registeredRelations: number;
}

const RANK_TIERS = [
  { name: "Zwiadowca", min: 0, max: 499, accent: "muted-foreground", bg: "bg-muted", ring: "ring-border", gradient: "" },
  { name: "Ambasador", min: 500, max: 2499, accent: "[hsl(var(--gold))]", bg: "bg-[hsl(var(--gold))]/10", ring: "ring-[hsl(var(--gold))]", gradient: "from-[hsl(var(--gold))] to-[hsl(var(--gold-light))]" },
  { name: "Misjonarz Kultury", min: 2500, max: 7499, accent: "accent", bg: "bg-accent/10", ring: "ring-accent", gradient: "from-accent to-[hsl(var(--forest-light))]" },
  { name: "Legenda Podróżówki", min: 7500, max: Infinity, accent: "[hsl(var(--gold))]", bg: "bg-[hsl(var(--gold))]/5", ring: "ring-[hsl(var(--gold))]", gradient: "from-[hsl(var(--gold))] via-[hsl(var(--warm-white))] to-[hsl(var(--gold))]" },
];

function getTier(rank: string) {
  return RANK_TIERS.find((t) => t.name === rank) ?? RANK_TIERS[0];
}

function getNextTier(rank: string) {
  const idx = RANK_TIERS.findIndex((t) => t.name === rank);
  return idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1] : null;
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const motionVal = useMotionValue(0);
    const unsubscribe = motionVal.on("change", (v) => setDisplay(Math.round(v)));
    animate(motionVal, value, { duration: 1.4, ease: "easeOut" });
    return () => {
      unsubscribe();
      motionVal.destroy();
    };
  }, [value]);

  return <>{display.toLocaleString("pl-PL")}</>;
}

const RankCard = ({ totalPoints, currentRank, uniqueCountries, registeredRelations }: RankCardProps) => {
  const tier = getTier(currentRank);
  const nextTier = getNextTier(currentRank);
  const isLegend = !nextTier;

  const progressValue = nextTier
    ? Math.min(100, Math.round(((totalPoints - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100;

  const pointsToNext = nextTier ? nextTier.min - totalPoints : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl shadow-soft ${
        isLegend
          ? "bg-gradient-to-br from-[hsl(43,74%,15%)] via-[hsl(43,50%,20%)] to-[hsl(20,20%,12%)] text-[hsl(var(--warm-white))]"
          : "bg-card text-foreground"
      }`}
    >
      {/* Decorative shimmer for Legenda */}
      {isLegend && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[hsl(var(--gold))]/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[hsl(var(--gold))]/5 blur-2xl" />
        </div>
      )}

      <div className="relative z-10 p-6 md:p-8">
        {/* Top row: rank badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isLegend
                  ? "bg-[hsl(var(--gold))]/20 ring-1 ring-[hsl(var(--gold))]/40"
                  : `${tier.bg} ring-1 ${tier.ring}/30`
              }`}
            >
              {isLegend ? (
                <Sparkles className="w-6 h-6 text-[hsl(var(--gold))]" />
              ) : (
                <Award className={`w-6 h-6 text-${tier.accent}`} />
              )}
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-widest ${
                isLegend ? "text-[hsl(var(--gold))]" : "text-muted-foreground"
              }`}>
                Twoja ranga
              </p>
              <h2
                className={`font-display text-xl md:text-2xl font-bold uppercase tracking-wide ${
                  isLegend ? "text-[hsl(var(--gold-light))]" : `text-${tier.accent}`
                }`}
              >
                {currentRank}
              </h2>
            </div>
          </div>

          {nextTier && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <span>Następna:</span>
              <span className="font-semibold text-foreground">{nextTier.name}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Progress bar */}
        {nextTier ? (
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-2">
              <span className={isLegend ? "text-[hsl(var(--gold))]/70" : "text-muted-foreground"}>
                {totalPoints} pkt
              </span>
              <span className={isLegend ? "text-[hsl(var(--gold))]/70" : "text-muted-foreground"}>
                {nextTier.min} pkt
              </span>
            </div>
            <Progress
              value={progressValue}
              className={`h-2.5 ${isLegend ? "bg-white/10" : "bg-muted"}`}
            />
            <p className={`text-xs mt-2 ${isLegend ? "text-[hsl(var(--gold))]/60" : "text-muted-foreground"}`}>
              Jeszcze <span className="font-semibold">{pointsToNext}</span> punktów do rangi{" "}
              <span className="font-semibold">{nextTier.name}</span>
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <Progress value={100} className="h-2.5 bg-[hsl(var(--gold))]/20" />
            <p className="text-xs mt-2 text-[hsl(var(--gold))]/70 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Osiągnąłeś najwyższą rangę — jesteś legendą!
            </p>
          </div>
        )}

        {/* Cultural Impact Score */}
        <div className={`rounded-xl p-5 ${
          isLegend ? "bg-white/5 ring-1 ring-[hsl(var(--gold))]/10" : "bg-muted/50"
        }`}>
          <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${
            isLegend ? "text-[hsl(var(--gold))]/70" : "text-muted-foreground"
          }`}>
            Twój Wpływ Kulturowy
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className={`font-display text-4xl md:text-5xl font-bold ${
              isLegend ? "text-[hsl(var(--gold-light))]" : `text-${tier.accent}`
            }`}>
              <AnimatedCounter value={totalPoints} />
            </span>
            <span className={`text-sm ${isLegend ? "text-[hsl(var(--gold))]/60" : "text-muted-foreground"}`}>
              punktów
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`flex items-center gap-2 rounded-lg p-3 ${
              isLegend ? "bg-white/5" : "bg-card"
            }`}>
              <Globe2 className={`w-4 h-4 flex-shrink-0 ${
                isLegend ? "text-[hsl(var(--gold))]" : "text-primary"
              }`} />
              <div>
                <p className={`font-display text-lg font-bold ${
                  isLegend ? "text-[hsl(var(--warm-white))]" : "text-foreground"
                }`}>{uniqueCountries}</p>
                <p className={`text-xs ${
                  isLegend ? "text-[hsl(var(--gold))]/60" : "text-muted-foreground"
                }`}>Obsłużone kraje</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-lg p-3 ${
              isLegend ? "bg-white/5" : "bg-card"
            }`}>
              <Users className={`w-4 h-4 flex-shrink-0 ${
                isLegend ? "text-[hsl(var(--gold))]" : "text-accent"
              }`} />
              <div>
                <p className={`font-display text-lg font-bold ${
                  isLegend ? "text-[hsl(var(--warm-white))]" : "text-foreground"
                }`}>{registeredRelations}</p>
                <p className={`text-xs ${
                  isLegend ? "text-[hsl(var(--gold))]/60" : "text-muted-foreground"
                }`}>Zarejestrowane relacje</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RankCard;
