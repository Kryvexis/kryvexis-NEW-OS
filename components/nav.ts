// Shim to guarantee `./nav` resolves with the expected named exports.
// Some setups may resolve `./nav` to the `components/nav/` directory (which may not export these),
// causing build failures in `components/command-palette.tsx`.
// This file takes precedence and re-exports from the actual implementation.

export { navMainItems, navBottomItems } from "./nav.tsx";
