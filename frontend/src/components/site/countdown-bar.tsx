import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

/** Rolling countdown: end of current Sunday 23:59 PKT. */
function nextSaleEnd(): number {
  const now = new Date();
  const end = new Date(now);
  const dayOfWeek = end.getDay(); // 0 = Sun
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  end.setDate(end.getDate() + daysUntilSunday);
  end.setHours(23, 59, 59, 0);
  return end.getTime();
}

export function CountdownBar() {
  const [target] = useState<number>(() => nextSaleEnd());
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = Math.max(0, target - now);
  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)]">
      <div className="container-luxe flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-[11px] uppercase tracking-[0.2em] sm:text-xs">
        <span className="opacity-80">⏱ Weekly Sale Ends In</span>
        <span className="flex items-center gap-1.5 font-mono font-semibold text-[color:var(--color-gold)]">
          <Chunk n={d} label="d" />
          <span aria-hidden>:</span>
          <Chunk n={h} label="h" />
          <span aria-hidden>:</span>
          <Chunk n={m} label="m" />
          <span aria-hidden>:</span>
          <Chunk n={s} label="s" />
        </span>
        <Link
          to="/shop"
          className="rounded-full bg-[color:var(--color-gold)] px-3 py-0.5 text-[10px] font-bold tracking-[0.18em] text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90"
        >
          Shop Sale
        </Link>
      </div>
    </div>
  );
}

function Chunk({ n, label }: { n: number; label: string }) {
  return (
    <span className="tabular-nums">
      {String(n).padStart(2, "0")}
      <span className="ml-0.5 opacity-70">{label}</span>
    </span>
  );
}
