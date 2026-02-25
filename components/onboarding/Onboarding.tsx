"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";

const KEY = "kx_onboarding_v1";

export default function Onboarding() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(KEY) === "1";
      if (!seen) setOpen(true);
    } catch {
      // ignore
    }
  }, []);

  function closeAndRemember() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  return (
    <>
      <button className="kx-button" type="button" onClick={() => setOpen(true)}>
        Getting started
      </button>

      <Modal open={open} title="Welcome to Kryvexis OS" onClose={closeAndRemember}>
        <div className="grid gap-5">
          <div className="text-sm kx-muted">
            Kryvexis is designed as a simple 3-layer workflow. Follow this and you’ll be productive fast.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="kx-card">
              <div className="text-sm font-semibold">Layer 1 — Setup</div>
              <ul className="mt-2 text-sm kx-muted space-y-1 list-disc pl-5">
                <li>Add Suppliers</li>
                <li>Add Products (SKU, cost, selling price)</li>
                <li>Add Clients (contacts + addresses)</li>
              </ul>
            </div>

            <div className="kx-card">
              <div className="text-sm font-semibold">Layer 2 — Daily Work</div>
              <ul className="mt-2 text-sm kx-muted space-y-1 list-disc pl-5">
                <li>Create a Quote</li>
                <li>Convert Quote → Invoice</li>
                <li>Print / Save PDF + send to client</li>
              </ul>
            </div>

            <div className="kx-card">
              <div className="text-sm font-semibold">Layer 3 — Control</div>
              <ul className="mt-2 text-sm kx-muted space-y-1 list-disc pl-5">
                <li>Record Payments (cash / EFT)</li>
                <li>Track Accounts + Reports</li>
                <li>Settings + Help Center</li>
              </ul>
            </div>
          </div>

          <div className="kx-card">
            <div className="text-sm font-semibold">Pro tips</div>
            <ul className="mt-2 text-sm kx-muted space-y-1 list-disc pl-5">
              <li>Use the Help button (<span className="kx-kbd">?</span>) anytime.</li>
              <li>Start with 5–10 products and 1 test client to learn the flow.</li>
              <li>Keep SKUs consistent — it makes reporting and re-ordering easier.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button className="kx-btn" onClick={closeAndRemember} type="button">
              Not now
            </button>
            <button className="kx-btn-primary" onClick={closeAndRemember} type="button">
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
