import { GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./firebase.js";
import { setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== ELEMENTOS =====
const btnRegistrar = document.getElementById("btnRegistrar");
const btnIniciar   = document.getElementById("btnIniciar");
const btnGoogle    = document.getElementById("btnGoogle");

// ===== REGISTRO =====
btnRegistrar.addEventListener("click", async () => {
  const usuario  = document.getElementById("usuario").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const codigo   = document.getElementById("codigo").value.trim();

  if (!window.rol) return alert("Selecciona un rol ❗");
  if (!codigo) return alert("Agrega un código ❗");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await setDoc(doc(db, "usuarios", user.uid), {
      usuario: usuario,
      email:   email,
      rol:     window.rol,
      codigo:  codigo
    });

    alert("Te enviamos un correo para verificar tu cuenta 💌");
    window.location.href = "registro.html";

  } catch (error) {
    mostrarError(error.code);
  }
});

// ===== LOGIN =====
btnIniciar.addEventListener("click", async () => {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("Debes verificar tu correo primero 💌");
      return;
    }

    // 🔥 LEER ROL DESDE FIRESTORE
    const snap = await getDoc(doc(db, "usuarios", user.uid));

    if (snap.exists()) {
      const datos = snap.data();
      alert(`Bienvenido a Daily Love, ${datos.usuario} 💖`);

      window.location.href = datos.rol === "enviara"
        ? "secundario.html"
        : "principal.html";
    }

  } catch (error) {
    mostrarError(error.code);
  }
});

// ===== GOOGLE =====
btnGoogle.addEventListener("click", async () => {
  if (!window.rol) return alert("Selecciona un rol primero ❗");

  const codigo = document.getElementById("codigo").value.trim();
  if (!codigo) return alert("Agrega un código ❗");

  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef  = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        usuario: user.displayName || "Usuario",
        email:   user.email,
        rol:     window.rol,
        codigo:  codigo
      });
    }

    // 🔥 LEER ROL ACTUALIZADO DESDE FIRESTORE
    const snapFinal = await getDoc(userRef);
    const datos = snapFinal.data();

    alert(`Bienvenido ${datos.usuario} 💖`);

    window.location.href = datos.rol === "enviara"
      ? "secundario.html"
      : "principal.html";

  } catch (error) {
    mostrarError(error.code);
  }
});

// ===== MANEJO DE ERRORES =====
function mostrarError(code) {
  const errores = {
    "auth/email-already-in-use":  "Este correo ya está registrado 📧",
    "auth/invalid-email":         "El correo no es válido ❗",
    "auth/weak-password":         "La contraseña debe tener al menos 6 caracteres 🔑",
    "auth/user-not-found":        "No encontramos ese usuario 🔍",
    "auth/wrong-password":        "Contraseña incorrecta ❗",
    "auth/invalid-credential":    "Correo o contraseña incorrectos ❗",
    "auth/too-many-requests":     "Demasiados intentos, intenta más tarde ⏳",
    "auth/popup-closed-by-user":  "Cerraste la ventana de Google, intenta de nuevo 🔄",
  };

  alert(errores[code] || "Ocurrió un error, intenta de nuevo ❗");
}