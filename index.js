// inicio.js

console.log("Inicio cargado correctamente 💖");

// Aquí después puedes hacer:
// - Verificar si el usuario ya inició sesión
// - Redirigir automáticamente
// - Animaciones, etc.

// Ejemplo futuro:
/*
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
  if (user.rol === "enviara") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "dashboard.html";
  }
}
*/
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("PWA lista 💖"))
    .catch(err => console.log("Error SW:", err));
}