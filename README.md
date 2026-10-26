# Glucose Bridge

Glucose Bridge is a mobile app for older adults with Type 2 diabetes who check their blood sugar with a fingerstick meter. They can type a reading, see it in plain words, get daily reminders to check, and turn their readings into a one-page PDF summary for their doctor. It is a logging tool, not medical advice.

**Team:** Claire Park and Isha Sedhain
**Challenge:** Congressional App Challenge 2026

## What the app does
- **Today:** latest reading in large text and plain words, daily reminders, and "Send to family."
- **Add:** type the number, pick a tag (fasting, before meal, after meal, exercise), and save.
- **Daily reminders:** the user picks quick times (morning, midday, evening, bedtime) or sets their own times, and the phone reminds them to check and log. Reminders are scheduled on the phone itself and need no server or account.
- **History:** tap a reading to edit or delete it.
- **Summary:** average, low, high, time in range, patterns, a 30-reading trend, "Hear my summary" (read aloud), and a one-page PDF for the doctor.
- **Help:** a typed question box and quick-answer buttons about using the app.
- **Privacy:** readings stay on the phone, there are no accounts, and "Delete all my data" is one tap.

## How it is built
- **App (this folder):** TypeScript, React Native, Expo, Expo Router. Readings are stored on the phone with AsyncStorage. Reminders use local notifications (expo-notifications).
- **Server (glucosebridge-server):** Python and FastAPI. It answers typed Help questions using the Google Gemini API. The API key is kept in an environment variable on the server and is not in this code. The server also has an early meter-photo reader that we are building for version 2.0; it is not turned on in the app.

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

Typing readings, reminders, history, summary, PDF, and delete-all all work without the server. Only typed Help questions need it, and the server runs on our own computer, so it may be offline when you read this. The Help quick-answer buttons work offline.

## Open-source libraries and outside tools
- **App:** Expo, React Native, React, Expo Router, TypeScript, AsyncStorage, expo-notifications, expo-print, expo-sharing, expo-speech, Ionicons (@expo/vector-icons)
- **Server:** Python, FastAPI, Uvicorn, python-dotenv, Pydantic, google-genai
- **Services:** Google Gemini API (reads the meter photo and answers Help questions inside the app), GitHub
- **Other:** Canva (demo video slides), Apple's built-in screen recorder

## AI disclosure
**AI used inside the app:** the server sends typed Help questions to Google's Gemini model. It only answers questions about using the app and never gives medical advice.

**AI used to build the app:** we used Claude, an AI assistant made by Anthropic, to help write, debug, and explain code, including most files in this project. SPEC.md is the project plan and rules we gave the assistant.

**What we did ourselves:** We came up with the original app concept and defined our target audience for glucose tracking. We designed the logo and selected the soft, intentional color palette. We also chose the tech stack and tools, defined the app features and rules, designed the user experience, tested the app on physical phones, and made all final decisions on code, layout, and implementation.

## Credits
- Logo and color palette: Canva Pro
- Statistics on the video slides: CDC National Diabetes Statistics Report; Texas Diabetes Council 2025 report
- Glucose Bridge is a logging tool and makes no medical, accuracy, or diagnostic claims.

## Submission answers

**1. Title:** Glucose Bridge

**2. Purpose:** Glucose Bridge helps older adults log their blood sugar in plain words, set their own reminders to check, and turn their readings into a one-page summary they can share with their doctor.

**3. What inspired us:** We know people with diabetes, and in our community we often saw older Asian adults who did not know how to collect their blood sugar readings, store them, or show them to their doctors. Many still rely on paper notebooks or memory. We wanted to build something simple and in plain words that helps our community keep their readings in one place and bring them to their doctor.

**4. Technical challenge:** The hardest part was making an app that is simple and safe for older adults who are not comfortable with technology: big text, plain words, and no hidden menus. Everything runs on the phone with no account and no server, including readings, custom reminders, patterns, a spoken summary, and a one-page PDF for the doctor. We also learned a lot about networking and keeping an API key safe while building a Help assistant that answers only questions about the app and never gives medical advice. We used Claude, an AI assistant, to help write and debug code. We came up with the idea, rules, and design, and tested the app on our own phones.

**5. Biggest takeaway:** Designing for older adults means fewer choices, bigger text, plain words, and always reminding people that the app is not a replacement for their doctor. A good app is not the one with the most features, it is the one someone can use without help.

**6. If we made a 2.0 version:** Our first priority is a meter scan: the user points the phone camera at their meter and the app reads the number and logs it, with the user confirming the number first. We would also host our server so it is always on, let doctors set target ranges instead of using one fixed range, make the app installable directly instead of through Expo Go, add caregiver sharing with the user's consent, offer optional backup, and test it with more older adults.
