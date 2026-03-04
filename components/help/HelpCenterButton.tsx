"use client";

import * as React from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";

export default function HelpCenterButton() {
  const [open, setOpen] = React.useState(false);

  // Quick keyboard: ? to open
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button className="kx-icon-btn" onClick={() => setOpen(true)} aria-label="Help">
        ?
      </button>

      <Modal open={open} title="Help Center" onClose={() => setOpen(false)}>
        <div className="grid gap-6">
          

          <section className="grid gap-2">
            <div className="text-sm font-semibold text-[rgba(var(--kx-fg),.92)]/90">Guides</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link className="kx-button justify-start" href="/help">
                Open Help & Support page
              </Link>
              <Link className="kx-button justify-start" href="/demo">
                View Demo walkthrough
              </Link>
            </div>
          </section>

          <section className="grid gap-2">
            <div className="text-sm font-semibold text-[rgba(var(--kx-fg),.92)]/90">Keyboard shortcuts</div>
            <div className="text-sm kx-muted">
              <span className="kx-kbd">?</span> opens this help center. <span className="kx-kbd">Esc</span> closes dialogs.
            </div>
          </section>

          <section className="grid gap-2">
            <div className="text-sm font-semibold text-[rgba(var(--kx-fg),.92)]/90">Contact</div>
            <div className="text-sm kx-muted grid gap-1">
              <a className="kx-auth-link" href="mailto:kryvexissolutions@gmail.com">
                kryvexissolutions@gmail.com
              </a>
              <a className="kx-auth-link" href="https://wa.me/27686282874" target="_blank" rel="noreferrer">
                WhatsApp +27 68 628 2874
              </a>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}
