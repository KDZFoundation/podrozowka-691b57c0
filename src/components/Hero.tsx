import heroImage from "@/assets/hero-poland.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Piękny krajobraz Polski z Tatrami w tle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-4 py-2 bg-primary/90 text-primary-foreground rounded-full text-sm font-medium mb-6 animate-fade-up">
            Odwrócona pocztówka z Polski
          </span>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Podróżówka
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Fizyczne podziękowanie, które wręczysz osobom spotkanym podczas podróży. 
            Pokaż światu piękno Polski i buduj mosty między kulturami.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <a 
              href="#shop"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-elevated hover:shadow-card"
            >
              Przeglądaj wzory
            </a>
            <a 
              href="#about"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30 rounded-lg font-semibold hover:bg-primary-foreground/30 transition-all backdrop-blur-sm"
            >
              Dowiedz się więcej
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">16</p>
              <p className="text-sm text-primary-foreground/70 mt-1">języków</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">50+</p>
              <p className="text-sm text-primary-foreground/70 mt-1">wzorów</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">2k+</p>
              <p className="text-sm text-primary-foreground/70 mt-1">sprzedanych</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/70 rounded-full mt-2 animate-pulse-soft" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
