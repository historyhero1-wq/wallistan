import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export type HeroSlide = {
  image: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  ctaLabel: string;
  ctaTo: string;
  ctaLabel2?: string;
  ctaTo2?: string;
};

export function HeroSlider({ slides, interval = 5500 }: { slides: HeroSlide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [paused, slides.length, interval]);

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, idx) => (
        <img
          key={idx}
          src={s.image}
          alt=""
          width={1920}
          height={1200}
          fetchPriority={idx === 0 ? "high" : "low"}
          loading={idx === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-1000 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== idx}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/10 to-background/90" aria-hidden />

      <div className="container-luxe grid min-h-[60vh] place-items-center py-14 text-center lg:min-h-[86vh] lg:py-24">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`col-start-1 row-start-1 max-w-4xl transition-all duration-700 ${
              i === idx ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
            }`}
            aria-hidden={i !== idx}
          >
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-gold)]/60 bg-background/85 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-maroon)] backdrop-blur lg:text-xs">
              {s.eyebrow}
            </div>
            <h1 className="font-display text-3xl font-semibold uppercase leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)] sm:text-5xl md:text-7xl lg:text-[80px]">
              {s.title}
            </h1>
            {s.subtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-[11px] font-medium uppercase tracking-[0.24em] text-white/95 lg:mt-6 lg:text-sm">
                {s.subtitle}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:mt-8 lg:gap-4">
              <Button size="lg" asChild className="h-11 rounded-full bg-[color:var(--color-gold)] px-6 text-sm font-semibold text-[color:var(--color-gold-foreground)] shadow-xl shadow-[color:var(--color-gold)]/30 hover:bg-[color:var(--color-gold)]/90 lg:h-12 lg:px-10 lg:text-base">
                <Link to={s.ctaTo}>{s.ctaLabel}</Link>
              </Button>
              {s.ctaLabel2 && s.ctaTo2 && (
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="h-11 rounded-full border-white/70 bg-background/20 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-background/40 lg:h-12 lg:px-10 lg:text-base"
                >
                  <Link to={s.ctaTo2}>{s.ctaLabel2}</Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 lg:bottom-8">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-8 bg-[color:var(--color-gold)]" : "w-2 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
