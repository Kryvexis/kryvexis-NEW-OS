import fs from "fs";
import path from "path";

const root = process.cwd();

const targets = [
  "app/login/page.tsx",
  "app/login/page.jsx",
  "app/boot/page.tsx",
  "app/boot/page.jsx",
];

function del(p){
  const full = path.join(root, p);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { force: true });
    console.log("Deleted:", p);
  } else {
    console.log("OK (not found):", p);
  }
}

console.log("Kryvexis route fix v2");
console.log("Project root:", root);
console.log("Removing duplicate /login and /boot routes in app/ ...");
targets.forEach(del);

console.log("\nDone.");
console.log("Now restart: Ctrl+C then npm run dev");
