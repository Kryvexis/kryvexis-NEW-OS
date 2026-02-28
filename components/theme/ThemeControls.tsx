"use client";

import * as React from "react";

type Accent = { name: string; value: string; rgb: string };

const ACCENTS: Accent[] = [
  { name: "Cyan", value: "cyan", rgb: "34 211 238" },
  { name: "Blue", value: "blue", rgb: "59 130 246" },
  { name: "Purple", value: "purple", rgb: "168 85 247" },
  { name: "Green", value: "green", rgb: "34 197 94" },
  { name: "Orange", value: "orange", rgb: "249 115 22" },
];

function applyAccent(rgb: string, value: string) {
  try {
    document.documentElement.style.setProperty("--kx-accent", rgb);
    localStorage.setItem("kx_accent_v2", value);
  } catch {}
}

function getAccent(): Accent {
  try {
    const v = localStorage.getItem("kx_accent_v2");
    const found = ACCENTS.find((a) => a.value === v);
    if (found) return found;
  } catch {}
  return ACCENTS[0];
}

export default function ThemeControls() {
  const [accent, setAccent] = React.useState<Accent>(ACCENTS[0]);

  React.useEffect(() => {
    const a = getAccent();
    setAccent(a);
    applyAccent(a.rgb, a.value);
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold">Theme</div>
        <div className="text-sm kx-muted">Light/dark mode + accent color.</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ACCENTS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => {
              setAccent(a);
              applyAccent(a.rgb, a.value);
            }}
            className={
              "rounded-xl border px-3 py-2 text-sm transition " +
              (accent.value === a.value
                ? "border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-border),.10)] text-[rgba(var(--kx-fg),.92)]"
                : "border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] text-[rgba(var(--kx-fg),.78)] hover:bg-[rgba(var(--kx-border),.10)] hover:text-[rgba(var(--kx-fg),.92)]")
            }
          >
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
              style={{ background: `rgb(${a.rgb.replaceAll(" ", ",")})` }}
            />
            {a.name}
          </button>
        ))}
      </div>

      <div className="text-xs kx-muted2">
        Accent is applied instantly. It controls highlights, dots, and subtle glows.
      </div>
    </div>
  );
}
