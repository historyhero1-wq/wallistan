import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Sync dots with swipe position (mobile)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const idx = Math.round(el.scrollLeft / el.clientWidth);
        setActive(idx);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="grid gap-3">
      {/* Mobile: swipeable */}
      <div className="relative lg:hidden">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square w-full shrink-0 snap-center bg-secondary">
              <img src={img} alt={i === 0 ? alt : ""} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-5 bg-[color:var(--color-maroon)]" : "w-1.5 bg-background/70"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: click thumbs */}
      <div className="hidden lg:block">
        <div className="group relative aspect-square overflow-hidden rounded-md bg-secondary">
          <img
            key={active}
            src={images[active]}
            alt={alt}
            width={1200}
            height={1200}
            className="h-full w-full origin-center object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-md border-2 bg-secondary",
                  i === active ? "border-[color:var(--color-gold)]" : "border-transparent hover:border-border"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
