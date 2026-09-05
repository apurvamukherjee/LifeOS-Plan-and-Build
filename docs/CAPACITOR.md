# Capacitor Android Wrapper

This wraps the existing web build in a native Android shell via [Capacitor](https://capacitorjs.com/).
See `docs/ROADMAP.md` for *why* this exists (the reminder-reliability threshold) — this doc is
the *how*.

## Status

**Android: built, installed, and verified working — including real native reminders, not just
"the shell runs."** `npx cap add android` generated the `android/` project; `./gradlew
assembleDebug` produces a real debug APK (`android/app/build/outputs/apk/debug/app-debug.apk`).
Installed via `adb install` on a real booted emulator and verified:
- launches and renders the actual LifeOS home screen — companion, weekly overview, all 9 module
  cards — pixel-identical to the browser version, inside the native WebView shell;
- responds to real touch input, navigating via React Router and rendering real page content with
  the bottom nav updating correctly (proves IndexedDB/React work inside the native shell, not
  just that it boots);
- `@capacitor/local-notifications` is installed and wired into `engine/reminders/` — setting a
  reminder (the `ReminderToggle` control on Medication/Task rows) registers a real OS-level
  scheduled notification via `LocalNotifications.schedule()`, verified to actually fire (visible
  in the Android notification shade) with the app **closed**, which the in-app-only poll could
  never do. This is the concrete fix for the reminder-reliability threshold in `docs/ROADMAP.md`.

**iOS: not attempted, not possible from this environment.** iOS builds require Xcode, which is
macOS-only. `@capacitor/ios` was deliberately not installed. If iOS support is ever needed, it
has to be done from a Mac.

## How native reminders work

`engine/reminders/nativeNotifications.ts` wraps `@capacitor/local-notifications`:
`scheduleNativeReminder(reminder)` registers a repeating (`on: {hour, minute}`) or one-off (`at`)
OS notification, keyed by a numeric id derived from the reminder's uuid (the plugin requires a
32-bit int, reminders use uuid strings). `engine/reminders/reminderActions.ts`'s
`setDailyReminder`/`removeDailyReminder` are the entry points the UI calls — they write the
`reminders` Dexie row *and* call the native scheduler, so the two stay in sync. On the plain web
(no native platform), `scheduleNativeReminder`/`cancelNativeReminder` are no-ops, and
`reminderScheduler.ts`'s existing in-app foreground poll (see `docs/ARCHITECTURE.md`) takes over
as the fallback — `startReminderScheduler()` checks `Capacitor.isNativePlatform()` and doesn't
even start the poll on native, since the OS notification supersedes it there.

## Prerequisites (already satisfied on this machine, note them if setting up elsewhere)

- **The right JDK matters more than "any JDK 21+" — see the Gradle/JDK gotcha below before
  assuming your default `java` works.**
- Android SDK with at least one platform + build-tools installed, `ANDROID_HOME` set.
- (Optional, for the install/launch verification) an Android emulator AVD, or a physical device
  with USB debugging enabled.

## Building

```bash
npm run build                # regenerate dist/ from the latest web source
npx cap sync android          # copy dist/ into android/app/src/main/assets/public + sync native deps
cd android
JAVA_HOME="<see below>" ./gradlew assembleDebug
```

The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

**The JDK gotcha, in full (two different failures, two different reasons):**
1. This machine's *default* `JAVA_HOME` pointed at a JDK 17 install, but `capacitor-android`'s
   Gradle module targets Java 21 for compilation, which fails with `invalid source release: 21`
   under a compiler older than that target — a JDK can only compile *up to* its own version.
2. The obvious fix — point `JAVA_HOME` at the newest JDK on the machine (a JDK 25 install) —
   compiles fine but then fails a **different** way once a native plugin (`@capacitor/local-notifications`)
   forced a fresh Gradle settings/plugin resolution: `BUG! exception in phase 'semantic
   analysis' ... Unsupported class file major version 69`. This is Gradle's own Groovy engine
   failing to *run itself* on JDK 25 — the "Java 24 support" Gradle 8.14.3 advertises is the
   ceiling for the JDK that *hosts* Gradle, which is a separate question from what Gradle can
   *target* when compiling. JDK 25 is newer than Gradle 8.14.3 itself supports running on.
   - The fix that actually works: use the JDK bundled with **Android Studio itself** (it ships a
     JetBrains Runtime specifically validated against the Android Gradle Plugin) —
     `C:\Program Files\Android\Android Studio\jbr` on this machine, JDK 21. Being both new
     enough to satisfy the Java-21 compile target and old enough for Gradle 8.14.3 to run on is
     exactly the sweet spot a plain "install the latest JDK" instinct will miss.
   - **Takeaway if this breaks again on a different machine:** don't reach for the newest
     installed JDK — reach for Android Studio's bundled one first (`<Android Studio
     install>/jbr`), since it's guaranteed compatible with whatever Android Gradle Plugin
     version ships alongside it.

## Installing and running on an emulator/device

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.lifeos.app/.MainActivity
```

## Whenever the web app changes

Any change to `src/` needs `npm run build && npx cap sync android` (then a rebuild) before it
shows up in the native app — the Android project has its own copy of the built assets
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

1. Real app icon / splash screen (currently using Capacitor's default Android resources, not
   `public/icons/icon-*.png`).
2. A release (signed) build + Play Store listing, once ready to distribute — the debug APK above
   is not suitable for that.
3. `ReminderToggle` currently assumes at most one active reminder per entity — fine for the
   Medication/Task use cases it's wired into, but would need revisiting for anything wanting
   multiple reminders per item (e.g. "8am and 8pm").
4. Android 13+ requires a runtime notification permission — `requestNativeNotificationPermission()`
   requests it the first time a reminder is set, but there's no in-app messaging yet for what to
   do if the user denies it (the reminder row is still created; it just won't visibly notify).
5. Android 12+ also gates *exact-time* alarms behind a separate special permission ("Alarms &
   reminders", `SCHEDULE_EXACT_ALARM`) that can't be granted via a normal runtime dialog —
   `@capacitor/local-notifications` itself detects this and deep-links the user to that system
   Settings screen the first time `schedule()` needs it. This is expected OS behavior, not an app
   bug: verified on a real build that until the user flips that one toggle, the alarm silently
   never reaches `AlarmManager` (confirmed via `adb shell dumpsys alarm` showing nothing for the
   package); after granting it once, `dumpsys alarm` shows a real `RTC_WAKEUP` entry
   (`TimedNotificationPublisher`) and the notification fires on schedule with the app fully
   backgrounded. No in-app messaging exists yet for "you still need to grant this" if the user
   backs out of that settings screen without enabling it.
