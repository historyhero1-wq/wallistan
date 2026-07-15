import { CountdownBar } from "./countdown-bar";
import { BRAND, whatsappLink } from "@/lib/catalog";

const messages = [
  "Premium 3D Signage",
  "Free Delivery Across Pakistan",
  "Cash on Delivery Available",
  "Custom Orders Available",
  "Use code SIGNORA10 for 10% off",
  "Open Parcel Before Payment",
];

function MarqueeSegment() {
  const items = [...messages, ...messages];
  return (
    <div className="flex shrink-0 items-center gap-6 whitespace-nowrap px-4">
      {items.map((m, i) => (
        <span key={`${m}-${i}`} className="inline-flex items-center gap-6">
          {m}
          <span className="text-[color:var(--color-gold)]" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export function AnnouncementBar() {
  return (
    <div>
      <CountdownBar />
      <div className="border-b border-[color:var(--color-gold)]/25 bg-[color:var(--color-background)] text-[11px] font-semibold text-[color:var(--color-maroon)]">
        <div className="relative flex h-9 items-center overflow-hidden">
          <div className="animate-marquee flex w-max items-center uppercase tracking-[0.22em]">
            <MarqueeSegment />
            <div aria-hidden>
              <MarqueeSegment />
            </div>
          </div>
          <a
            href={whatsappLink("Hi Wallistan — I'd like a quote.")}
            className="hidden shrink-0 items-center gap-1.5 border-l border-[color:var(--color-gold)]/30 bg-[color:var(--color-maroon)] px-4 font-medium text-[color:var(--color-gold)] sm:inline-flex sm:h-9"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp {BRAND.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
