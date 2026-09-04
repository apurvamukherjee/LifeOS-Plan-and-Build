# Capacitor Android Wrapper

This wraps the existing web build in a native Android shell via [Capacitor](https://capacitorjs.com/).
See `docs/ROADMAP.md` for *why* this exists (the reminder-reliability threshold) — this doc is
the *how*.

## Status

**Android: scaffolded and verified working, not just "compiles."** `npx cap add android`
generated the `android/` project; `./gradlew assembleDebug` produces a real debug APK
(`android/app/build/outputs/apk/debug/app-debug.apk`, ~4.4MB). It was installed via
`adb install` on a real booted emulator (an existing AVD already on this machine) and:
- launched successfully (`adb shell am start -n com.lifeos.app/.MainActivity`) and rendered the
  actual LifeOS home screen — companion, weekly overview, all 9 module cards — pixel-identical
  to the browser version, inside the native WebView shell with the Android status bar visible;
- responded to a real touch input (`adb shell input tap`) by navigating to the Medication page
  through React Router, rendering that page's actual content (including its in-app-reminder
  disclaimer text and empty state) and updating the active tab in the bottom nav.

This confirms touch input, client-side routing, and IndexedDB/React all work correctly inside
the native shell — not merely that the Gradle build succeeds.

**iOS: not attempted, not possible from this environment.** iOS builds require Xcode, which is
macOS-only. `@capacitor/ios` was deliberately not installed. If iOS support is ever needed, it
has to be done from a Mac.

**What this wrapper does NOT yet do:** it's a bare WebView shell around the existing PWA — no
native plugins are wired up. In particular, `@capacitor/local-notifications` (the actual reason
Capacitor was ever on the roadmap — see `docs/ARCHITECTURE.md`, "Reminder service") is not
installed or integrated. Reminders inside this native build behave exactly like they do in the
browser (in-app-only, foreground-only) until that plugin is added. Treat this as "the shell is
proven to work," not "native reminders are solved."

## Prerequisites (already satisfied on this machine, note them if setting up elsewhere)

- Java 17+ (a newer JDK — 21+ — is required specifically for compiling `capacitor-android`
  itself; if your default `JAVA_HOME` is Java 17, export a newer one just for the build, see
  below).
- Android SDK with at least one platform + build-tools installed, `ANDROID_HOME` set.
- (Optional, for the install/launch verification) an Android emulator AVD, or a physical device
  with USB debugging enabled.

## Building

```bash
npm run build                # regenerate dist/ from the latest web source
npx cap sync android          # copy dist/ into android/app/src/main/assets/public + sync native deps
cd android
JAVA_HOME="<path to a JDK 21+>" ./gradlew assembleDebug   # only needed if your default JDK is older
```

The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

**Gotcha hit during setup:** the default `JAVA_HOME` on this machine pointed at a JDK 17
install, but `capacitor-android`'s Gradle module targets Java 21, which fails with `invalid
source release: 21` under a compiler older than that target — a JDK can only compile *up to* its
own version. Fixed by pointing `JAVA_HOME` at a JDK 25 install already present on the machine for
the `gradlew` invocation specifically (JDK 25 can still target the older `--release 21`).

## Installing and running on an emulator/device

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.lifeos.app/.MainActivity
```

## Whenever the web app changes

Any change to `src/` needs `npm run build && npx cap sync android` before it shows up in the
native app — the Android project has its own copy of the built assets
(`android/app/src/main/assets/public/`), it does not read `src/` directly.

## Repo layout notes

- `android/` is committed to version control (this is normal for Capacitor/native projects) —
  **except** `android/local.properties` (machine-specific SDK path — already gitignored by the
  generated `android/.gitignore`) and the usual Gradle build output directories.
- `capacitor.config.ts` at the repo root — `appId: 'com.lifeos.app'` is a placeholder. Change it
  to a domain you actually own before ever publishing to the Play Store; the package name is
  permanent after the first release.
- A `known dev-dependency advisory`: `npm audit` flags a moderate `uuid` vulnerability via
  `@capacitor/cli`'s `xcode` dependency (iOS tooling we don't use, since only Android is
  installed here). It's a build-time-only dev dependency, never shipped to end users — low
  practical risk, not fixed via `npm audit fix --force` since that would force a breaking
  `@capacitor/cli` major-version bump for a package we don't exercise.

## Next steps if this gets picked up further

1. Add `@capacitor/local-notifications` and wire it into `engine/reminders/` behind the same
   `GoalEvaluator`-driven scheduling that already exists, so reminders become genuinely reliable
   in the background — this is the actual payoff the roadmap's threshold was about.
2. Real app icon / splash screen (currently using Capacitor's default Android resources, not
   `public/icons/icon-*.png`).
3. A release (signed) build + Play Store listing, once ready to distribute — the debug APK above
   is not suitable for that.
