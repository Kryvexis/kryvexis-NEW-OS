"use client";
type Props = { value: "cards" | "table"; onChange: (v: "cards" | "table") => void; className?: string; };
export function MobileTableToggle({ value, onChange, className }: Props) {
  return (
    <div className={["kx-toggle", className].filter(Boolean).join(" ")} role="group" aria-label="View mode">
      <button type="button" className={["kx-toggle-btn", value === "cards" ? "is-active" : ""].join(" ")} onClick={() => onChange("cards")}>Cards</button>
      <button type="button" className={["kx-toggle-btn", value === "table" ? "is-active" : ""].join(" ")} onClick={() => onChange("table")}>Table</button>
    </div>
  );
}
