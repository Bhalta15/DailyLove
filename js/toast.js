// ===== TOAST =====
function mostrarToast(mensaje, tipo = "exito") {

  const colores = {
    exito:   "bg-green-500 text-white",
    error:   "bg-red-500 text-white",
    info:    "bg-pink-500 text-white",
  };

  const iconos = {
    exito:  "✅",
    error:  "❗",
    info:   "💖",
  };

  const toast = document.createElement("div");

  toast.className = `
    fixed bottom-6 left-1/2 -translate-x-1/2
    ${colores[tipo]}
    px-6 py-3 rounded-xl shadow-lg
    flex items-center gap-2
    text-sm font-semibold
    z-[9999]
    opacity-0 translate-y-4
    transition-all duration-300 ease-in-out
  `;

  toast.innerHTML = `<span>${iconos[tipo]}</span><span>${mensaje}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("opacity-0", "translate-y-4");
    toast.classList.add("opacity-100", "translate-y-0");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-4");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export { mostrarToast };