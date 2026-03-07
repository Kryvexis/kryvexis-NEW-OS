'use client'

// Backwards-compatible re-export.
// Some older files may import from './nav.tsx' or '@/components/nav.tsx'.
// Keep this file as a thin wrapper.
export { Sidebar, NavIcon } from './navx'
export { navMainItems, navBottomItems, type NavItem } from './nav-items'
