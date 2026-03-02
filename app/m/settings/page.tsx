import SettingsPage from '@/app/(app)/settings/page'

export default async function MobileSettings() {
  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <div className="text-[13px] kx-muted">Settings</div>
        <div className="kx-h1">Preferences</div>
      </div>

      <SettingsPage />

      <div className="h-10" />
    </div>
  )
}
