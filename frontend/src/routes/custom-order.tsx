import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { BRAND, whatsappLink } from "@/lib/catalog";
import { absUrl, OG_IMAGE } from "@/lib/seo";


export const Route = createFileRoute("/custom-order")({
  head: () => ({
    meta: [
      { title: `Request a Custom Quote — ${BRAND.name}` },
      { name: "description", content: "Get a mockup and quote for your custom 3D sign, LED neon or wall decor project. We respond within 24 hours." },
      { property: "og:title", content: `Request a Custom Quote — ${BRAND.name}` },
      { property: "og:description", content: "Send your idea, get a mockup and quote in 24 hours." },
      { property: "og:url", content: absUrl("/custom-order") },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: absUrl("/custom-order") }],
  }),
  component: CustomOrder,
});

function CustomOrder() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <SiteLayout>
      <section className="container-luxe grid gap-10 py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-gold)]">Custom quote</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Send us your idea.</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            A sketch, a screenshot, a Pinterest reference — anything works. Our design team responds within 24 hours with a 3D mockup and a price.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Free design mockup before you commit",
              "Nationwide shipping (Multan, Lahore, Karachi, Islamabad + more)",
              "Free on-site install anywhere in Multan",
              "Payment only after you approve the mockup",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-gold)]" />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-md border border-border bg-secondary/50 p-5 text-sm">
            <div className="font-medium">Prefer WhatsApp?</div>
            <p className="mt-1 text-muted-foreground">Send us a message directly with your references.</p>
            <a href={whatsappLink("Hi Wallistan — I'd like a custom quote.")} target="_blank" rel="noreferrer" className="mt-2 inline-block font-medium text-[color:var(--color-gold)] hover:underline">
              Message {BRAND.phone} →
            </a>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target as HTMLFormElement);
            const name = String(fd.get("name") ?? "");
            const phone = String(fd.get("phone") ?? "");
            const email = String(fd.get("email") ?? "");
            const type = String(fd.get("type") ?? "");
            const size = String(fd.get("size") ?? "");
            const city = String(fd.get("city") ?? "");
            const notes = String(fd.get("notes") ?? "");
            const message = [
              "Custom quote request",
              `Name: ${name}`,
              `Phone: ${phone}`,
              email ? `Email: ${email}` : "",
              type ? `Type: ${type}` : "",
              size ? `Size: ${size}` : "",
              city ? `City: ${city}` : "",
              notes ? `Details: ${notes}` : "",
              file ? `(Reference file: ${file.name} — please send via WhatsApp)` : "",
            ]
              .filter(Boolean)
              .join("\n");
            window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
            toast.success("Opening WhatsApp", {
              description: "Send your message and any reference files to complete your quote request.",
            });
            (e.target as HTMLFormElement).reset();
            setFile(null);
          }}
          className="rounded-lg border border-border bg-background p-6 shadow-sm md:p-8"
        >

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required><Input required name="name" /></Field>
            <Field label="WhatsApp / Phone" required><Input required name="phone" type="tel" placeholder="+92 3XX XXXXXXX" /></Field>
          </div>
          <Field label="Email"><Input name="email" type="email" /></Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type of sign" required>
              <Select name="type">
                <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
                <SelectContent>
                  {["3D Sign Board", "LED Neon Sign", "Acrylic Sign", "Shop Sign", "Office Sign", "Restaurant Sign", "Salon Sign", "Name Plate", "Home Wall Decor", "Other"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Approx. size (WxH)"><Input name="size" placeholder='e.g. 24" x 36"' /></Field>
          </div>
          <Field label="City"><Input name="city" placeholder="Multan" /></Field>

          <Field label="Tell us about it" required>
            <Textarea required name="notes" rows={4} placeholder="Text on the sign, colours, materials, install location, deadline…" />
          </Field>

          <Field label="Reference file (optional)">
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-3 text-sm hover:border-[color:var(--color-gold)]">
              <UploadCloud className="h-4 w-4 text-[color:var(--color-gold)]" />
              <span className="text-muted-foreground">{file ? file.name : "Upload logo, sketch or reference image"}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept="image/*,.pdf,.ai,.svg" />
            </label>
          </Field>

          <Button type="submit" size="lg" className="mt-6 w-full bg-foreground text-background hover:bg-foreground/90">
            Request my quote
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">By submitting, you agree to be contacted about your project. We never share your details.</p>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <Label className="mb-1.5 block text-sm">{label}{required && <span className="ml-1 text-[color:var(--color-gold)]">*</span>}</Label>
      {children}
    </div>
  );
}
