# GlucoseBridge: Project Spec

## What it is
A mobile app for people who still check blood sugar with fingerstick meters and write readings in notebooks. The user points the phone camera at the meter, the app reads the number, saves it, and generates a one-page summary a doctor can read in seconds. Built for the Congressional App Challenge (submission deadline Oct 26, 2026).

## Users
Mainly older adults with Type 2 diabetes. Accessibility is the top design goal: large text, high contrast, one main action per screen, no hidden menus.

## Stack
- App: Expo (React Native, TypeScript), Expo Router, tabs layout. Tested with Expo Go on iPhone.
- Storage: AsyncStorage, on-device only. No accounts, no cloud database.
- Server: Python FastAPI in a separate folder (glucosebridge-server) with one endpoint, POST /read-meter. It receives a base64 JPEG and returns {"value": integer or null} using the Google Gemini API (free tier). The API key is read from the GEMINI_API_KEY environment variable and must NEVER be hardcoded or committed.

## Already built
- lib/storage.ts: Reading type, getReadings, addReading
- app/(tabs)/index.tsx: manual entry, tag buttons (Fasting, Before meal, After meal, Exercise), save, history list
- lib/scan.ts + lib/config.ts: camera capture and call to the server
- Server main.py with /read-meter

## Still to build (in this order, one at a time, commit after each)
1. Stats helper (lib/stats.ts): average, min, max, count, % low (<70), % in range, % high (>180). Target range must be editable in a settings option later.
2. Summary screen (app/(tabs)/explore.tsx, rename the tab to Summary): stats, a time-in-range bar, a trend line chart of the last 30 readings.
3. PDF export (expo-print + expo-sharing): one page, summary stats, table of the latest 60 readings, footer disclaimer.
4. Delete and edit a reading.
5. About/Privacy screen, first-launch consent screen, medical disclaimer, and a "Delete all my data" button.
6. Accessibility pass: accessibilityLabel on every button, text 18pt or larger, contrast at least 4.5:1.
7. Error handling: no internet, server asleep, camera denied, unreadable photo (always fall back to manual entry).
8. Deploy the server (Render) with the key as an environment variable, then update lib/config.ts.

## Rules
- A scanned number must NEVER be saved automatically. It goes into the input box so the user confirms or corrects it first.
- Show a visible disclaimer: GlucoseBridge is a logging tool, not medical advice. Make no accuracy, diagnostic, or FDA claims.
- Readings stay on the phone. Meter photos are sent only to read the number and are not stored.
- Keep code simple and readable. A high school student must be able to explain every file to judges.
- Add a short comment above each function explaining what it does.
- Make small changes, run the app after each one, and tell me what to test.
- Never commit API keys. Keep venv/ and .env out of git.

## Definition of done
Works end to end on a fresh install: scan or type a reading, view the summary, share the PDF, delete all data. Demo video and write-up are finished by Oct 22.