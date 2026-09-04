import type { CapacitorConfig } from '@capacitor/cli'

// appId is a placeholder (reverse-DNS style) — change it to a real, permanently-owned domain
// before ever publishing to the Play Store; the package name cannot change after first release.
// See docs/CAPACITOR.md for the full setup/build/verification story.
const config: CapacitorConfig = {
  appId: 'com.lifeos.app',
  appName: 'LifeOS',
  webDir: 'dist',
}

export default config
