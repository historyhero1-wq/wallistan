import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BRAND } from "@/lib/catalog";
import { absUrl, OG_IMAGE } from "@/lib/seo";

const FAQS = [
  { q: "How long does an order take?", a: "Stock pieces ship in 3–5 days. Custom orders take 7–14 days from design approval, plus 2–3 days shipping across Pakistan." },
  { q: "Do you install?", a: "Free installation anywhere in Multan. In Lahore, Karachi, Islamabad and Faisalabad we work with vetted install partners; on-site install is quoted separately." },
  { q: "Can I upload my own logo?", a: "Yes — AI, SVG, PDF or high-resolution PNG all work. Our design team will convert it and send a mockup before production." },
  { q: "What payment methods do you accept?", a: "Bank transfer, JazzCash and Easypaisa. Upload a payment screenshot after checkout; we verify manually within a few hours during business hours." },
  { q: "Do LED signs get hot?", a: "No. LED neon and backlit signs run cool and are safe for continuous use — even in bedrooms and kids' rooms." },
  { q: "What warranty do you offer?", a: "5 years on LED components, 2 years on materials. Full details are shipped with every order." },
  { q: "Can I return a custom piece?", a: "Custom-made pieces are non-returnable, but we always share a mockup for approval before we build so surprises don't happen." },
  { q: "Do you ship internationally?", a: "Yes — DHL / FedEx to most countries. Message us on WhatsApp for a shipping quote." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ — ${BRAND.name}` },
      { name: "description", content: `Answers to common questions about custom signs, shipping, install, payment and warranty at ${BRAND.name}.` },
      { property: "og:title", content: `FAQ — ${BRAND.name}` },
      { property: "og:url", content: absUrl("/faq") },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: absUrl("/faq") }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }),
    }],
  }),
  component: Faq,
});

function Faq() {
  return (
    <SiteLayout>
      <section className="container-luxe grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-gold)]">FAQ</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Everything you'd want to know.</h1>
          <p className="mt-4 text-muted-foreground">Can't find your question? Message us on WhatsApp — we reply the same day.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
