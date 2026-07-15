import { Instagram } from "lucide-react";
import catNeon from "@/assets/cat-neon.jpg";
import catAcrylic from "@/assets/cat-acrylic.jpg";
import catShop from "@/assets/cat-shop.jpg";
import catDecor from "@/assets/cat-decor.jpg";
import catNameplate from "@/assets/cat-nameplate.jpg";
import catRestaurant from "@/assets/cat-restaurant.jpg";
const tiles = [catNeon, catAcrylic, catShop, catDecor, catNameplate, catRestaurant];

export function InstagramFeed() {
  const handle = "wallistan.pk";
  const url = `https://instagram.com/${handle}`;
  return (
    <section className="border-y border-border bg-secondary/30 py-10 lg:py-20">
      <div className="container-luxe">
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-gold)] lg:text-xs">
            Follow the studio
          </div>
          <h2 className="mt-1 font-display text-2xl lg:mt-3 lg:text-5xl">@{handle}</h2>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-maroon)] hover:text-[color:var(--color-gold)]"
          >
            <Instagram className="h-4 w-4" /> See more on Instagram →
          </a>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-1.5 sm:gap-2 md:grid-cols-6 lg:mt-10 lg:gap-3">
          {tiles.map((src, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-md bg-secondary"
            >
              <img
                src={src}
                alt="Wallistan installation"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                <Instagram className="h-6 w-6" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
