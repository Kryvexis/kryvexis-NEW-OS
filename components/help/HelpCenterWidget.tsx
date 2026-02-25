"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { startTourStep, endTourStep } from "@/lib/tour";
import { Modal } from "@/components/ui/Modal";

type TourStep = {
  id: string;
  title: string;
  body: string;
  selector: string;
  href?: string;
};

const STEPS: TourStep[] = [
  {
    id: "nav-dashboard",
    title: "Dashboard",
    body: "Your overview: sales, totals, and quick actions.",
    selector: "[data-tour='nav-dashboard']",
    href: "/dashboard",
  },
  {
    id: "nav-products",
    title: "Products",
    body: "Add products/services. These feed Quotes and Invoices.",
    selector: "[data-tour='nav-products']",
    href: "/products",
  },
  {
    id: "nav-quotes",
    title: "Quotes",
    body: "Create a quote and convert it to an invoice when accepted.",
    selector: "[data-tour='nav-quotes']",
    href: "/quotes",
  },
  {
    id: "nav-invoices",
    title: "Invoices",
    body: "Track invoices and print when needed. Print pages stay white.",
    selector: "[data-tour='nav-invoices']",
    href: "/invoices",
  },
  {
    id: "nav-help",
    title: "Help Center",
    body: "Support contact, guides, and how-to instructions live here.",
    selector: "[data-tour='nav-help']",
    href: "/help",
  },
];

function isMobile() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function useTourPopover(targetSelector: string | null) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    if (!targetSelector) return;
    const el = document.querySelector(targetSelector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }

    const update = () => setRect(el.getBoundingClientRect());
    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro.disconnect();
    };
  }, [targetSelector]);

  return rect;
}

export default function HelpCenterWidget() {
  // Auto-run tour on first login
  React.useEffect(() => {
    const done = localStorage.getItem("kx-tour-done");
    if (!done) {
      startTour();
      localStorage.setItem("kx-tour-done", "1");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [open, setOpen] = React.useState(false);
  const [tourOn, setTourOn] = React.useState(false);
  const [stepIdx, setStepIdx] = React.useState(0);

  const pathname = usePathname() || "";
  const router = useRouter();

  const step = STEPS[stepIdx] ?? null;
  const rect = useTourPopover(tourOn && step ? step.selector : null);

  // Keyboard: ? to open
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) setOpen(true);
      if (e.key === "Escape") {
        if (tourOn) stopTour();
        else setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourOn]);

  function stopTour() {
    if (step) endTourStep(step.selector);
    setTourOn(false);
  }

  async function goToStep(nextIdx: number) {
    const next = STEPS[nextIdx];
    if (!next) return;

    // Clean previous highlight
    if (step) endTourStep(step.selector);

    // Navigate if needed
    if (next.href && pathname !== next.href && !pathname.startsWith(next.href + "/")) {
      router.push(next.href);
      // wait for route + layout to paint
      await new Promise((r) => setTimeout(r, 380));
    }

    // Highlight after render
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r, 60));
    startTourStep(next.selector);
    setStepIdx(nextIdx);
  }

  async function startTour() {
    setOpen(false);
    setTourOn(true);
    setStepIdx(0);
    await goToStep(0);
  }

  async function next() {
  if (stepIdx >= STEPS.length - 1) {
    stopTour();
    return;
  }
  const nxt = Math.min(stepIdx + 1, STEPS.length - 1);
  await goToStep(nxt);
}

  async function prev() {
    const prv = Math.max(stepIdx - 1, 0);
    await goToStep(prv);
  }

  // Close overlay when route changes and tour is off
  React.useEffect(() => {
    if (!tourOn) return;
    // Ensure highlight exists after navigation
    const t = setTimeout(() => {
      const s = STEPS[stepIdx];
      if (s) startTourStep(s.selector);
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Floating button (premium)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="kx-fab"
        aria-label="Help center"
        data-tour="help-fab"
      >
        <span className="text-lg font-semibold">?</span>
      </button>

      <Modal open={open} title="Help Center" onClose={() => setOpen(false)}>
        <div className="grid gap-5">
          <div className="kx-card p-4">
            <div className="text-sm font-semibold text-[rgba(var(--kx-fg),.92)]/90">Guided tour</div>
            <div className="text-sm kx-muted mt-1">A quick walkthrough of the main screens.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="kx-button" onClick={startTour}>Start tour</button>
              <Link className="kx-button" href="/help" onClick={() => setOpen(false)}>Open Help & Support page</Link>
            </div>
          </div>

          <div className="kx-card p-4">
            <div className="text-sm font-semibold text-[rgba(var(--kx-fg),.92)]/90">Quick answers</div>
            <div className="mt-2 grid gap-2 text-sm text-[rgba(var(--kx-fg),.92)]/75">
              <div><span className="text-[rgba(var(--kx-fg),.92)]/90 font-medium">Add products:</span> Products → Add product/service → Save.</div>
              <div><span className="text-[rgba(var(--kx-fg),.92)]/90 font-medium">Create quote:</span> Quotes → New Quote → Select client → Add items → Save.</div>
              <div><span className="text-[rgba(var(--kx-fg),.92)]/90 font-medium">Invoice:</span> Convert quote to invoice or create new invoice.</div>
            </div>
          </div>

          <div className="kx-card p-4">
            <div className="text-sm font-semibold text-[rgba(var(--kx-fg),.92)]/90">Support</div>
            <div className="text-sm kx-muted mt-2">
              Email:{" "}
              <a className="kx-link" href="mailto:kryvexissolutions@gmail.com">kryvexissolutions@gmail.com</a>
              <br />
              WhatsApp:{" "}
              <a className="kx-link" href="https://wa.me/27686282874" target="_blank" rel="noreferrer">+27 68 628 2874</a>
            </div>
          </div>
        </div>
      </Modal>

      {/* Tour popover */}
      {tourOn && step && (
        <div
          className="fixed z-[9999]"
          style={popoverStyle(rect)}
          role="dialog"
          aria-label="Guided tour"
        >
          <div className="kx-card p-4 w-[320px] max-w-[85vw]">
            <div className="text-xs text-[rgba(var(--kx-fg),.92)]/50">{stepIdx + 1} / {STEPS.length}</div>
            <div className="mt-1 text-sm font-semibold text-[rgba(var(--kx-fg),.92)]/90">{step.title}</div>
            <div className="mt-1 text-sm kx-muted">{step.body}</div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button className="kx-button" onClick={stopTour}>End</button>
              <div className="flex gap-2">
                <button className="kx-button" onClick={prev} disabled={stepIdx === 0}>Back</button>
                <button className="kx-button" onClick={next} disabled={stepIdx === STEPS.length - 1}>{stepIdx === STEPS.length - 1 ? "Finish" : "Next"}</button>
              </div>
            </div>

            {isMobile() && (
              <div className="mt-3 text-xs text-[rgba(var(--kx-fg),.92)]/45">
                Tip: Tap the highlighted menu item if you want to open it manually.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function popoverStyle(rect: DOMRect | null): React.CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const maxW = Math.min(360, vw - 24);
  const pad = 12;

  if (!rect) return { top: 86, right: 18 };

  // Prefer right side if there's space, else place below
  if (vw - rect.right > maxW + 24) {
    return { top: clamp(rect.top - 6, 12, vh - 220), left: rect.right + pad };
  }
  return { top: clamp(rect.bottom + pad, 12, vh - 220), left: clamp(rect.left, 12, vw - maxW - 12) };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
