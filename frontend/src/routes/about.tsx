import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { BRAND } from "@/lib/catalog";
import { absUrl, OG_IMAGE } from "@/lib/seo";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${BRAND.name}` },
      { name: "description", content: `${BRAND.name} is a Multan-based signage studio building premium 3D signs, LED neon and custom wall decor for clients across Pakistan.` },
      { property: "og:title", content: `About — ${BRAND.name}` },
      { property: "og:description", content: "Multan-based signage studio — 12+ years, 4,800+ signs installed." },
      { property: "og:url", content: absUrl("/about") },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: absUrl("/about") }],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="container-luxe grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-gold)]">Our studio</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Signs, quietly considered.</h1>
          <p className="mt-4 text-muted-foreground">
            {BRAND.name} is a Multan-based signage and wall-decor studio. For over a decade we've built dimensional signs, LED neon, backlit facades and hand-assembled wall pieces for boutiques, restaurants, salons, corporate offices and family homes across Pakistan.
          </p>
          <p className="mt-4 text-muted-foreground">
            We believe good signage is invisible until it isn't — it should feel inevitable in the room. Every piece we ship is designed with you, previewed as a 3D mockup, built by hand in our workshop, and installed with the care of a piece of furniture.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg">
          <img src={heroImg} alt="Wallistan workshop" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-16">
        <div className="container-luxe grid gap-6 text-center md:grid-cols-4">
          {[["12+", "Years"], ["4,800+", "Signs installed"], ["4.9★", "Client rating"], ["48h", "Design turnaround"]].map(([n, l]) => (
            <div key={l}><div className="font-display text-4xl">{n}</div><div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{l}</div></div>
          ))}
        </div>
      </section>

      <section className="container-luxe py-16">
        <h2 className="font-display text-3xl">What we build</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { t: "For business", d: "Storefronts, reception walls, restaurant ambience, salon branding." },
            { t: "For home", d: "Name plates, layered wood wall art, family monograms, neon accents." },
            { t: "Bespoke", d: "One-of-one pieces from a sketch, a Pinterest board, or an idea." },
          ].map((s) => (
            <div key={s.t} className="rounded-md border border-border p-6">
              <div className="font-display text-xl">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
