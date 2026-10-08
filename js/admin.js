<<<<<<< HEAD
/* ============================================================
   IMPORTACIONES FIREBASE (v10 modular)
============================================================ */
import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


let currentUser = null;
let currentSection = "hero";
let cachedData = {};

/* ============================================================
   DEFINICIÓN DE SECCIONES
============================================================ */
const SECTIONS = {
  hero:        { title: "Hero",         desc: "Edita la sección principal del sitio", type: "single", doc: "hero" },
  sobre_mi:    { title: "Sobre mí",     desc: "Edita tu presentación personal",       type: "single", doc: "sobre_mi" },
  servicios:   { title: "Servicios",    desc: "Tarjetas de Prana para Vos",           type: "collection", col: "servicios" },
  alma_items:  { title: "Alma de Mar",  desc: "Ítems de gestión cultural",            type: "collection", col: "alma_items" },
  proyectos:   { title: "Proyectos",    desc: "Proyectos destacados",                 type: "collection", col: "proyectos" },
  videos:      { title: "Videos",       desc: "Videos de YouTube",                    type: "collection", col: "videos" },
  libros:      { title: "Libros",       desc: "Libros publicados y en preparación",   type: "collection", col: "libros" },
  galeria:     { title: "Galería",      desc: "Imágenes de la galería",               type: "collection", col: "galeria" },
  testimonios: { title: "Testimonios",  desc: "Voces del camino",                     type: "collection", col: "testimonios" },
  recursos:    { title: "Recursos",     desc: "Recursos descargables",                type: "collection", col: "recursos" },
  contacto:    { title: "Contacto",     desc: "Información de contacto",              type: "single", doc: "contacto" }
};

/* ============================================================
   ESQUEMAS DE CAMPOS POR SECCIÓN
============================================================ */
const SCHEMAS = {
  hero: [
    { name: "eyebrow",     label: "Texto pequeño superior", type: "text" },
    { name: "titulo",      label: "Título principal (parte 1)", type: "text" },
    { name: "titulo_span", label: "Título destacado (parte 2, en color)", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "btn1_texto",  label: "Botón 1 · Texto", type: "text" },
    { name: "btn1_link",   label: "Botón 1 · Enlace", type: "text" },
    { name: "btn2_texto",  label: "Botón 2 · Texto", type: "text" },
    { name: "btn2_link",   label: "Botón 2 · Enlace", type: "text" },
    { name: "imagen_fondo",label: "URL imagen de fondo", type: "image" }
  ],
  sobre_mi: [
    { name: "eyebrow",  label: "Texto pequeño superior", type: "text" },
    { name: "cita",     label: "Cita destacada (blockquote)", type: "textarea" },
    { name: "p1",       label: "Párrafo 1", type: "textarea" },
    { name: "p2",       label: "Párrafo 2", type: "textarea" },
    { name: "p3",       label: "Párrafo 3", type: "textarea" },
    { name: "firma",    label: "Firma", type: "text" },
    { name: "imagen",   label: "URL de la imagen", type: "image" }
  ],
  contacto: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "whatsapp",    label: "WhatsApp (con código país, ej: 5492302661694)", type: "text" },
    { name: "email",       label: "Email", type: "text" },
    { name: "telefono",    label: "Teléfono visible", type: "text" },
    { name: "ubicacion",   label: "Ubicación", type: "text" },
    { name: "instagram",   label: "Instagram (sin @)", type: "text" },
    { name: "youtube",     label: "YouTube (handle)", type: "text" }
  ],
  servicios: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "imagen",      label: "URL de imagen", type: "image" },
    { name: "etiquetas",   label: "Etiquetas (separadas por coma)", type: "text" },
    { name: "boton",       label: "Texto del botón", type: "text", default: "Ver más" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  alma_items: [
    { name: "icono",       label: "Icono (FontAwesome, ej: fa-hand-holding-heart)", type: "text" },
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  proyectos: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  videos: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "video_id",    label: "ID de YouTube (ej: 5FblwmPrR-A)", type: "text" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  libros: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "imagen",      label: "URL de portada", type: "image" },
    { name: "badge",       label: "Etiqueta (ej: Reconocimiento legislativo)", type: "text" },
    { name: "enlace",      label: "Enlace de descarga", type: "text", default: "#" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  galeria: [
    { name: "imagen", label: "URL de imagen", type: "image" },
    { name: "alt",    label: "Texto alternativo", type: "text" },
    { name: "orden",  label: "Orden", type: "number", default: 0 }
  ],
  testimonios: [
    { name: "texto", label: "Testimonio", type: "textarea" },
    { name: "autor", label: "Autor", type: "text" },
    { name: "orden", label: "Orden", type: "number", default: 0 }
  ],
  recursos: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "icono",       label: "Icono (FontAwesome)", type: "text", default: "fa-download" },
    { name: "enlace",      label: "Enlace de descarga", type: "text" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ]
};

/* ============================================================
   INICIALIZACIÓN
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  setupNavigation();
  setupLogout();
});

/* ============================================================
   AUTENTICACIÓN
============================================================ */
function setupLogin() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      errorEl.textContent = traducirError(err.code);
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      showDashboard(user);
    } else {
      currentUser = null;
      showLogin();
    }
  });
}

function traducirError(code) {
  const errores = {
    "auth/invalid-email": "El correo no es válido.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Prueba más tarde."
  };
  return errores[code] || "Error al iniciar sesión. Intenta nuevamente.";
}

function showLogin() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
}

function showDashboard(user) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("user-email").textContent = user.email;
  renderSection(currentSection);
}

function setupLogout() {
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await signOut(auth);
  });
}

/* ============================================================
   NAVEGACIÓN
============================================================ */
function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSection = btn.dataset.section;
      renderSection(currentSection);
    });
  });
}

/* ============================================================
   RENDER DE SECCIONES
============================================================ */
async function renderSection(sectionKey) {
  const cfg = SECTIONS[sectionKey];
  if (!cfg) return;

  document.getElementById("section-title").textContent = cfg.title;
  document.getElementById("section-desc").textContent = cfg.desc;

  const area = document.getElementById("content-area");
  area.innerHTML = `<div class="loading-overlay" style="position:relative;background:transparent;"><i class="fas fa-spinner fa-spin"></i></div>`;

  try {
    if (cfg.type === "single") {
      const snap = await getDoc(doc(db, "config", cfg.doc));
      const data = snap.exists() ? snap.data() : {};
      cachedData[sectionKey] = data;
      area.innerHTML = renderSingleForm(sectionKey, data);
      bindSingleForm(sectionKey);
    } else {
      let docs = [];
      try {
        const q = query(collection(db, cfg.col), orderBy("orden", "asc"));
        const snap = await getDocs(q);
        docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const snap = await getDocs(collection(db, cfg.col));
        docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      cachedData[sectionKey] = docs;
      area.innerHTML = renderCollectionView(sectionKey, docs);
      bindCollectionView(sectionKey);
    }
  } catch (err) {
    console.error(err);
    area.innerHTML = `<div class="card"><p>Error al cargar la sección: ${err.message}</p></div>`;
  }
}

/* ============================================================
   FORMULARIOS SINGLE
============================================================ */
function renderSingleForm(sectionKey, data) {
  const schema = SCHEMAS[sectionKey];
  const fields = schema.map(f => renderField(f, data[f.name])).join("");

  return `
    <div class="card">
      <h3><i class="fas fa-pen"></i> ${SECTIONS[sectionKey].title}</h3>
      <form id="single-form">
        ${fields}
        <div class="form-actions">
          <button type="submit" class="btn btn-primario">
            <i class="fas fa-save"></i> Guardar cambios
          </button>
        </div>
      </form>
    </div>
  `;
}

function bindSingleForm(sectionKey) {
  const form = document.getElementById("single-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const schema = SCHEMAS[sectionKey];
    const payload = {};
    schema.forEach(f => {
      const el = form.querySelector(`[name="${f.name}"]`);
      if (el) payload[f.name] = el.value;
    });
    try {
      const ref = doc(db, "config", SECTIONS[sectionKey].doc);
      await setDoc(ref, payload, { merge: true });
      showToast("Cambios guardados correctamente", "success");
    } catch (err) {
      showToast("Error al guardar: " + err.message, "error");
    }
  });
}

/* ============================================================
   VISTA DE COLECCIONES
============================================================ */
function renderCollectionView(sectionKey, docs) {
  const rows = docs.length
    ? docs.map(d => renderItemRow(sectionKey, d)).join("")
    : `<div class="empty-state">
         <i class="fas fa-inbox"></i>
         <p>No hay elementos todavía.</p>
         <p style="font-size:0.85rem;">Clic en "Nuevo" para agregar el primero.</p>
       </div>`;

  return `
    <div class="items-toolbar">
      <span class="items-count">${docs.length} elemento${docs.length !== 1 ? "s" : ""}</span>
      <button class="btn btn-acento" id="btn-nuevo">
        <i class="fas fa-plus"></i> Nuevo
      </button>
    </div>
    <div class="items-list">${rows}</div>
  `;
}

function renderItemRow(sectionKey, item) {
  const schema = SCHEMAS[sectionKey];
  const titleField = schema.find(f => f.name === "titulo") || schema[0];
  const descField  = schema.find(f => f.name === "descripcion") || schema.find(f => f.name === "texto");
  const imgField   = schema.find(f => f.type === "image");
  const iconField  = schema.find(f => f.name === "icono");

  const title = item[titleField.name] || "(Sin título)";
  const desc  = descField ? (item[descField.name] || "") : "";

  let thumb;
  if (imgField && item[imgField.name]) {
    thumb = `<img src="${escapeHtml(item[imgField.name])}" class="item-thumb" alt="">`;
  } else if (iconField && item[iconField.name]) {
    thumb = `<div class="item-thumb"><i class="fas ${escapeHtml(item[iconField.name])}"></i></div>`;
  } else {
    thumb = `<div class="item-thumb"><i class="fas fa-image"></i></div>`;
  }

  return `
    <div class="item-row" data-id="${item.id}">
      ${thumb}
      <div class="item-info">
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(desc)}</p>
      </div>
      <div class="item-actions">
        <button class="btn-edit" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `;
}

function bindCollectionView(sectionKey) {
  const nuevo = document.getElementById("btn-nuevo");
  if (nuevo) nuevo.addEventListener("click", () => openModal(sectionKey, null));

  document.querySelectorAll(".item-row").forEach(row => {
    const id = row.dataset.id;
    const item = cachedData[sectionKey].find(i => i.id === id);

    row.querySelector(".btn-edit").addEventListener("click", () => openModal(sectionKey, item));
    row.querySelector(".btn-delete").addEventListener("click", () => confirmDelete(sectionKey, id, item));
  });
}

/* ============================================================
   MODAL
============================================================ */
function openModal(sectionKey, item) {
  const schema = SCHEMAS[sectionKey];
  const isEdit = !!item;
  const fields = schema.map(f => {
    let val = item ? item[f.name] : f.default;
    if (f.name === "etiquetas" && Array.isArray(val)) val = val.join(", ");
    return renderField(f, val);
  }).join("");

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h3>${isEdit ? "Editar" : "Nuevo"} · ${SECTIONS[sectionKey].title}</h3>
      <form id="modal-form">
        ${fields}
        <div class="form-actions">
          <button type="button" class="btn btn-borde" id="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn btn-primario">
            <i class="fas fa-save"></i> ${isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector("#btn-cancelar").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector("#modal-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {};

    schema.forEach(f => {
      const el = form.querySelector(`[name="${f.name}"]`);
      if (!el) return;
      if (f.name === "etiquetas") {
        payload[f.name] = el.value.split(",").map(s => s.trim()).filter(Boolean);
      } else if (f.type === "number") {
        payload[f.name] = Number(el.value) || 0;
      } else {
        payload[f.name] = el.value;
      }
    });

    try {
      if (isEdit) {
        await updateDoc(doc(db, SECTIONS[sectionKey].col, item.id), payload);
        showToast("Elemento actualizado", "success");
      } else {
        payload.creado = serverTimestamp();
        await addDoc(collection(db, SECTIONS[sectionKey].col), payload);
        showToast("Elemento creado", "success");
      }
      overlay.remove();
      renderSection(sectionKey);
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  });
}

/* ============================================================
   ELIMINAR
============================================================ */
function confirmDelete(sectionKey, id, item) {
  const nombre = item?.titulo || item?.texto || item?.autor || "este elemento";
  if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

  deleteDoc(doc(db, SECTIONS[sectionKey].col, id))
    .then(() => {
      showToast("Elemento eliminado", "success");
      renderSection(sectionKey);
    })
    .catch(err => showToast("Error: " + err.message, "error"));
}

/* ============================================================
   RENDER DE CAMPOS
============================================================ */
function renderField(field, value = "") {
  const val = value ?? "";
  const escaped = escapeHtml(String(val));

  if (field.type === "textarea") {
    return `
      <div class="field">
        <label for="f-${field.name}">${field.label}</label>
        <textarea id="f-${field.name}" name="${field.name}" rows="3">${escaped}</textarea>
      </div>`;
  }

  if (field.type === "image") {
    return `
      <div class="field">
        <label for="f-${field.name}">${field.label}</label>
        <input type="url" id="f-${field.name}" name="${field.name}" value="${escaped}" placeholder="https://...">
        <span class="hint"><i class="fas fa-info-circle"></i> Puedes pegar la URL de Unsplash, Drive, etc.</span>
        <div class="img-preview" id="preview-${field.name}" ${val ? "" : 'style="display:none;"'}>
          <img src="${escaped}" alt="preview" onerror="this.style.display='none'">
        </div>
      </div>`;
  }

  if (field.type === "number") {
    return `
      <div class="field">
        <label for="f-${field.name}">${field.label}</label>
        <input type="number" id="f-${field.name}" name="${field.name}" value="${escaped}">
      </div>`;
  }

  return `
    <div class="field">
      <label for="f-${field.name}">${field.label}</label>
      <input type="text" id="f-${field.name}" name="${field.name}" value="${escaped}">
    </div>`;
}

/* Previsualización de imágenes en tiempo real */
document.addEventListener("input", (e) => {
  const input = e.target;
  if (input.type !== "url" || !input.name) return;
  const preview = document.getElementById(`preview-${input.name}`);
  if (!preview) return;
  const img = preview.querySelector("img");
  if (input.value.trim()) {
    preview.style.display = "block";
    img.src = input.value.trim();
    img.style.display = "block";
  } else {
    preview.style.display = "none";
  }
});

/* ============================================================
   TOAST
============================================================ */
let toastTimeout;
function showToast(msg, type = "info") {
  const toast = document.getElementById("toast");
  const icons = { success: "fa-check-circle", error: "fa-exclamation-circle", info: "fa-info-circle" };
  toast.className = `toast ${type} show`;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ============================================================
   UTILIDADES
============================================================ */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
=======
/* ============================================================
   IMPORTACIONES FIREBASE (v10 modular)
============================================================ */
import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


let currentUser = null;
let currentSection = "hero";
let cachedData = {};

/* ============================================================
   DEFINICIÓN DE SECCIONES
============================================================ */
const SECTIONS = {
  hero:        { title: "Hero",         desc: "Edita la sección principal del sitio", type: "single", doc: "hero" },
  sobre_mi:    { title: "Sobre mí",     desc: "Edita tu presentación personal",       type: "single", doc: "sobre_mi" },
  servicios:   { title: "Servicios",    desc: "Tarjetas de Prana para Vos",           type: "collection", col: "servicios" },
  alma_items:  { title: "Alma de Mar",  desc: "Ítems de gestión cultural",            type: "collection", col: "alma_items" },
  proyectos:   { title: "Proyectos",    desc: "Proyectos destacados",                 type: "collection", col: "proyectos" },
  videos:      { title: "Videos",       desc: "Videos de YouTube",                    type: "collection", col: "videos" },
  libros:      { title: "Libros",       desc: "Libros publicados y en preparación",   type: "collection", col: "libros" },
  galeria:     { title: "Galería",      desc: "Imágenes de la galería",               type: "collection", col: "galeria" },
  testimonios: { title: "Testimonios",  desc: "Voces del camino",                     type: "collection", col: "testimonios" },
  recursos:    { title: "Recursos",     desc: "Recursos descargables",                type: "collection", col: "recursos" },
  contacto:    { title: "Contacto",     desc: "Información de contacto",              type: "single", doc: "contacto" }
};

/* ============================================================
   ESQUEMAS DE CAMPOS POR SECCIÓN
============================================================ */
const SCHEMAS = {
  hero: [
    { name: "eyebrow",     label: "Texto pequeño superior", type: "text" },
    { name: "titulo",      label: "Título principal (parte 1)", type: "text" },
    { name: "titulo_span", label: "Título destacado (parte 2, en color)", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "btn1_texto",  label: "Botón 1 · Texto", type: "text" },
    { name: "btn1_link",   label: "Botón 1 · Enlace", type: "text" },
    { name: "btn2_texto",  label: "Botón 2 · Texto", type: "text" },
    { name: "btn2_link",   label: "Botón 2 · Enlace", type: "text" },
    { name: "imagen_fondo",label: "URL imagen de fondo", type: "image" }
  ],
  sobre_mi: [
    { name: "eyebrow",  label: "Texto pequeño superior", type: "text" },
    { name: "cita",     label: "Cita destacada (blockquote)", type: "textarea" },
    { name: "p1",       label: "Párrafo 1", type: "textarea" },
    { name: "p2",       label: "Párrafo 2", type: "textarea" },
    { name: "p3",       label: "Párrafo 3", type: "textarea" },
    { name: "firma",    label: "Firma", type: "text" },
    { name: "imagen",   label: "URL de la imagen", type: "image" }
  ],
  contacto: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "whatsapp",    label: "WhatsApp (con código país, ej: 5492302661694)", type: "text" },
    { name: "email",       label: "Email", type: "text" },
    { name: "telefono",    label: "Teléfono visible", type: "text" },
    { name: "ubicacion",   label: "Ubicación", type: "text" },
    { name: "instagram",   label: "Instagram (sin @)", type: "text" },
    { name: "youtube",     label: "YouTube (handle)", type: "text" }
  ],
  servicios: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "imagen",      label: "URL de imagen", type: "image" },
    { name: "etiquetas",   label: "Etiquetas (separadas por coma)", type: "text" },
    { name: "boton",       label: "Texto del botón", type: "text", default: "Ver más" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  alma_items: [
    { name: "icono",       label: "Icono (FontAwesome, ej: fa-hand-holding-heart)", type: "text" },
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  proyectos: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  videos: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "video_id",    label: "ID de YouTube (ej: 5FblwmPrR-A)", type: "text" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  libros: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "imagen",      label: "URL de portada", type: "image" },
    { name: "badge",       label: "Etiqueta (ej: Reconocimiento legislativo)", type: "text" },
    { name: "enlace",      label: "Enlace de descarga", type: "text", default: "#" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ],
  galeria: [
    { name: "imagen", label: "URL de imagen", type: "image" },
    { name: "alt",    label: "Texto alternativo", type: "text" },
    { name: "orden",  label: "Orden", type: "number", default: 0 }
  ],
  testimonios: [
    { name: "texto", label: "Testimonio", type: "textarea" },
    { name: "autor", label: "Autor", type: "text" },
    { name: "orden", label: "Orden", type: "number", default: 0 }
  ],
  recursos: [
    { name: "titulo",      label: "Título", type: "text" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "icono",       label: "Icono (FontAwesome)", type: "text", default: "fa-download" },
    { name: "enlace",      label: "Enlace de descarga", type: "text" },
    { name: "orden",       label: "Orden", type: "number", default: 0 }
  ]
};

/* ============================================================
   INICIALIZACIÓN
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  setupNavigation();
  setupLogout();
});

/* ============================================================
   AUTENTICACIÓN
============================================================ */
function setupLogin() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      errorEl.textContent = traducirError(err.code);
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      showDashboard(user);
    } else {
      currentUser = null;
      showLogin();
    }
  });
}

function traducirError(code) {
  const errores = {
    "auth/invalid-email": "El correo no es válido.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Prueba más tarde."
  };
  return errores[code] || "Error al iniciar sesión. Intenta nuevamente.";
}

function showLogin() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
}

function showDashboard(user) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("user-email").textContent = user.email;
  renderSection(currentSection);
}

function setupLogout() {
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await signOut(auth);
  });
}

/* ============================================================
   NAVEGACIÓN
============================================================ */
function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSection = btn.dataset.section;
      renderSection(currentSection);
    });
  });
}

/* ============================================================
   RENDER DE SECCIONES
============================================================ */
async function renderSection(sectionKey) {
  const cfg = SECTIONS[sectionKey];
  if (!cfg) return;

  document.getElementById("section-title").textContent = cfg.title;
  document.getElementById("section-desc").textContent = cfg.desc;

  const area = document.getElementById("content-area");
  area.innerHTML = `<div class="loading-overlay" style="position:relative;background:transparent;"><i class="fas fa-spinner fa-spin"></i></div>`;

  try {
    if (cfg.type === "single") {
      const snap = await getDoc(doc(db, "config", cfg.doc));
      const data = snap.exists() ? snap.data() : {};
      cachedData[sectionKey] = data;
      area.innerHTML = renderSingleForm(sectionKey, data);
      bindSingleForm(sectionKey);
    } else {
      let docs = [];
      try {
        const q = query(collection(db, cfg.col), orderBy("orden", "asc"));
        const snap = await getDocs(q);
        docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const snap = await getDocs(collection(db, cfg.col));
        docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      cachedData[sectionKey] = docs;
      area.innerHTML = renderCollectionView(sectionKey, docs);
      bindCollectionView(sectionKey);
    }
  } catch (err) {
    console.error(err);
    area.innerHTML = `<div class="card"><p>Error al cargar la sección: ${err.message}</p></div>`;
  }
}

/* ============================================================
   FORMULARIOS SINGLE
============================================================ */
function renderSingleForm(sectionKey, data) {
  const schema = SCHEMAS[sectionKey];
  const fields = schema.map(f => renderField(f, data[f.name])).join("");

  return `
    <div class="card">
      <h3><i class="fas fa-pen"></i> ${SECTIONS[sectionKey].title}</h3>
      <form id="single-form">
        ${fields}
        <div class="form-actions">
          <button type="submit" class="btn btn-primario">
            <i class="fas fa-save"></i> Guardar cambios
          </button>
        </div>
      </form>
    </div>
  `;
}

function bindSingleForm(sectionKey) {
  const form = document.getElementById("single-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const schema = SCHEMAS[sectionKey];
    const payload = {};
    schema.forEach(f => {
      const el = form.querySelector(`[name="${f.name}"]`);
      if (el) payload[f.name] = el.value;
    });
    try {
      const ref = doc(db, "config", SECTIONS[sectionKey].doc);
      await setDoc(ref, payload, { merge: true });
      showToast("Cambios guardados correctamente", "success");
    } catch (err) {
      showToast("Error al guardar: " + err.message, "error");
    }
  });
}

/* ============================================================
   VISTA DE COLECCIONES
============================================================ */
function renderCollectionView(sectionKey, docs) {
  const rows = docs.length
    ? docs.map(d => renderItemRow(sectionKey, d)).join("")
    : `<div class="empty-state">
         <i class="fas fa-inbox"></i>
         <p>No hay elementos todavía.</p>
         <p style="font-size:0.85rem;">Clic en "Nuevo" para agregar el primero.</p>
       </div>`;

  return `
    <div class="items-toolbar">
      <span class="items-count">${docs.length} elemento${docs.length !== 1 ? "s" : ""}</span>
      <button class="btn btn-acento" id="btn-nuevo">
        <i class="fas fa-plus"></i> Nuevo
      </button>
    </div>
    <div class="items-list">${rows}</div>
  `;
}

function renderItemRow(sectionKey, item) {
  const schema = SCHEMAS[sectionKey];
  const titleField = schema.find(f => f.name === "titulo") || schema[0];
  const descField  = schema.find(f => f.name === "descripcion") || schema.find(f => f.name === "texto");
  const imgField   = schema.find(f => f.type === "image");
  const iconField  = schema.find(f => f.name === "icono");

  const title = item[titleField.name] || "(Sin título)";
  const desc  = descField ? (item[descField.name] || "") : "";

  let thumb;
  if (imgField && item[imgField.name]) {
    thumb = `<img src="${escapeHtml(item[imgField.name])}" class="item-thumb" alt="">`;
  } else if (iconField && item[iconField.name]) {
    thumb = `<div class="item-thumb"><i class="fas ${escapeHtml(item[iconField.name])}"></i></div>`;
  } else {
    thumb = `<div class="item-thumb"><i class="fas fa-image"></i></div>`;
  }

  return `
    <div class="item-row" data-id="${item.id}">
      ${thumb}
      <div class="item-info">
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(desc)}</p>
      </div>
      <div class="item-actions">
        <button class="btn-edit" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `;
}

function bindCollectionView(sectionKey) {
  const nuevo = document.getElementById("btn-nuevo");
  if (nuevo) nuevo.addEventListener("click", () => openModal(sectionKey, null));

  document.querySelectorAll(".item-row").forEach(row => {
    const id = row.dataset.id;
    const item = cachedData[sectionKey].find(i => i.id === id);

    row.querySelector(".btn-edit").addEventListener("click", () => openModal(sectionKey, item));
    row.querySelector(".btn-delete").addEventListener("click", () => confirmDelete(sectionKey, id, item));
  });
}

/* ============================================================
   MODAL
============================================================ */
function openModal(sectionKey, item) {
  const schema = SCHEMAS[sectionKey];
  const isEdit = !!item;
  const fields = schema.map(f => {
    let val = item ? item[f.name] : f.default;
    if (f.name === "etiquetas" && Array.isArray(val)) val = val.join(", ");
    return renderField(f, val);
  }).join("");

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h3>${isEdit ? "Editar" : "Nuevo"} · ${SECTIONS[sectionKey].title}</h3>
      <form id="modal-form">
        ${fields}
        <div class="form-actions">
          <button type="button" class="btn btn-borde" id="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn btn-primario">
            <i class="fas fa-save"></i> ${isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector("#btn-cancelar").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector("#modal-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {};

    schema.forEach(f => {
      const el = form.querySelector(`[name="${f.name}"]`);
      if (!el) return;
      if (f.name === "etiquetas") {
        payload[f.name] = el.value.split(",").map(s => s.trim()).filter(Boolean);
      } else if (f.type === "number") {
        payload[f.name] = Number(el.value) || 0;
      } else {
        payload[f.name] = el.value;
      }
    });

    try {
      if (isEdit) {
        await updateDoc(doc(db, SECTIONS[sectionKey].col, item.id), payload);
        showToast("Elemento actualizado", "success");
      } else {
        payload.creado = serverTimestamp();
        await addDoc(collection(db, SECTIONS[sectionKey].col), payload);
        showToast("Elemento creado", "success");
      }
      overlay.remove();
      renderSection(sectionKey);
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  });
}

/* ============================================================
   ELIMINAR
============================================================ */
function confirmDelete(sectionKey, id, item) {
  const nombre = item?.titulo || item?.texto || item?.autor || "este elemento";
  if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

  deleteDoc(doc(db, SECTIONS[sectionKey].col, id))
    .then(() => {
      showToast("Elemento eliminado", "success");
      renderSection(sectionKey);
    })
    .catch(err => showToast("Error: " + err.message, "error"));
}

/* ============================================================
   RENDER DE CAMPOS
============================================================ */
function renderField(field, value = "") {
  const val = value ?? "";
  const escaped = escapeHtml(String(val));

  if (field.type === "textarea") {
    return `
      <div class="field">
        <label for="f-${field.name}">${field.label}</label>
        <textarea id="f-${field.name}" name="${field.name}" rows="3">${escaped}</textarea>
      </div>`;
  }

  if (field.type === "image") {
    return `
      <div class="field">
        <label for="f-${field.name}">${field.label}</label>
        <input type="url" id="f-${field.name}" name="${field.name}" value="${escaped}" placeholder="https://...">
        <span class="hint"><i class="fas fa-info-circle"></i> Puedes pegar la URL de Unsplash, Drive, etc.</span>
        <div class="img-preview" id="preview-${field.name}" ${val ? "" : 'style="display:none;"'}>
          <img src="${escaped}" alt="preview" onerror="this.style.display='none'">
        </div>
      </div>`;
  }

  if (field.type === "number") {
    return `
      <div class="field">
        <label for="f-${field.name}">${field.label}</label>
        <input type="number" id="f-${field.name}" name="${field.name}" value="${escaped}">
      </div>`;
  }

  return `
    <div class="field">
      <label for="f-${field.name}">${field.label}</label>
      <input type="text" id="f-${field.name}" name="${field.name}" value="${escaped}">
    </div>`;
}

/* Previsualización de imágenes en tiempo real */
document.addEventListener("input", (e) => {
  const input = e.target;
  if (input.type !== "url" || !input.name) return;
  const preview = document.getElementById(`preview-${input.name}`);
  if (!preview) return;
  const img = preview.querySelector("img");
  if (input.value.trim()) {
    preview.style.display = "block";
    img.src = input.value.trim();
    img.style.display = "block";
  } else {
    preview.style.display = "none";
  }
});

/* ============================================================
   TOAST
============================================================ */
let toastTimeout;
function showToast(msg, type = "info") {
  const toast = document.getElementById("toast");
  const icons = { success: "fa-check-circle", error: "fa-exclamation-circle", info: "fa-info-circle" };
  toast.className = `toast ${type} show`;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ============================================================
   UTILIDADES
============================================================ */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
>>>>>>> 763b9fe96dd33c59b34b0d3670d8afcc369c61af
}