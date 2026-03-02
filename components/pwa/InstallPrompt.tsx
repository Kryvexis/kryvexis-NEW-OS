"use client";

import React from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari
  // @ts-expect-error - nonstandard
  const iosStandalone = window.navigator.standalone === true;
  // Chrome/Edge
  const mql = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  return iosStandalone || mql;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (isStandalone()) return;

    const key = "kx_pwa_install_dismissed_v1";
    setDismissed(localStorage.getItem(key) === "1");

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (dismissed || isStandalone()) return null;

  const dismiss = () => {
    try {
      localStorage.setItem("kx_pwa_install_dismissed_v1", "1");
    } catch {}
    setDismissed(true);
  };

  const onInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") dismiss();
    setDeferred(null);
  };

  // Only show on mobile-ish widths.
  // This keeps desktop clean while still allowing desktop install via browser menu if needed.
  return (
    <div className="fixed inset-x-0 bottom-16 z-50 px-3 md:hidden">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/70 backdrop-blur p-3 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Install Kryvexis OS</div>
            <div className="text-xs text-white/70">
              {isIOS()
                ? "On iPhone: Share → Add to Home Screen."
                : deferred
                ? "Add to your home screen for a faster, app-like experience."
                : "Use your browser menu to “Install app” (if available)."}
            </div>
          </div>

          <button
            onClick={dismiss}
            className="shrink-0 rounded-xl px-2 py-1 text-xs text-white/70 hover:text-white"
            aria-label="Dismiss install prompt"
          >
            ✕
          </button>
        </div>

        {!isIOS() && deferred ? (
          <div className="mt-2 flex justify-end">
            <button
              onClick={onInstall}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              Install
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
