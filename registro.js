// ===== ELEMENTOS =====
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");

const rolEnviara = document.getElementById("rolEnviara");
const rolVera = document.getElementById("rolVera");

const codigoDiv = document.getElementById("codigoDiv");
const inputCodigo = document.getElementById("codigo");
const msg = document.getElementById("codigoMsg");
const btnGenerar = document.getElementById("btnGenerar");

// ===== CAMBIO LOGIN / REGISTER =====
btnLogin.onclick = () => {
  registerForm.classList.add("hidden");
  registerForm.classList.remove("flex");
  loginForm.classList.remove("hidden");
  loginForm.classList.add("flex");
};

btnRegister.onclick = () => {
  loginForm.classList.add("hidden");
  loginForm.classList.remove("flex");
  registerForm.classList.remove("hidden");
  registerForm.classList.add("flex");
};

// ===== ROLES =====
window.rol = "";

function setRolActivo(rolSeleccionado) {
  window.rol = rolSeleccionado;

  // Reset visual de ambos botones
  rolEnviara.classList.remove("bg-pink-500", "text-white");
  rolEnviara.classList.add("bg-pink-100", "text-pink-600");
  rolVera.classList.remove("bg-pink-500", "text-white");
  rolVera.classList.add("bg-pink-100", "text-pink-600");

  // Marcar el activo
  const btnActivo = rolSeleccionado === "enviara" ? rolEnviara : rolVera;
  btnActivo.classList.remove("bg-pink-100", "text-pink-600");
  btnActivo.classList.add("bg-pink-500", "text-white");

  // Mostrar campo de código
  codigoDiv.classList.remove("hidden");
  inputCodigo.value = "";
  msg.textContent = "";
}

rolEnviara.onclick = () => {
  setRolActivo("enviara");
  inputCodigo.placeholder = "Escribe tu código o genéralo";
  msg.textContent = "Puedes escribirlo o generarlo";
  btnGenerar.classList.remove("hidden");
};

rolVera.onclick = () => {
  setRolActivo("vera");
  inputCodigo.placeholder = "Ingresa el código de tu pareja";
  msg.textContent = "Pide el código a tu pareja";
  btnGenerar.classList.add("hidden");
};

// ===== GENERAR CODIGO =====
btnGenerar.onclick = () => {
  const codigo = generarCodigo();
  inputCodigo.value = codigo;
  msg.textContent = "Código generado 🎲";
};

function generarCodigo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let c = "";
  for (let i = 0; i < 6; i++) {
    c += chars[Math.floor(Math.random() * chars.length)];
  }
  return c;
}