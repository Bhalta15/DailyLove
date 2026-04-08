// ===== FIREBASE =====
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, collection, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== ELEMENTOS =====
const menuBtn         = document.getElementById('menuBtn');
const sideMenu        = document.getElementById('sideMenu');
const overlay         = document.getElementById('overlay');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const modalFoto       = document.getElementById('modalFoto');
const imagenGrande    = document.getElementById('imagenGrande');
const btnDescargar    = document.getElementById('btnDescargar');
const btnCerrarFoto   = document.getElementById('btnCerrarFoto');

// ===== SESIÓN =====
let codigoPareja = null;
let unsubscribe  = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "registro.html";
    return;
  }

  try {
    const snap = await getDoc(doc(db, "usuarios", user.uid));

    if (snap.exists()) {
      const datos = snap.data();
      codigoPareja = datos.codigo;
      document.getElementById("userName").textContent     = datos.usuario;
      document.getElementById("userNameMain").textContent = datos.usuario;
    }

    iniciarTiempoReal();

  } catch (error) {
    console.error("Error cargando usuario:", error);
  }
});

// ===== CERRAR SESIÓN =====
btnCerrarSesion.onclick = async () => {
  if (unsubscribe) unsubscribe();
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

// ===== MODAL FOTO GRANDE =====
window.abrirFoto = (src) => {
  imagenGrande.src    = src;
  btnDescargar.href   = src;
  modalFoto.classList.remove('hidden');
  modalFoto.classList.add('flex');
};

btnCerrarFoto.onclick = () => {
  modalFoto.classList.add('hidden');
  modalFoto.classList.remove('flex');
};

// ===== TIEMPO REAL =====
function iniciarTiempoReal() {
  if (!codigoPareja) return;
  if (unsubscribe) unsubscribe();

  const ref = collection(db, "parejas", codigoPareja, "contenido");

  unsubscribe = onSnapshot(ref, (snapshot) => {
    const datos = [];
    snapshot.forEach(d => datos.push({ id: d.id, ...d.data() }));

    datos.sort((a, b) => {
      const fa = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
      const fb = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
      return fb - fa;
    });

    renderTodo(datos);
  });
}

// ===== FECHAS =====
function obtenerGrupoFecha(fecha) {
  const hoy  = new Date();
  const f    = fecha?.toDate ? fecha.toDate() : new Date(fecha);
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
function crearCard(d) {
  if (d.tipo === "mensaje" || d.tipo === "frase") {
    return `<div class="bg-white shadow-lg rounded-xl p-5">
      <p class="text-gray-700 text-lg">"${d.contenido}"</p>
    </div>`;
  }
  if (d.tipo === "foto") {
    return `<div class="bg-white shadow-lg rounded-xl p-3 cursor-pointer" onclick="abrirFoto('${d.contenido}')">
      <img src="${d.contenido}" alt="Foto" class="w-full h-48 object-cover rounded-lg hover:opacity-90 transition">
    </div>`;
  }
  if (d.tipo === "cancion") {
    return `<div class="bg-white shadow-lg rounded-xl p-5">
      <a href="${d.contenido}" target="_blank" class="text-pink-500 hover:underline">Escuchar 💖</a>
    </div>`;
  }
  if (d.tipo === "video") {
    return `<div class="bg-white shadow-lg rounded-xl p-5">
      <a href="${d.contenido}" target="_blank" class="text-pink-500 hover:underline">Ver video 🎥</a>
    </div>`;
  }
  return "";
}

// ===== RENDER POR GRUPOS =====
function renderPorFecha(tipo, datos) {
  const contenedorMap = {
    mensaje: "#mensajesContainer",
    foto:    "#fotosContainer",
    cancion: "#cancionesContainer",
    video:   "#videosContainer",
    frase:   "#frasesContainer"
  };

  const cont = document.querySelector(contenedorMap[tipo]);
  if (!cont) return;

  const grupos = {};
  datos.forEach(d => {
    const grupo = obtenerGrupoFecha(d.fecha);
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(d);
  });

  let html = "";

  Object.keys(grupos).forEach((grupo, index) => {
    const id    = `grupo-${tipo}-${index}`;
    const esHoy = grupo === "Hoy";

    html += `
      <div class="mt-4">
        <div onclick="toggleGrupo('${id}', this)"
          class="flex justify-between items-center cursor-pointer">
          <p class="text-sm text-gray-500">${grupo}</p>
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-gray-400 transition-transform duration-300"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
        <div id="${id}"
          class="space-y-3 overflow-hidden transition-all duration-500 ease-in-out ${esHoy ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}">
          ${datos.filter(d => obtenerGrupoFecha(d.fecha) === grupo).map(d => crearCard(d)).join("")}
        </div>
      </div>`;
  });

  cont.innerHTML = html;
}

// ===== TOGGLE GRUPO =====
window.toggleGrupo = (id, el) => {
  const contenedor = document.getElementById(id);
  const flecha     = el.querySelector("svg");
  const abierto    = !contenedor.classList.contains("max-h-0");

  if (abierto) {
    contenedor.classList.remove("max-h-[2000px]", "opacity-100");
    contenedor.classList.add("max-h-0", "opacity-0");
    if (flecha) flecha.style.transform = "rotate(-90deg)";
  } else {
    contenedor.classList.remove("max-h-0", "opacity-0");
    contenedor.classList.add("max-h-[2000px]", "opacity-100");
    if (flecha) flecha.style.transform = "rotate(0deg)";
  }
};

// ===== RENDER INICIO =====
function renderInicio(datos) {
  const setHTML = (selector, html) => {
    document.querySelectorAll(selector).forEach(el => el.innerHTML = html);
  };

  const mensajes  = datos.filter(d => d.tipo === "mensaje").slice(0, 3);
  const fotos     = datos.filter(d => d.tipo === "foto").slice(0, 4);
  const canciones = datos.filter(d => d.tipo === "cancion").slice(0, 3);
  const videos    = datos.filter(d => d.tipo === "video").slice(0, 3);
  const frases    = datos.filter(d => d.tipo === "frase").slice(0, 3);

  setHTML(".listaMensajes",
    mensajes.map(m => `<li>"${m.contenido}" - ${formatearFechaCorta(m.fecha)}</li>`).join("")
  );
  setHTML(".listaFotos",
    fotos.map(f => `
      <img src="${f.contenido}" alt="Foto"
        class="rounded-lg w-full h-32 object-cover cursor-pointer hover:opacity-90 transition"
        onclick="abrirFoto('${f.contenido}')">`
    ).join("")
  );
  setHTML(".listaCanciones",
    canciones.map(c => `<li><a href="${c.contenido}" target="_blank" class="text-pink-500 hover:underline">Escuchar 💖</a></li>`).join("")
  );
  setHTML(".listaVideos",
    videos.map(v => `<li><a href="${v.contenido}" target="_blank" class="text-pink-500 hover:underline">Ver 🎥</a></li>`).join("")
  );
  setHTML(".listaFrases",
    frases.map(f => `<li>"${f.contenido}"</li>`).join("")
  );
}

// ===== RENDER TODO =====
function renderTodo(datos) {
  const tipos = ["mensaje", "foto", "cancion", "video", "frase"];
  tipos.forEach(tipo => {
    const filtrados = datos.filter(d => d.tipo === tipo);
    renderPorFecha(tipo, filtrados);
  });
  renderInicio(datos);
}