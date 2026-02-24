export function startTourStep(selector: string){
  const el = document.querySelector(selector) as HTMLElement | null;
  if(!el) return;

  // Add overlay
  let overlay = document.getElementById("kx-tour-overlay");
  if(!overlay){
    overlay = document.createElement("div");
    overlay.id = "kx-tour-overlay";
    overlay.className = "kx-tour-overlay";
    document.body.appendChild(overlay);
  }

  el.classList.add("kx-tour-highlight");
}

export function endTourStep(selector: string){
  const el = document.querySelector(selector) as HTMLElement | null;
  if(el) el.classList.remove("kx-tour-highlight");

  const overlay = document.getElementById("kx-tour-overlay");
  if(overlay) overlay.remove();
}
