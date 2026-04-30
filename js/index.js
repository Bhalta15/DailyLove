// ===== SERVICE WORKER =====
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("PWA lista 💖"))
    .catch(err => console.log("Error SW:", err));
}

// ===== REDIRECCIÓN AUTOMÁTICA SI YA HAY SESIÓN =====
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { mostrarLoader } from "./loader.js";

setPersistence(auth, browserLocalPersistence).then(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      mostrarLoader();
      window.location.href = "app.html";
    }
  });
});