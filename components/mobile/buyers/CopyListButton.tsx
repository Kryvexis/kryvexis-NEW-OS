"use client";

import { useState } from "react";

export default function CopyListButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-2xl bg-zinc-900 px-4 py-3 font-semibold text-white dark:bg-zinc-800"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
