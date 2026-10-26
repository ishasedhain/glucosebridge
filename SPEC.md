# Glucose Bridge: Project Spec

## What it is
A mobile app for people who still check blood sugar with fingerstick meters and write readings in notebooks. The user types a reading, sees it in plain words, gets daily reminders to check, and generates a one-page PDF summary a doctor can read in seconds. Built for the Congressional App Challenge (submission deadline Oct 26, 2026).

## Users
Mainly older adults with Type 2 diabetes. Accessibility is the top design goal: large text, high contrast, one main action per screen, no hidden menus.

## Stack
- App: Expo (React Native, TypeScript), Expo Router, tabs layout. Tested with Expo Go on iPhone.
- Storage: AsyncStorage, on-device only. No accounts, no cloud database.
- Reminders: expo-notifications, local scheduled notifications on the phone (no server).
- Server: Python FastAPI in a separate folder (glucosebridge-server) with POST /read-meter (base64 JPEG in, {"value": integer or null} out, using the Google Gemini API free tier) and POST /ask (Help answers). The API key is read from the GEMINI_API_KEY environment variable and must NEVER be hardcoded or committed.

## Built
- Storage, stats, patterns, plain-words status, Send to family
- Screens: Today, Add, History, Summary, Help
- Edit and delete a reading, Delete all my data
- One-page PDF for the doctor (expo-print + expo-sharing)
- Hear my summary (expo-speech)
- Daily reminders (morning, midday, evening, bedtime)
- First-launch consent, Privacy and About, medical disclaimer
- Accessibility pass: labels on every button, large text, high contrast
- Error handling for no internet, slow server, camera denied, unreadable photo (always falls back to typing)
- Planned for 2.0: meter scan with the phone camera (early server code exists, not turned on in the app)

## Rules
- A scanned number must NEVER be saved automatically. It goes into the input box so the user confirms or corrects it first.
- Show a visible disclaimer: Glucose Bridge is a logging tool, not medical advice. Make no accuracy, diagnostic, or FDA claims.
- Readings stay on the phone. Meter photos are sent only to read the number and are not stored.
- Keep code simple and readable. A high school student must be able to explain every file to judges.
- Add a short comment above each function explaining what it does.
- Make small changes, run the app after each one, and tell me what to test.
- Never commit API keys. Keep venv/ and .env out of git.

## Definition of done
Works end to end on a fresh install: type a reading, set a reminder, view the summary, share the PDF, delete all data. Demo video and write-up are submitted before the deadline.
