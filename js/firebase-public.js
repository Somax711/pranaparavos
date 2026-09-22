/* ============================================================
   INICIALIZACIÓN
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  Promise.allSettled([
    cargarHero(),
    cargarSobreMi(),
    cargarServicios(),
    cargarAlmaItems(),
    cargarProyectos(),
    cargarVideos(),
    cargarLibros(),
    cargarGaleria(),
    cargarRecursos(),
    cargarTestimonios(),
    cargarContacto()
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === "rejected") console.warn("Sección", i, "falló:", r.reason);
    });
    if (typeof window.initDynamicListeners === "function") {
      window.initDynamicListeners();
    }
  });
});
import { db } from "./firebase-config.js";
import {
  doc, getDoc,collection, getDocs, query, orderBy
}

from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ============================================================
   UTILIDADES
============================================================ */
const $  = (sel) => document.querySelector(sel);

function setText(selector, value) {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (el && value != null && value !== "") el.textContent = value;
}

function setHTML(selector, value) {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (el && value != null && value !== "") el.innerHTML = value;
}

function setAttr(selector, attr, value) {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (el && value != null && value !== "") el.setAttribute(attr, value);
}

async function fetchCollection(name) {
  try {
    const q = query(collection(db, name), orderBy("orden", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

async function fetchConfig(name) {
  try {
    const snap = await getDoc(doc(db, "config", name));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

/* ============================================================
   HERO
============================================================ */
async function cargarHero() {
  const d = await fetchConfig("hero");
  if (!d) return;

  setText('[data-cms="hero-eyebrow"]', d.eyebrow);

  if (d.titulo || d.titulo_span) {
    setHTML('[data-cms="hero-titulo"]',
      `${d.titulo || ""}${d.titulo_span ? ` <span>${d.titulo_span}</span>` : ""}`);
  }

  setText('[data-cms="hero-descripcion"]', d.descripcion);

  const actions = $('[data-cms="hero-actions"]');
  if (actions && (d.btn1_texto || d.btn2_texto)) {
    actions.innerHTML = "";
    if (d.btn1_texto) {
      actions.innerHTML += `<a href="${d.btn1_link || "#"}" class="btn btn-claro">${d.btn1_texto}</a>`;
    }
    if (d.btn2_texto) {
      actions.innerHTML += `<a href="${d.btn2_link || "#"}" class="btn btn-borde-claro">${d.btn2_texto}</a>`;
    }
  }

  if (d.imagen_fondo) {
    const hero = $(".hero");
    if (hero) {
      hero.style.backgroundImage =
        `linear-gradient(95deg, rgba(34,48,43,0.75) 0%, rgba(34,48,43,0.4) 100%), url('${d.imagen_fondo}')`;
    }
  }
}

/* ============================================================
   SOBRE MÍ
============================================================ */
async function cargarSobreMi() {
  const d = await fetchConfig("sobre_mi");
  if (!d) return;

  setText('[data-cms="sobre-eyebrow"]', d.eyebrow);
  setText('[data-cms="sobre-cita"]', d.cita);
  setText('[data-cms="sobre-p1"]', d.p1);
  setText('[data-cms="sobre-p2"]', d.p2);
  setText('[data-cms="sobre-p3"]', d.p3);
  setText('[data-cms="sobre-firma"]', d.firma);
  setAttr('[data-cms="sobre-imagen"]', "src", d.imagen);
}

/* ============================================================
   SERVICIOS
============================================================ */
async function cargarServicios() {
  const servicios = await fetchCollection("servicios");
  const cont = $("#servicios-container");
  if (!cont || !servicios.length) return;

  cont.innerHTML = servicios.map(s => `
    <div class="card-terapia">
      <div class="card-img">
        <img src="${s.imagen || ''}" alt="${s.titulo || ''}">
      </div>
      <div class="card-body">
        <h3>${s.titulo || ''}</h3>
        <p>${s.descripcion || ''}</p>
        <div class="etiquetas">
          ${(s.etiquetas || []).map(e => `<span>${e}</span>`).join("")}
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-descarga">
          ${s.boton || "Ver más"} <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `).join("");
}

/* ============================================================
   ALMA DE MAR
============================================================ */
async function cargarAlmaItems() {
  const items = await fetchCollection("alma_items");
  const cont = $("#alma-container");
  if (!cont || !items.length) return;

  cont.innerHTML = items.map(i => `
    <div class="alma-item">
      <i class="fas ${i.icono || 'fa-star'}"></i>
      <h4>${i.titulo || ''}</h4>
      <p>${i.descripcion || ''}</p>
    </div>
  `).join("");
}

/* ============================================================
  PROYECTOS
============================================================ */
async function cargarProyectos() {
  const proyectos = await fetchCollection("proyectos");
  const cont = $("#proyectos-container");
  if (!cont || !proyectos.length) return;

  cont.innerHTML = proyectos.map(p => `
    <div class="proyecto-card">
      <h4>${p.titulo || ''}</h4>
      <p>${p.descripcion || ''}</p>
    </div>
  `).join("");
}

/* ============================================================
   VIDEOS YOUTUBE
============================================================ */
async function cargarVideos() {
  const videos = await fetchCollection("videos");
  const cont = $("#videos-container");
  if (!cont || !videos.length) return;

  cont.innerHTML = videos.map(v => `
    <div class="youtube-card">
      <div class="yt-thumb">
        <img src="https://img.youtube.com/vi/${v.video_id}/maxresdefault.jpg" alt="${v.titulo || ''}">
        <div class="play-icon"><i class="fab fa-youtube"></i></div>
      </div>
      <div class="yt-body">
        <h4>${v.titulo || ''}</h4>
        <p>${v.descripcion || ''}</p>
        <a href="https://www.youtube.com/watch?v=${v.video_id}" target="_blank"
           class="btn btn-acento"
           style="margin-top:0.5rem; padding:0.4rem 1.2rem; font-size:0.8rem;">
          Ver video <i class="fas fa-play"></i>
        </a>
      </div>
    </div>
  `).join("");
}

/* ============================================================
   LIBROS
============================================================ */
async function cargarLibros() {
  const libros = await fetchCollection("libros");
  const cont = $("#libros-container");
  if (!cont || !libros.length) return;

  cont.innerHTML = libros.map(l => `
    <div class="libro-card">
      <div class="libro-portada">
        <img src="${l.imagen || ''}" alt="${l.titulo || ''}">
      </div>
      <div class="libro-body">
        <h4>${l.titulo || ''}</h4>
        <p>${l.descripcion || ''}</p>
        ${l.badge ? `<span class="badge">⭐ ${l.badge}</span>` : ""}
        <div style="margin-top:0.8rem;">
          <a href="${l.enlace || '#'}" class="btn btn-primario"
             style="padding:0.4rem 1.2rem; font-size:0.8rem;">
            Descargar PDF
          </a>
        </div>
      </div>
    </div>
  `).join("");
}

/* ============================================================
  GALERÍA
============================================================ */
async function cargarGaleria() {
  const fotos = await fetchCollection("galeria");
  const cont = $("#galeria-container");
  if (!cont || !fotos.length) return;

  cont.innerHTML = fotos.map(f => `
    <div class="galeria-item">
      <img src="${f.imagen || ''}" alt="${f.alt || ''}">
    </div>
  `).join("");
}

/* ============================================================
   RECURSOS
============================================================ */
async function cargarRecursos() {
  const recursos = await fetchCollection("recursos");
  const cont = $("#recursos-container");
  if (!cont || !recursos.length) return;

  cont.innerHTML = recursos.map(r => `
    <div class="retiro-card">
      <i class="fas ${r.icono || 'fa-download'}"></i>
      <h4>${r.titulo || ''}</h4>
      <p>${r.descripcion || ''}</p>
      ${r.enlace ? `
        <a href="${r.enlace}" target="_blank" class="btn btn-acento"
           style="margin-top:0.8rem; padding:0.4rem 1.2rem; font-size:0.8rem;">
          Descargar <i class="fas fa-download"></i>
        </a>` : ""}
    </div>
  `).join("");
}

/* ============================================================
  TESTIMONIOS
============================================================ */
async function cargarTestimonios() {
  const testis = await fetchCollection("testimonios");
  const cont = $("#testimonios-container");
  if (!cont || !testis.length) return;

  cont.innerHTML = testis.map(t => `
    <div class="testi-card">
      <p>"${t.texto || ''}"</p>
      <span>— ${t.autor || ''}</span>
    </div>
  `).join("");
}

/* ============================================================
   CONTACTO
============================================================ */
async function cargarContacto() {
  const d = await fetchConfig("contacto");
  if (!d) return;

  setText('[data-cms="contacto-titulo"]', d.titulo);
  setText('[data-cms="contacto-descripcion"]', d.descripcion);

  const actions = $('[data-cms="contacto-actions"]');
  if (actions) {
    actions.innerHTML = `
      <a href="https://wa.me/${d.whatsapp || ''}" target="_blank" class="btn btn-claro">
        <i class="fab fa-whatsapp"></i> WhatsApp
      </a>
      <a href="mailto:${d.email || ''}" class="btn btn-borde-claro">
        <i class="fas fa-envelope"></i> Email
      </a>
    `;
  }

  const details = $('[data-cms="contacto-details"]');
  if (details) {
    details.innerHTML = `
      <span><i class="fas fa-phone"></i> ${d.telefono || ''}</span>
      <span><i class="fas fa-map-marker-alt"></i> ${d.ubicacion || ''}</span>
      <span><i class="fab fa-instagram"></i> @${d.instagram || ''}</span>
      <span><i class="fab fa-youtube"></i> /${d.youtube || ''}</span>
    `;
  }

  const footerEmail = $('[data-cms="footer-email"]');
  if (footerEmail && d.email) {
    footerEmail.textContent = d.email;
    footerEmail.href = `mailto:${d.email}`;
  }
  const footerWa = $('[data-cms="footer-whatsapp"]');
  if (footerWa && d.whatsapp) footerWa.href = `https://wa.me/${d.whatsapp}`;
  const footerIg = $('[data-cms="footer-instagram"]');
  if (footerIg && d.instagram) footerIg.href = `https://instagram.com/${d.instagram}`;
  const footerYt = $('[data-cms="footer-youtube"]');
  if (footerYt && d.youtube) footerYt.href = `https://youtube.com/@${d.youtube}`;
}

/* ============================================================
   INICIALIZACIÓN
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  Promise.allSettled([
    cargarHero(),
    cargarSobreMi(),
    cargarServicios(),
    cargarAlmaItems(),
    cargarProyectos(),
    cargarVideos(),
    cargarLibros(),
    cargarGaleria(),
    cargarRecursos(),
    cargarTestimonios(),
    cargarContacto()
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === "rejected") console.warn("Sección", i, "falló:", r.reason);
    });
    if (typeof window.initDynamicListeners === "function") {
      window.initDynamicListeners();
    }
  });
});