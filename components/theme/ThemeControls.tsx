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
    localStorage.setItem("kx_accent", value);
  } catch {}
}

function getAccent(): Accent {
  try {
    const v = localStorage.getItem("kx_accent");
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
        <div className="text-sm text-white/60">Light/dark mode + accent color.</div>
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
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white")
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

      <div className="text-xs text-white/55">
        Accent is applied instantly. It controls highlights, dots, and subtle glows.
      </div>
    </div>
  );
}
