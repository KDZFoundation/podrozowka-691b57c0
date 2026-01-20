import { useState } from "react";
import { MapPin } from "lucide-react";

const EuropeMap = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="map" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Gdzie jest Polska?
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Znajdź nas na mapie Europy
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Polska leży w sercu Europy – na skrzyżowaniu szlaków handlowych i kulturowych. 
            To kraj o bogatej historii i gościnnych mieszkańcach.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div 
            className="relative bg-card rounded-2xl p-8 shadow-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Simplified Europe Map SVG */}
            <svg
              viewBox="0 0 800 600"
              className="w-full h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Europe countries - simplified paths */}
              <g className="fill-muted stroke-border stroke-[0.5]">
                {/* Norway */}
                <path d="M380 50 L420 30 L440 80 L400 120 L380 100 Z" />
                {/* Sweden */}
                <path d="M400 80 L440 60 L460 120 L430 180 L400 160 Z" />
                {/* Finland */}
                <path d="M460 50 L500 30 L520 100 L480 140 L450 120 Z" />
                {/* UK */}
                <path d="M240 180 L280 160 L300 200 L290 250 L250 240 L240 200 Z" />
                {/* Ireland */}
                <path d="M200 180 L230 170 L240 210 L220 230 L190 210 Z" />
                {/* France */}
                <path d="M260 280 L320 260 L350 320 L330 380 L270 360 L250 310 Z" />
                {/* Spain */}
                <path d="M220 380 L300 360 L320 420 L280 470 L200 450 L180 400 Z" />
                {/* Portugal */}
                <path d="M170 400 L200 380 L210 440 L180 460 Z" />
                {/* Germany */}
                <path d="M350 220 L400 200 L420 260 L400 300 L350 290 L340 250 Z" />
                {/* Italy */}
                <path d="M380 340 L420 320 L440 400 L420 480 L400 460 L380 380 Z" />
                {/* Netherlands/Belgium */}
                <path d="M320 220 L350 210 L360 250 L330 260 Z" />
                {/* Czech */}
                <path d="M400 260 L440 250 L450 290 L420 300 Z" />
                {/* Austria */}
                <path d="M400 300 L450 290 L470 320 L430 340 Z" />
                {/* Hungary */}
                <path d="M450 300 L500 290 L510 340 L460 350 Z" />
                {/* Romania */}
                <path d="M500 300 L560 290 L580 350 L540 380 L500 360 Z" />
                {/* Bulgaria */}
                <path d="M520 380 L570 370 L580 420 L540 430 Z" />
                {/* Greece */}
                <path d="M500 420 L540 410 L560 480 L520 500 L490 460 Z" />
                {/* Ukraine */}
                <path d="M520 220 L620 200 L660 280 L600 320 L540 300 Z" />
                {/* Belarus */}
                <path d="M500 180 L560 170 L570 220 L530 240 L500 220 Z" />
                {/* Baltic states */}
                <path d="M460 140 L500 130 L510 180 L470 190 Z" />
                {/* Russia (partial) */}
                <path d="M560 100 L700 80 L720 200 L660 260 L580 220 L550 160 Z" />
                {/* Denmark */}
                <path d="M360 180 L390 170 L400 200 L370 210 Z" />
                {/* Switzerland */}
                <path d="M340 300 L370 290 L380 320 L350 330 Z" />
              </g>

              {/* Poland - highlighted */}
              <path
                d="M420 200 L480 190 L510 230 L500 280 L460 290 L420 270 L410 230 Z"
                className={`transition-all duration-500 ${
                  isHovered 
                    ? "fill-primary stroke-primary stroke-2" 
                    : "fill-polish-red stroke-polish-red stroke-2"
                }`}
              />

              {/* Poland label */}
              <g className="transition-all duration-300">
                <MapPin 
                  className={`transition-all duration-300 ${isHovered ? "text-primary" : "text-polish-red"}`}
                  style={{ transform: "translate(440px, 215px)" }}
                />
                <text
                  x="460"
                  y="250"
                  className="fill-foreground font-display text-lg font-bold"
                  textAnchor="middle"
                >
                  POLSKA
                </text>
              </g>

              {/* Decorative elements */}
              <circle cx="455" cy="235" r="4" className="fill-primary-foreground animate-pulse-soft" />
            </svg>

            {/* Info card */}
            <div className={`absolute bottom-4 right-4 bg-background p-4 rounded-xl shadow-soft transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="font-display font-bold text-foreground">Polska</p>
              <p className="text-sm text-muted-foreground">Serce Europy</p>
              <p className="text-xs text-muted-foreground mt-1">38 milionów mieszkańców</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-xl shadow-soft text-center">
              <p className="font-display text-2xl font-bold text-accent">1000+</p>
              <p className="text-sm text-muted-foreground">lat historii</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-soft text-center">
              <p className="font-display text-2xl font-bold text-accent">17</p>
              <p className="text-sm text-muted-foreground">miejsc UNESCO</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-soft text-center">
              <p className="font-display text-2xl font-bold text-accent">9</p>
              <p className="text-sm text-muted-foreground">sąsiadów</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EuropeMap;
