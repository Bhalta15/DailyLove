// ===== FIREBASE =====
import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, getDocs, query, where }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== ELEMENTOS =====
const menuBtn       = document.getElementById('menuBtn');
const sideMenu      = document.getElementById('sideMenu');
const overlay       = document.getElementById('overlay');
const modal         = document.getElementById('modal');
const inputTexto    = document.getElementById('inputTexto');
const inputLink     = document.getElementById('inputLink');
const inputFile     = document.getElementById('inputFile');
const previewImagen = document.getElementById('previewImagen');
const cancelar      = document.getElementById('cancelar');
const guardar       = document.getElementById('guardar');
const modalFoto     = document.getElementById('modalFoto');
const imagenGrande  = document.getElementById('imagenGrande');
const btnDescargar  = document.getElementById('btnDescargar');
const btnCerrarFoto = document.getElementById('btnCerrarFoto');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// LISTAS
const listasMensajes  = document.querySelectorAll(".listaMensajes");
const listasCanciones = document.querySelectorAll(".listaCanciones");
const listasVideos    = document.querySelectorAll(".listaVideos");
const listasFrases    = document.querySelectorAll(".listaFrases");
const listasFotos     = document.querySelectorAll(".listaFotos");

// ===== SESIÓN =====
let codigoPareja = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "registro.html";
    return;
  }

  const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
  const snap = await getDoc(doc(db, "usuarios", user.uid));

  if (snap.exists()) {
    const datos = snap.data();
    codigoPareja = datos.codigo;

    document.getElementById("userName").textContent = datos.usuario;
    document.getElementById("userNameMain").textContent = datos.usuario;
  }

  cargarContenido();
});

// ===== CERRAR SESIÓN =====
btnCerrarSesion.onclick = async () => {
  await signOut(auth);
  window.location.href = "registro.html";
};

// ===== MENÚ =====
menuBtn.onclick = () => {
  sideMenu.classList.remove('-translate-x-full');
  overlay.classList.remove('hidden');
};

overlay.onclick = cerrarMenu;

function cerrarMenu() {
  sideMenu.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
}

document.querySelectorAll('.itemMenu').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(btn.dataset.section).classList.remove('hidden');
    cerrarMenu();
  };
});

// ===== MODAL CONTENIDO =====
let tipoActual = "";

window.abrirModal = (tipo) => {
  tipoActual = tipo;

  inputTexto.classList.add('hidden');
  inputLink.classList.add('hidden');
  inputFile.classList.add('hidden');
  previewImagen.classList.add('hidden');
  inputTexto.value = "";
  inputLink.value = "";
  inputFile.value = "";

  if (tipo === "mensaje" || tipo === "frase") {
    inputTexto.classList.remove('hidden');
  } else if (tipo === "foto") {
    inputFile.classList.remove('hidden');
  } else {
    inputLink.classList.remove('hidden');
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
  }, 10);
};

function cerrarModal() {
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 300);
}

cancelar.onclick = cerrarModal;

// ===== MODAL FOTO GRANDE =====
window.abrirFoto = (src) => {
  imagenGrande.src = src;
  btnDescargar.href = src;
  modalFoto.classList.remove('hidden');
  modalFoto.classList.add('flex');
};

btnCerrarFoto.onclick = () => {
  modalFoto.classList.add('hidden');
  modalFoto.classList.remove('flex');
};

// ===== COMPRESIÓN DE IMAGEN =====
function comprimirImagen(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 800;
        let w = img.width;
        let h = img.height;

        if (w > h && w > max) { h *= max / w; w = max; }
        else if (h > max) { w *= max / h; h = max; }

        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
    reader.readAsDataURL(file);
  });
}

// ===== PREVIEW IMAGEN =====
inputFile.addEventListener("change", async () => {
  const archivo = inputFile.files[0];
  if (archivo) {
    const img = await comprimirImagen(archivo);
    previewImagen.src = img;
    previewImagen.classList.remove("hidden");
  }
});

// ===== GUARDAR =====
guardar.onclick = async () => {
  let contenido = "";

  if (tipoActual === "mensaje" || tipoActual === "frase") {
    contenido = inputTexto.value.trim();
  } else if (tipoActual === "foto") {
    const archivo = inputFile.files[0];
    if (!archivo) return alert("Selecciona una imagen ❗");
    contenido = await comprimirImagen(archivo);
  } else {
    contenido = inputLink.value.trim();
  }

  if (!contenido) return alert("Escribe algo ❗");
  if (!codigoPareja) return alert("Error: no se encontró tu código de pareja ❗");

  await guardarEnFirebase(contenido);
};

// ===== GUARDAR EN FIREBASE =====
async function guardarEnFirebase(contenido) {
  try {
    await addDoc(collection(db, "parejas", codigoPareja, "contenido"), {
      tipo: tipoActual,
      contenido: contenido,
      fecha: new Date()
    });

    alert("Guardado 💖");
    cerrarModal();
    cargarContenido();

  } catch (error) {
    alert("Error al guardar: " + error.message);
  }
}

// ===== FORMATEAR FECHA =====
function obtenerGrupoFecha(fecha) {
  const hoy = new Date();
  const f = fecha?.toDate ? fecha.toDate() : new Date(fecha);
  const diff = Math.floor((hoy - f) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return f.toLocaleDateString('es-MX');
}

function formatearFechaCorta(fecha) {
  const f = fecha?.toDate ? fecha.toDate() : new Date(fecha);
  return f.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

// ===== CREAR CARD =====
function crearCard(contenido, tipo) {
  if (tipo === "mensaje" || tipo === "frase") {
    return `<div class="bg-white shadow-lg rounded-xl p-5">
      <p class="text-gray-700 text-lg">"${contenido}"</p>
    </div>`;
  }
  if (tipo === "cancion") {
    return `<div class="bg-white shadow-lg rounded-xl p-5">
      <a href="${contenido}" target="_blank" class="text-pink-500 hover:underline">Escuchar 💖</a>
    </div>`;
  }
  if (tipo === "video") {
    return `<div class="bg-white shadow-lg rounded-xl p-5">
      <a href="${contenido}" target="_blank" class="text-pink-500 hover:underline">Ver video 🎥</a>
    </div>`;
  }
  if (tipo === "foto") {
    return `<div class="bg-white shadow-lg rounded-xl p-3 cursor-pointer" onclick="abrirFoto('${contenido}')">
      <img src="${contenido}" class="w-full h-48 object-cover rounded-lg hover:opacity-90 transition">
    </div>`;
  }
  return "";
}

// ===== RENDER POR GRUPOS =====
function renderPorFecha(lista, datos, tipoFiltro) {
  const grupos = {};

  datos.forEach(d => {
    if (d.tipo !== tipoFiltro) return;
    const grupo = obtenerGrupoFecha(d.fecha);
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(d);
  });

  let html = "";

  Object.keys(grupos).forEach((grupo, index) => {
    const id = `grupo-${tipoFiltro}-${index}`;
    const esHoy = grupo === "Hoy";

    html += `
      <div class="mt-4">
        <div onclick="toggleGrupo('${id}', this)"
          class="flex justify-between items-center cursor-pointer">
          <p class="text-sm text-gray-500">${grupo}</p>
          <span class="transition-all duration-500 ease-in-out flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
        <div id="${id}"
          class="space-y-3 overflow-hidden transition-all duration-500 ease-in-out ${esHoy ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}">
          ${grupos[grupo].map(d => crearCard(d.contenido, d.tipo)).join("")}
        </div>
      </div>`;
  });

  lista.innerHTML = html;
}

// ===== TOGGLE GRUPO =====
window.toggleGrupo = (id, el) => {
  const contenedor = document.getElementById(id);
  const flecha = el.querySelector("span");
  const abierto = !contenedor.classList.contains("max-h-0");

  if (abierto) {
    contenedor.classList.remove("max-h-[2000px]", "opacity-100");
    contenedor.classList.add("max-h-0", "opacity-0");
    flecha.style.transform = "rotate(-90deg)";
  } else {
    contenedor.classList.remove("max-h-0", "opacity-0");
    contenedor.classList.add("max-h-[2000px]", "opacity-100");
    flecha.style.transform = "rotate(0deg)";
  }
};

// ===== RENDER INICIO =====
function renderInicio(lista, datos, tipoFiltro) {
  if (tipoFiltro === "foto") {
    const fotos = datos.filter(d => d.tipo === "foto").slice(0, 4);
    lista.innerHTML = fotos.map(f => `
      <img src="${f.contenido}" class="rounded-lg w-full h-32 object-cover cursor-pointer hover:opacity-90 transition"
        onclick="abrirFoto('${f.contenido}')">`
    ).join("");
    return;
  }

  lista.innerHTML = datos
    .filter(d => d.tipo === tipoFiltro)
    .map(d => `<li>"${d.contenido}" - ${formatearFechaCorta(d.fecha)}</li>`)
    .join("");
}

// ===== CARGAR TODO =====
async function cargarContenido() {
  if (!codigoPareja) return;

  try {
    const querySnapshot = await getDocs(
      collection(db, "parejas", codigoPareja, "contenido")
    );

    const datos = [];
    querySnapshot.forEach(doc => datos.push(doc.data()));
    datos.sort((a, b) => {
      const fa = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
      const fb = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
      return fb - fa;
    });

    const tipos = [
      { listas: listasMensajes,  tipo: "mensaje"  },
      { listas: listasFrases,    tipo: "frase"    },
      { listas: listasCanciones, tipo: "cancion"  },
      { listas: listasVideos,    tipo: "video"    },
      { listas: listasFotos,     tipo: "foto"     },
    ];

    tipos.forEach(({ listas, tipo }) => {
      listas.forEach(l => {
        if (l.closest("#inicio")) {
          renderInicio(l, datos, tipo);
        } else {
          renderPorFecha(l, datos, tipo);
        }
      });
    });

  } catch (error) {
    console.error("Error cargando contenido:", error);
  }
}




