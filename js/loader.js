// ===== LOADER - Corazón animado con backdrop-blur =====
// Uso: import { mostrarLoader, ocultarLoader } from "./loader.js";

const LOADER_ID = "dlLoader";

const LOADER_HTML = `
<style>
  #dlLoader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.15);
    opacity: 1;
    transition: opacity 0.4s ease;
  }
  #dlLoader.ocultar {
    opacity: 0;
    pointer-events: none;
  }

  .dl-heart-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .dl-heart-svg {
    width: 80px;
    height: 80px;
    filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.5));
  }

  .dl-heart-path {
    fill: none;
    stroke: #7c3aed;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    /* Longitud total del path del corazón ≈ 280 */
    stroke-dasharray: 280;
    stroke-dashoffset: 280;
    animation: dibujarCorazon 1.6s ease-in-out infinite;
  }

  @keyframes dibujarCorazon {
    0%   { stroke-dashoffset: 280; opacity: 1; }
    70%  { stroke-dashoffset: 0;   opacity: 1; }
    85%  { stroke-dashoffset: 0;   opacity: 0.3; }
    100% { stroke-dashoffset: 280; opacity: 1; }
  }

  .dl-loader-text {
    font-family: sans-serif;
    font-size: 13px;
    color: #7c3aed;
    letter-spacing: 0.08em;
    opacity: 0.8;
    animation: pulsoTexto 1.6s ease-in-out infinite;
  }

  @keyframes pulsoTexto {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
</style>

<div id="${LOADER_ID}">
  <div class="dl-heart-wrap">
    <svg class="dl-heart-svg" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
      <path class="dl-heart-path"
        d="M50 80 C50 80 10 52 10 28
           C10 16 18 8 28 8
           C36 8 44 13 50 20
           C56 13 64 8 72 8
           C82 8 90 16 90 28
           C90 52 50 80 50 80 Z"/>
    </svg>
    <span class="dl-loader-text">Cargando...</span>
  </div>
</div>
`;

export function mostrarLoader() {
  if (document.getElementById(LOADER_ID)) return;
  const div = document.createElement("div");
  div.innerHTML = LOADER_HTML;
  document.body.appendChild(div.firstElementChild);
  // Insertar el style también
  const style = div.querySelector("style");
  if (style) document.head.appendChild(style);
}

export function ocultarLoader() {
  const loader = document.getElementById(LOADER_ID);
  if (!loader) return;
  loader.classList.add("ocultar");
  setTimeout(() => loader.remove(), 450);
}