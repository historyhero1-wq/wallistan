import { useEffect, useState } from "react";
import { X, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const KEY = "wallistan-newsletter-v1";
const CODE = "SIGNORA10";

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(t);
  }, []);

  function close() {
    setOpen(false);
    try { window.localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setDone(true);
    toast.success(`Welcome! Use code ${CODE} at checkout for 10% off.`);
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ email, ts: Date.now() }));
    } catch { /* ignore */ }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 animate-fade-in"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter signup"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[color:var(--color-gold)]/40 bg-background shadow-2xl animate-scale-in"
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="bg-[color:var(--color-maroon)] px-6 py-8 text-center text-[color:var(--color-maroon-foreground)]">
          <Gift className="mx-auto h-8 w-8 text-[color:var(--color-gold)]" />
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-gold)]">
            Welcome offer
          </div>
          <h3 className="mt-2 font-display text-3xl">Get 10% Off</h3>
          <p className="mt-2 text-sm opacity-85">
            Join our list for early access to new designs, restocks & studio sales.
          </p>
        </div>
        <div className="p-6">
          {done ? (
            <div className="text-center">
              <div className="mb-2 text-sm text-muted-foreground">Your code:</div>
              <div className="mb-4 rounded-md border-2 border-dashed border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 px-4 py-3 font-mono text-2xl font-bold tracking-widest text-[color:var(--color-maroon)]">
                {CODE}
              </div>
              <Button onClick={close} className="w-full rounded-full bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)] hover:bg-[color:var(--color-maroon)]/90">
                Start shopping
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11"
              />
              <Button type="submit" className="h-11 w-full rounded-full bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)] hover:bg-[color:var(--color-maroon)]/90">
                Reveal my 10% code
              </Button>
              <button
                type="button"
                onClick={close}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                No thanks
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
