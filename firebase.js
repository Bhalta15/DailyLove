// 🔥 IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAw876DtiEejLudWjA766pK8ZpFlUaRoSo",
  authDomain: "daily-love-9830e.firebaseapp.com",
  projectId: "daily-love-9830e",
  storageBucket: "daily-love-9830e.firebasestorage.app",
  messagingSenderId: "42599876322",
  appId: "1:42599876322:web:ea3f2451650ca628e900bb",
  measurementId: "G-VJ244V6QZN"
};

// 🔥 INICIALIZAR
const app = initializeApp(firebaseConfig);

// 🔥 EXPORTS
export const auth = getAuth(app);
export const db = getFirestore(app);