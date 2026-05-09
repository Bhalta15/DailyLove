// ===== SERVICE WORKER =====
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("PWA lista 💖"))
    .catch(err => console.log("Error SW:", err));
}

// ===== REDIRECCIÓN AUTOMÁTICA SI YA HAY SESIÓN =====
import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  // Solo redirigir si el usuario existe Y ya verificó su correo
  if (user && user.emailVerified) {
    window.location.href = "app.html";
  }
});