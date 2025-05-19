
// src/lib/firebaseConfig.ts
// IMPORTANT: Your Firebase project configuration MUST be set in your .env file.

console.log("Loading Firebase configuration from environment variables (firebaseConfig.ts)...");

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
console.log(`NEXT_PUBLIC_FIREBASE_API_KEY (type: ${typeof apiKey}): "${apiKey}"`);

const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
console.log(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (type: ${typeof authDomain}): "${authDomain}"`);

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID (type: ${typeof projectId}): "${projectId}"`);

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
console.log(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (type: ${typeof storageBucket}): "${storageBucket}"`);

const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
console.log(`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (type: ${typeof messagingSenderId}): "${messagingSenderId}"`);

const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
console.log(`NEXT_PUBLIC_FIREBASE_APP_ID (type: ${typeof appId}): "${appId}"`);

const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // Optional
console.log(`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (type: ${typeof measurementId}): "${measurementId}" (Optional)`);

if (!apiKey || typeof apiKey !== 'string') {
  console.error(
    "CRITICAL ERROR (firebaseConfig.ts): Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing, undefined, or not a string. " +
    "Please ensure it is correctly set in your .env file in the project root, and that the server has been RESTARTED."
  );
} else if (apiKey.includes("YOUR_") || apiKey.includes("PLACEHOLDER") || apiKey.length < 10) {
    console.warn(
    "WARNING (firebaseConfig.ts): Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) looks like a placeholder or is too short. " +
    `Current value: "${apiKey}". Please replace it with your actual Firebase API Key in the .env file and RESTART the server.`
  );
}

if (!projectId || typeof projectId !== 'string') {
  console.error(
    "CRITICAL ERROR (firebaseConfig.ts): Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing, undefined, or not a string. " +
    "Please ensure it is correctly set in your .env file in the project root, and that the server has been RESTARTED."
  );
} else if (projectId.includes("YOUR_") || projectId.includes("PLACEHOLDER") || projectId.length < 4) {
    console.warn(
    "WARNING (firebaseConfig.ts): Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) looks like a placeholder or is too short. " +
    `Current value: "${projectId}". Please replace it with your actual Firebase Project ID in the .env file and RESTART the server.`
  );
}


export const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId, // Can be undefined if not used
};

console.log("Final firebaseConfig object to be exported (firebaseConfig.ts):", JSON.stringify(firebaseConfig, null, 2));
