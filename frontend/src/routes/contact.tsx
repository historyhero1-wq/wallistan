import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { BRAND, whatsappLink } from "@/lib/catalog";
import { absUrl, OG_IMAGE } from "@/lib/seo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${BRAND.name}` },
      { name: "description", content: `Get in touch with ${BRAND.name} — WhatsApp ${BRAND.phone}, email ${BRAND.email}, studio in Multan, Pakistan.` },
      { property: "og:title", content: `Contact — ${BRAND.name}` },
      { property: "og:url", content: absUrl("/contact") },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: absUrl("/contact") }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: BRAND.name,
        telephone: BRAND.phone,
        email: BRAND.email,
        address: { "@type": "PostalAddress", addressLocality: "Multan", addressRegion: "Punjab", addressCountry: "PK" },
        areaServed: "PK",
        priceRange: "PKR",
      }),
    }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <section className="container-luxe grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-gold)]">Contact</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Let's build something.</h1>
          <p className="mt-4 text-muted-foreground">Fastest reply is WhatsApp. We're in the studio Mon–Sat, 10am–8pm PKT.</p>

          <div className="mt-8 space-y-4">
            <Row icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" value={BRAND.phone} href={whatsappLink("Hi Wallistan!")} accent />
            <Row icon={<Phone className="h-4 w-4" />} label="Call" value={BRAND.phone} href={`tel:${BRAND.phone}`} />
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={BRAND.email} href={`mailto:${BRAND.email}`} />
            <Row icon={<MapPin className="h-4 w-4" />} label="Studio" value={BRAND.address} />
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent", { description: "We'll reply within 24 hours." }); (e.target as HTMLFormElement).reset(); }} className="rounded-lg border border-border bg-background p-6 shadow-sm md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required><Input required name="name" /></Field>
            <Field label="Phone" required><Input required name="phone" type="tel" /></Field>
          </div>
          <Field label="Email"><Input name="email" type="email" /></Field>
          <Field label="Message" required><Textarea required name="msg" rows={5} placeholder="Tell us about your project…" /></Field>
          <Button type="submit" size="lg" className="mt-6 w-full bg-foreground text-background hover:bg-foreground/90">Send message</Button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Row({ icon, label, value, href, accent }: { icon: React.ReactNode; label: string; value: string; href?: string; accent?: boolean }) {
  const inner = (
    <div className="flex items-center gap-4 rounded-md border border-border bg-background p-4">
      <div className={`grid h-10 w-10 place-items-center rounded-full ${accent ? "bg-[#25D366] text-white" : "bg-secondary text-[color:var(--color-gold)]"}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="truncate font-medium">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block hover:opacity-90">{inner}</a> : inner;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <Label className="mb-1.5 block text-sm">{label}{required && <span className="ml-1 text-[color:var(--color-gold)]">*</span>}</Label>
      {children}
    </div>
  );
}
