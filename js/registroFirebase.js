import { GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./firebase.js";
import { setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { mostrarToast } from "./toast.js";

// ===== ELEMENTOS =====
const btnRegistrar = document.getElementById("btnRegistrar");
const btnIniciar   = document.getElementById("btnIniciar");
const btnGoogle    = document.getElementById("btnGoogle");

// ===== ERRORES INLINE =====
function mostrarError(inputId, mensaje) {
  const input = document.getElementById(inputId);
  let errorEl = document.getElementById(`error-${inputId}`);

  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.id = `error-${inputId}`;
    errorEl.className = "text-red-500 text-xs mt-1 ml-1";
    input.parentNode.insertBefore(errorEl, input.nextSibling);
  }

  errorEl.textContent = mensaje;

  input.classList.add("border-red-400");
  input.classList.remove("border-gray-300");
}

function limpiarErrores() {
  document.querySelectorAll("[id^='error-']").forEach(el => el.remove());
  document.querySelectorAll("input, textarea").forEach(el => {
    el.classList.remove("border-red-400");
  });
}

// ===== REGISTRO =====
btnRegistrar.addEventListener("click", async () => {
  limpiarErrores();

  const usuario  = document.getElementById("usuario").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const codigo   = document.getElementById("codigo").value.trim();

  let hayError = false;

  if (!usuario) {
    mostrarError("usuario", "El nombre es requerido");
    hayError = true;
  }
  if (!email) {
    mostrarError("email", "El correo es requerido");
    hayError = true;
  }
  if (!password) {
    mostrarError("password", "La contraseña es requerida");
    hayError = true;
  }
  if (!window.rol) {
    mostrarToast("Selecciona un rol primero", "error");
    hayError = true;
  }
  if (!codigo) {
    mostrarError("codigo", "El código es requerido");
    hayError = true;
  }

  if (hayError) return;

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

    mostrarToast("Te enviamos un correo para verificar tu cuenta 💌", "info");
    setTimeout(() => window.location.href = "registro.html", 2500);

  } catch (error) {
    manejarErrorFirebase(error.code);
  }
});

// ===== LOGIN =====
btnIniciar.addEventListener("click", async () => {
  limpiarErrores();

  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  let hayError = false;

  if (!email) {
    mostrarError("loginEmail", "El correo es requerido");
    hayError = true;
  }
  if (!password) {
    mostrarError("loginPassword", "La contraseña es requerida");
    hayError = true;
  }

  if (hayError) return;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      mostrarToast("Verifica tu correo primero 💌", "error");
      return;
    }

    const snap = await getDoc(doc(db, "usuarios", user.uid));

    if (snap.exists()) {
      const datos = snap.data();
      window.location.href = datos.rol === "enviara"
        ? "secundario.html"
        : "principal.html";
    }

  } catch (error) {
    manejarErrorFirebase(error.code);
  }
});

// ===== GOOGLE =====
btnGoogle.addEventListener("click", async () => {
  if (!window.rol) return mostrarToast("Selecciona un rol primero", "error");

  const codigo = document.getElementById("codigo").value.trim();
  if (!codigo) return mostrarToast("Agrega un código", "error");

  const provider = new GoogleAuthProvider();

  try {
    const result  = await signInWithPopup(auth, provider);
    const user    = result.user;
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        usuario: user.displayName || "Usuario",
        email:   user.email,
        rol:     window.rol,
        codigo:  codigo
      });
    }

    const snapFinal = await getDoc(userRef);
    const datos = snapFinal.data();

    window.location.href = datos.rol === "enviara"
      ? "secundario.html"
      : "principal.html";

  } catch (error) {
    manejarErrorFirebase(error.code);
  }
});

// ===== ERRORES FIREBASE =====
function manejarErrorFirebase(code) {
  const errores = {
    "auth/email-already-in-use":  { campo: "email",    msg: "Este correo ya está registrado" },
    "auth/invalid-email":         { campo: "email",    msg: "El correo no es válido" },
    "auth/weak-password":         { campo: "password", msg: "Mínimo 6 caracteres" },
    "auth/user-not-found":        { campo: null,       msg: "No encontramos ese usuario" },
    "auth/wrong-password":        { campo: null,       msg: "Correo o contraseña incorrectos" },
    "auth/invalid-credential":    { campo: null,       msg: "Correo o contraseña incorrectos" },
    "auth/too-many-requests":     { campo: null,       msg: "Demasiados intentos, intenta más tarde" },
    "auth/popup-closed-by-user":  { campo: null,       msg: "Cerraste la ventana de Google" },
  };

  const err = errores[code];

  if (err?.campo) {
    mostrarError(err.campo, err.msg);
  } else {
    mostrarToast(err?.msg || "Ocurrió un error, intenta de nuevo", "error");
  }
}