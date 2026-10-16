console.log("1. admin.js se ha cargado");
/* ============================================================
   IMPORTACIONES FIREBASE (v10 modular)
============================================================ */
import { auth, db, storage } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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
    { name: "enlace",      label: "Archivo PDF del libro (Subir o pegar enlace)", type: "file", default: "" },
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
    { name: "enlace",      label: "Archivo descargable (Subir PDF o pegar enlace)", type: "file", default: "" },
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
   SUBIDA DE ARCHIVOS A FIREBASE (Storage con respaldo en Firestore)
============================================================ */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function subirArchivoAFirebase(file, folder, onProgress) {
  try {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const ref = storageRef(storage, `${folder}/${safeName}`);
    const uploadPromise = uploadBytes(ref, file).then(() => getDownloadURL(ref));
    const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error("Storage timeout")), 7000));
    const url = await Promise.race([uploadPromise, timeoutPromise]);
    return url;
  } catch (storageErr) {
    console.warn("Firebase Storage no disponible, guardando PDF directamente en Firestore...", storageErr.message);
  }

  // 2. Respaldo automático en Firebase Firestore 
  const dataUrl = await fileToDataURL(file);
  const chunkSize = 700000; 
  const totalChunks = Math.ceil(dataUrl.length / chunkSize);

  if (totalChunks > 25) {
    throw new Error("El archivo PDF supera los 12 MB. Por favor comprime el PDF o usa un enlace externo.");
  }

  const fileId = `pdf_${Date.now()}`;
  await setDoc(doc(db, "archivos_pdf", fileId), {
    nombre: file.name,
    tipo: file.type || "application/pdf",
    totalChunks,
    creado: serverTimestamp()
  });

  for (let i = 0; i < totalChunks; i++) {
    if (onProgress) onProgress(Math.round(((i + 1) / totalChunks) * 100));
    const chunkData = dataUrl.slice(i * chunkSize, (i + 1) * chunkSize);
    await setDoc(doc(db, "archivos_pdf", `${fileId}_part_${i}`), {
      fileId,
      index: i,
      data: chunkData
    });
  }

  return `firestore-pdf://${fileId}/${encodeURIComponent(file.name)}`;
}


/* ============================================================
   COMPRESOR DE IMÁGENES RESPONSIVAS 
============================================================ */
function procesarImagenResponsiva(file, maxWidth = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente si supera el ancho máximo
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a WebP (o JPEG) optimizado y ligero para Firebase
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (dataUrl.indexOf("data:image/webp") !== 0) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("No se pudo procesar la imagen seleccionada."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo de imagen."));
    reader.readAsDataURL(file);
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
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Guardando...`;

    const payload = {};

    try {
      for (const f of schema) {
        const el = form.querySelector(`[name="${f.name}"]`);
        if (!el) continue;

        if (f.type === "file") {
          const fileInput = form.querySelector(`#file-${f.name}`);
          const file = fileInput?.files?.[0];
          if (file) {
            const statusEl = form.querySelector(`#status-${f.name}`);
            if (statusEl) statusEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Subiendo "${escapeHtml(file.name)}" a Firebase...`;

            payload[f.name] = await subirArchivoAFirebase(file, sectionKey, (pct) => {
              if (statusEl) statusEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Guardando en Firebase (${pct}%)...`;
            });
            payload.nombre_archivo = file.name;
          } else {
            payload[f.name] = el.value.trim();
          }
        } else if (f.name === "etiquetas") {
          payload[f.name] = el.value.split(",").map(s => s.trim()).filter(Boolean);
        } else if (f.type === "number") {
          payload[f.name] = Number(el.value) || 0;
        } else {
          payload[f.name] = el.value;
        }
      }

      if (isEdit) {
        await updateDoc(doc(db, SECTIONS[sectionKey].col, item.id), payload);
        showToast("Elemento actualizado correctamente", "success");
      } else {
        payload.creado = serverTimestamp();
        await addDoc(collection(db, SECTIONS[sectionKey].col), payload);
        showToast("Elemento creado y guardado", "success");
      }
      overlay.remove();
      renderSection(sectionKey);
    } catch (err) {
      console.error(err);
      showToast("Error: " + err.message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
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

  if (field.type === "file") {
    const tieneArchivo = Boolean(val && val !== "#");
    return `
      <div class="field">
        <label for="file-${field.name}">${field.label}</label>
        <input type="file" id="file-${field.name}" accept=".pdf,.epub,.doc,.docx" style="margin-bottom:0.5rem; padding:0.4rem; border:1px dashed #c5894e; border-radius:8px; width:100%; background:#fffdf9; cursor:pointer;">
        <input type="text" id="f-${field.name}" name="${field.name}" value="${escaped}" placeholder="O pega aquí un enlace directo (https://...)">
        <span class="hint" id="status-${field.name}">
          <i class="fas fa-file-pdf"></i> ${tieneArchivo ? "✅ Ya hay un archivo guardado. Sube otro si deseas reemplazarlo." : "Selecciona un archivo PDF desde tu computadora."}
        </span>
      </div>`;
  }

if (field.type === "image") {
    return `
      <div class="field">
        <label for="img-file-${field.name}">${field.label}</label>
        <input type="file" id="img-file-${field.name}" data-img-target="${field.name}" accept="image/*"
               style="margin-bottom:0.5rem; padding:0.4rem; border:1px dashed #c5894e; border-radius:8px; width:100%; background:#fffdf9; cursor:pointer;">
        <input type="text" id="f-${field.name}" name="${field.name}" value="${escaped}" placeholder="Sube una imagen arriba o pega una URL (https://...)">
        <span class="hint" id="img-status-${field.name}">
          <i class="fas fa-image"></i> Selecciona una imagen de tu dispositivo (se optimizará automáticamente) o pega un enlace.
        </span>
        <div class="img-preview" id="preview-${field.name}" style="${val ? "display:block;" : "display:none;"} margin-top:0.6rem;">
          <img src="${escaped}" alt="Vista previa"
               style="width:100%; max-width:160px; aspect-ratio:3/4; object-fit:cover; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.12);"
               onerror="this.style.display='none'">
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

/* Subida y compresión automática al elegir imagen desde el dispositivo */
document.addEventListener("change", async (e) => {
  const fileInput = e.target;
  if (fileInput.type !== "file" || !fileInput.dataset.imgTarget) return;

  const fieldName = fileInput.dataset.imgTarget;
  const file = fileInput.files?.[0];
  if (!file) return;

  const hiddenInput = document.getElementById(`f-${fieldName}`);
  const preview = document.getElementById(`preview-${fieldName}`);
  const statusEl = document.getElementById(`img-status-${fieldName}`);

  try {
    if (statusEl) {
      statusEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Optimizando imagen para web...`;
    }
    const maxW = fieldName === "imagen_fondo" ? 1200 : 600;
    const optimizedDataUrl = await procesarImagenResponsiva(file, maxW, 0.82);

    if (hiddenInput) hiddenInput.value = optimizedDataUrl;
    if (preview) {
      const img = preview.querySelector("img");
      preview.style.display = "block";
      img.src = optimizedDataUrl;
      img.style.display = "block";
    }
    if (statusEl) {
      statusEl.innerHTML = `<i class="fas fa-check-circle" style="color:#3B5249;"></i> Imagen "${escapeHtml(file.name)}" lista y optimizada. Dale a Guardar.`;
    }
  } catch (err) {
    console.error(err);
    showToast("Error al procesar la imagen: " + err.message, "error");
  }
});

/* Previsualización si el usuario pega una URL manualmente */
document.addEventListener("input", (e) => {
  const input = e.target;
  if (!input.name || !input.id?.startsWith("f-")) return;
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
}