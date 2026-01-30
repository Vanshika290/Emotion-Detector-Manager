import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// ⚠️ SECURITY WARNING: You previously pasted a Service Account Private Key here.
// Service Accounts are for BACKEND use only. Exposing them in the frontend allows anyone to control your entire project.
// I have removed it for your safety.

// TODO: Please allow me to explain where to get the correct config:
// 1. Go to https://console.firebase.google.com/
// 2. Click on your project
// 3. Click the "Gear" icon (Project Settings) -> General
// 4. Scroll down to "Your apps"
// 5. Select the "Web" app (</> icon)
// 6. Copy the "firebaseConfig" object (it looks like the one below)

const firebaseConfig = {
    // Replace these with the values from the Firebase Console
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
