// Kryvexis OS RBAC helpers (Option B schema)
// Minimal, build-safe module typing + shared constants.

export const APP_MODULES = [
  'sales',
  'procurement',
  'accounting',
  'operations',
  'insights',
  'settings',
] as const

export type AppModule = (typeof APP_MODULES)[number]

export function isAppModule(v: string): v is AppModule {
  return (APP_MODULES as readonly string[]).includes(v)
}
