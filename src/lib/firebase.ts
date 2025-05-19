
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig"; // This import triggers logs in firebaseConfig.ts

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

console.log("Attempting to initialize Firebase module (firebase.ts)...");
console.log("Firebase config received in firebase.ts:", JSON.stringify(firebaseConfig, null, 2));

// CRITICAL PRE-CHECK
if (!firebaseConfig.apiKey || typeof firebaseConfig.apiKey !== 'string' || firebaseConfig.apiKey.includes("YOUR_") || firebaseConfig.apiKey.includes("PLACEHOLDER") || firebaseConfig.apiKey.length < 10) {
  const message = `CRITICAL PRE-CHECK FAILED (firebase.ts): NEXT_PUBLIC_FIREBASE_API_KEY is invalid or a placeholder. Value: "${firebaseConfig.apiKey}". Please check your .env file and RESTART the server. Firebase will NOT be initialized.`;
  console.error(message);
  // Intentionally throw an error here to make it very clear in the Next.js error overlay
  // that the problem is with the env var before Firebase even tries to use it.
  throw new Error(message);
}

if (!firebaseConfig.projectId || typeof firebaseConfig.projectId !== 'string' || firebaseConfig.projectId.includes("YOUR_") || firebaseConfig.projectId.includes("PLACEHOLDER") || firebaseConfig.projectId.length < 4) {
  const message = `CRITICAL PRE-CHECK FAILED (firebase.ts): NEXT_PUBLIC_FIREBASE_PROJECT_ID is invalid or a placeholder. Value: "${firebaseConfig.projectId}". Please check your .env file and RESTART the server. Firebase will NOT be initialized.`;
  console.error(message);
  throw new Error(message);
}

if (!getApps().length) {
  console.log("Firebase config to be passed to initializeApp (firebase.ts):", JSON.stringify(firebaseConfig, null, 2));
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully (firebase.ts).");
  } catch (e: any) {
    console.error("ERROR during Firebase app initialization (initializeApp call in firebase.ts):", e.message);
    console.error("Firebase config that FAILED initialization (firebase.ts):", JSON.stringify(firebaseConfig, null, 2));
    throw e; // Re-throw to ensure Next.js handles it
  }
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized, using existing instance (firebase.ts).");
}

try {
  auth = getAuth(app);
  console.log("Firebase Auth initialized successfully (firebase.ts).");
} catch (e: any) {
    console.error("ERROR initializing Firebase Auth (getAuth call in firebase.ts):", e.message);
    console.error("Firebase config at the time Auth FAILED (firebase.ts):", JSON.stringify(firebaseConfig, null, 2));
    throw e;
}

try {
  db = getFirestore(app);
  console.log("Firestore initialized successfully (firebase.ts).");
} catch (e: any) {
    console.error("ERROR initializing Firestore (getFirestore call in firebase.ts):", e.message);
    console.error("Firebase config at the time Firestore FAILED (firebase.ts):", JSON.stringify(firebaseConfig, null, 2));
    throw e;
}

export { app, auth, db };
