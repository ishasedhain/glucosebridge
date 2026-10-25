# Glucose Bridge

Glucose Bridge is a mobile app for older adults with Type 2 diabetes who check their blood sugar with a fingerstick meter. They can scan or type a reading, see it in plain words, and turn their readings into a one-page PDF summary for their doctor. It is a logging tool, not medical advice.

**Team:** Claire Park and Isha Sedhain
**Challenge:** Congressional App Challenge 2026

## What the app does
- **Add:** scan the meter with the phone camera or type the number. A scanned number is never saved automatically; it goes into the box so the user confirms or fixes it first.
- **Today:** latest reading in large text and plain words, plus "Send to family."
- **History:** tap a reading to edit or delete it.
- **Summary:** average, low, high, time in range, patterns, a 30-reading trend, "Hear my summary" (read aloud), and a one-page PDF for the doctor.
- **Help:** a typed question box and quick-answer buttons about using the app.
- **Privacy:** readings stay on the phone, there are no accounts, and "Delete all my data" is one tap.

## How it is built
- **App (this folder):** TypeScript, React Native, Expo, Expo Router. Readings are stored on the phone with AsyncStorage.
- **Server (glucosebridge-server):** Python and FastAPI. It receives a meter photo, asks the Google Gemini API for only the number (or "not readable"), and returns it. It also answers Help questions. The API key is kept in an environment variable on the server and is not in this code.

## Run it
**App**
1. npm install
2. Set the server address in src/lib/config.ts
3. npx expo start, then scan the QR code with Expo Go on a phone.

**Server** (folder glucosebridge-server)
1. python3 -m venv venv && source venv/bin/activate
2. pip install -r requirements.txt
3. Create a .env file containing GEMINI_API_KEY=your_key
4. uvicorn main:app --host 0.0.0.0 --port 8000

Typing readings, history, summary, PDF, and delete-all work without the server. Only scanning and Help questions need it.

## Open-source libraries and outside tools
- **App:** Expo, React Native, React, Expo Router, TypeScript, AsyncStorage, expo-image-picker, expo-print, expo-sharing, expo-speech, Ionicons (@expo/vector-icons)
- **Server:** Python, FastAPI, Uvicorn, python-dotenv, Pydantic, google-genai
- **Services:** Google Gemini API (reads the meter photo and answers Help questions inside the app), GitHub, Render [FILL IN: only if you actually deployed there]
- **Other:** Canva (demo video slides) [FILL IN: and your screen recorder / editor]

## AI disclosure
**AI used inside the app:** the server sends meter photos and Help questions to Google's Gemini model. The user confirms every scanned number before it is saved.

**AI used to build the app:** we used Claude, an AI assistant made by Anthropic, to help write, debug, and explain code, including most files in this project. SPEC.md is the project plan and rules we gave the assistant.

**What we did ourselves:** [FILL IN, truthfully, in your own words: the idea, who it is for, features and rules you chose, design and logo, testing on a real phone with real meter photos, and any files you wrote or edited and can explain.]

## Credits
- Logo and color palette: [FILL IN who made them and with what tool]
- Statistics on the video slides: CDC National Diabetes Statistics Report; Texas Diabetes Council 2025 report
- Glucose Bridge is a logging tool and makes no medical, accuracy, or diagnostic claims.

## Submission answers

**1. Title:** Glucose Bridge

**2. Purpose:** Glucose Bridge lets people scan or type their blood sugar readings and turn them into a one-page summary they can share with their doctor.

**3. What inspired us:** We know people with diabetes, and in our community we often saw older Asian adults who did not know how to collect their blood sugar readings, store them, or show them to their doctors. Many still rely on paper notebooks or memory. We wanted to build something simple and in plain words that helps our community keep their readings in one place and bring them to their doctor.

**4. Technical challenge:** Reading a blood sugar meter from a photo was the hardest part, because of glare, small digits, and because a wrong number could mislead someone. The app sends the photo to a server that asks a vision model (Google Gemini) for only a number, or "not readable." The server also rejects values outside a realistic range. The app never saves a scanned number automatically: it puts the number in a box so the user confirms or fixes it, and if a photo cannot be read, the app asks the user to try again or type the number. We keep the API key on the server so it is never inside the app. We used Claude, an AI assistant, to help write and debug code. We came up with the idea, rules, and design, and tested the app on our own phones.

**5. Biggest takeaway:** Designing for older adults means fewer choices, bigger text, plain words, and never trusting an AI reading without a human check. A good app is not the one with the most features, it is the one someone can use without help.

**6. If we made a 2.0 version:** We would let doctors set target ranges instead of using one fixed range, make the app installable directly instead of through Expo Go, add caregiver sharing with the user's consent, offer optional backup, and test it with more older adults.
