# Platform Quickstart: Firebase Development

## 1. Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Node.js 18+

## 2. Local Emulator Setup
The platform leverages the **Firebase Emulator Suite** for local judging and data synchronization.

```bash
# Initialize Firebase (if not already done)
firebase init emulators

# Start Emulators (Firestore, Auth, Functions)
firebase emulators:start
```

## 3. Connecting the Judge
Your local Judge Worker needs to listen to the emulator Firestore. Set the environment variable:

`FIRESTORE_EMULATOR_HOST=localhost:8080`

## 4. Frontend Integration
In your `firebaseConfig.js`:

```javascript
if (location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}
```

## 5. Seeding Data
Use the script at `scripts/seed-problems.js` to populate the emulator with initial questions and test cases.
