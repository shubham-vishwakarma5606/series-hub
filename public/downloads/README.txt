SERIES HUB — ANDROID APK DROP-IN FOLDER
=======================================

The website's "Get the App" modal / footer badges / smart banner are all driven
by ONE file next to this readme:

    android.json   →  app metadata + availability flag

To publish the Android app download on the website:

  1. BUILD THE SIGNED APK (needs Android Studio locally — not buildable in CI
     sandboxes without the Android SDK):

        npm install
        npm run cap:android          # creates android/ via Capacitor
        npx cap open android         # opens Android Studio
        # Android Studio → Build → Generate Signed App Bundle / APK
        # → APK → create/choose keystore → release
        # Output: android/app/release/app-release.apk

     (Debug build for a quick test: Build → Build APK(s) → app-debug.apk)

  2. RENAME the APK to  series-hub.apk  and drop it INTO THIS FOLDER.

  3. EDIT android.json:

        "available": true,
        "version": "1.0.0",
        "sizeBytes": 8123456,          ← real byte size (shown in the UI)
        "updated": "2026-08-15"

  4. Commit + deploy. The website's "Download APK" button lights up
     automatically — no code change needed (the UI fetches android.json,
     so the push itself is the switch).

ALTERNATIVE — GITHUB RELEASES HOSTING (for large APKs / version history):

  gh release create v1.0.0 series-hub.apk --title "Series Hub for Android v1.0.0"

  then point android.json at the release asset:

  "url": "https://github.com/shubham-vishwakarma5606/series-hub/releases/latest/download/series-hub.apk"
  "available": true

NOTE: Content-Security-Policy is satisfied either way — 'self' for the local
file; anchor navigations to https: releases are not blocked by CSP.
The PWA (Add to Home screen / browser "Install app") remains available even
while "available" is false, and is the recommended install path today.
Radhe Radhe — keep the APK signed with a keystore you back up; Play-free
distribution still requires the same signing key for updates.
