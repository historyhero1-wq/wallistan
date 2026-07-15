import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { BRAND, listCategories, whatsappLink } from "@/lib/catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  return (
    <footer className="mt-24 border-t border-border bg-[oklch(0.13_0_0)] text-[oklch(0.94_0_0)]">
      <div className="container-luxe grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <img src={BRAND.logo} alt="Wallistan" width={48} height={48} className="h-12 w-auto object-contain" />
            <div className="font-display text-2xl">{BRAND.name}</div>
          </div>
          <p className="mt-3 text-sm text-white/60">{BRAND.tagline}</p>
          <div className="mt-6 space-y-2 text-sm text-white/70">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[color:var(--color-gold)]" /> {BRAND.address}</div>
            <a href={`tel:${BRAND.phone}`} className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 text-[color:var(--color-gold)]" /> {BRAND.phone}</a>
            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 text-[color:var(--color-gold)]" /> {BRAND.email}</a>
          </div>
          <div className="mt-6 flex gap-3">
            <a aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-[color:var(--color-gold)]" href="#"><Instagram className="h-4 w-4" /></a>
            <a aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-[color:var(--color-gold)]" href="#"><Facebook className="h-4 w-4" /></a>
            <a aria-label="WhatsApp" href={whatsappLink("Hi Wallistan!")} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-[color:var(--color-gold)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20 3.5A11.5 11.5 0 0 0 2.6 18l-1.1 4a.5.5 0 0 0 .6.6l4-1.1A11.5 11.5 0 1 0 20 3.5Zm-8 20.4a9.9 9.9 0 0 1-5-1.3l-.4-.2-2.9.8.8-2.9-.2-.4A9.9 9.9 0 1 1 12 22Zm5.5-7c-.3-.1-1.7-.9-2-1s-.5-.1-.7.2-.8 1-1 1.2-.4.2-.7.1a8 8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.5.2-.3a.4.4 0 0 0 0-.4l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.3 1 2.7 1.1 2.8s2 3 4.8 4.2a5.5 5.5 0 0 0 2 .5 3 3 0 0 0 2-.9 2.4 2.4 0 0 0 .5-1.6c0-.2-.1-.3-.4-.4Z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[color:var(--color-gold)]">Shop</div>
          <ul className="space-y-2 text-sm text-white/70">
            {categories.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
            {categories.length === 0 && (
              <li><Link to="/shop" className="hover:text-white">All Designs</Link></li>
            )}
          </ul>
        </div>

        <div>
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[color:var(--color-gold)]">Company</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/about" className="hover:text-white">About Wallistan</Link></li>
            <li><Link to="/custom-order" className="hover:text-white">Custom Quote</Link></li>
            <li><Link to="/blog" className="hover:text-white">Journal</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[color:var(--color-gold)]">Newsletter</div>
          <p className="text-sm text-white/60">Signage inspiration, design trends and members-only offers — twice a month.</p>
          <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" required placeholder="you@example.com" className="border-white/20 bg-white/5 text-white placeholder:text-white/40" />
            <Button type="submit" className="bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90">Join</Button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 md:flex-row">
          <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          <div className="flex gap-5"><a href="#" className="hover:text-white">Privacy</a><a href="#" className="hover:text-white">Terms</a><a href="#" className="hover:text-white">Shipping</a></div>
        </div>
      </div>
    </footer>
  );
}
