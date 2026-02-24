"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

type TourStep = {
  id: string;
  title: string;
  body: string;
  route?: string;
  selector?: string;
};

const KEY = "kx_tour_v1";

const STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Kryvexis OS",
    body: "Quick tour: we’ll show you where everything lives so you can start quoting and invoicing fast.",
    route: "/dashboard",
  },
  {
    id: "nav-dashboard",
    title: "Dashboard",
    body: "Your command center — totals, trends, and quick actions.",
    route: "/dashboard",
    selector: '[data-tour="nav-dashboard"]',
  },
  {
    id: "new-quote",
    title: "Create a quote",
    body: "Start here for most sales. You can convert a quote into an invoice in one click.",
    route: "/dashboard",
    selector: '[data-tour="new-quote"]',
  },
  {
    id: "nav-clients",
    title: "Clients",
    body: "Add client details once, then reuse them on quotes and invoices.",
    route: "/clients",
    selector: '[data-tour="nav-clients"]',
  },
  {
    id: "nav-products",
    title: "Products",
    body: "Store SKUs, cost, and selling price — speeds up quoting.",
    route: "/products",
    selector: '[data-tour="nav-products"]',
  },
  {
    id: "nav-quotes",
    title: "Quotes",
    body: "Manage quotes, send to clients, and convert to invoices.",
    route: "/quotes",
    selector: '[data-tour="nav-quotes"]',
  },
  {
    id: "nav-invoices",
    title: "Invoices",
    body: "Track statuses, print / save PDFs, and manage balances.",
    route: "/invoices",
    selector: '[data-tour="nav-invoices"]',
  },
  {
    id: "nav-payments",
    title: "Payments",
    body: "Record EFT / cash payments and keep accounts clean.",
    route: "/payments",
    selector: '[data-tour="nav-payments"]',
  },
  {
    id: "nav-settings",
    title: "Settings",
    body: "Company setup, preferences, and system options.",
    route: "/settings",
    selector: '[data-tour="nav-settings"]',
  },
  {
    id: "help",
    title: "Help Center",
    body: "Anytime you’re stuck, tap the “?” for quick guides and support.",
    route: "/dashboard",
    selector: '[data-tour="help-button"]',
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Onboarding() {
  const router = useRouter();
  const pathname = usePathname() || "";

  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [tipPos, setTipPos] = React.useState<{ top: number; left: number } | null>(null);

  const current = STEPS[step];

  // Auto-start for brand new users (localStorage based).
  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(KEY) === "1";
      if (!seen) {
        setOpen(true);
        setStep(0);
      }
    } catch {
      // ignore
    }
  }, []);

  // Allow starting tour from Help Center.
  React.useEffect(() => {
    const onStart = () => {
      try {
        localStorage.removeItem(KEY);
      } catch {
        // ignore
      }
      setOpen(true);
      setStep(0);
    };
    window.addEventListener("kx:tour:start", onStart);
    return () => window.removeEventListener("kx:tour:start", onStart);
  }, []);

  // Navigate to the step route.
  React.useEffect(() => {
    if (!open) return;
    if (current?.route && pathname !== current.route) {
      router.push(current.route);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  // Compute highlight rect.
  React.useEffect(() => {
    if (!open) return;

    let raf = 0;
    const compute = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!current?.selector) {
          setRect(null);
          setTipPos({ top: 96, left: 24 });
          return;
        }

        const el = document.querySelector(current.selector) as HTMLElement | null;
        if (!el) {
          setRect(null);
          setTipPos({ top: 96, left: 24 });
          return;
        }
        const r = el.getBoundingClientRect();
        setRect(r);

        // Tooltip placement near element, staying in viewport.
        const pad = 16;
        const preferredTop = r.top + r.height + 12;
        const preferredLeft = r.left;
        const top = clamp(preferredTop, pad, window.innerHeight - 220);
        const left = clamp(preferredLeft, pad, window.innerWidth - 360);
        setTipPos({ top, left });
      });
    };

    // Delay to allow route transitions to paint.
    const t = window.setTimeout(compute, 150);
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
      cancelAnimationFrame(raf);
    };
  }, [open, step, pathname, current?.selector]);

  function finish() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  if (!open) return null;

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Dim + blur overlay */}
      <div className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />

      {/* Spotlight highlight */}
      {rect && (
        <div
          className="fixed z-[61] pointer-events-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: 18,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.02)",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="fixed z-[62] w-[92vw] max-w-[340px] rounded-2xl border border-white/10 bg-[#0b0f1a]/95 shadow-2xl p-4"
        style={
          tipPos
            ? { top: tipPos.top, left: tipPos.left }
            : { top: "20vh", left: "50%", transform: "translateX(-50%)" }
        }
      >
        <div className="text-xs text-white/60 mb-1">
          Step {step + 1} of {STEPS.length}
        </div>
        <div className="text-base font-semibold tracking-tight">{current.title}</div>
        <div className="mt-1 text-sm text-white/70 leading-relaxed">{current.body}</div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            className="kx-btn"
            onClick={finish}
            aria-label="Skip tour"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button type="button" className="kx-btn" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                Back
              </button>
            )}
            <button
              type="button"
              className="kx-btn-primary"
              onClick={() => {
                if (isLast) finish();
                else setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }}
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
