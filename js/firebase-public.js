import { db } from "./firebase-config.js";
import {
  doc, getDoc, collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ============================================================
   UTILIDADES
============================================================ */
const $ = (sel) => document.querySelector(sel);

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
   DESCARGA DIRECTA DE PDF DESDE FIREBASE
============================================================ */
async function descargarPdfDesdeFirestore(enlace, btnEl) {
  const textoOriginal = btnEl.innerHTML;
  try {
    btnEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Preparando PDF...`;
    btnEl.style.pointerEvents = "none";

    // Formato: firestore-pdf://pdf_123456789/nombre.pdf
    const sinPrefijo = enlace.replace("firestore-pdf://", "");
    const [fileId, nombreCodificado] = sinPrefijo.split("/");
    const metaSnap = await getDoc(doc(db, "archivos_pdf", fileId));
    if (!metaSnap.exists()) throw new Error("El archivo no se encontró en Firebase.");

    const meta = metaSnap.data();
    const totalChunks = meta.totalChunks || 0;
    let dataUrlCompleta = "";

    for (let i = 0; i < totalChunks; i++) {
      const partSnap = await getDoc(doc(db, "archivos_pdf", `${fileId}_part_${i}`));
      if (partSnap.exists()) {
        dataUrlCompleta += partSnap.data().data;
      }
    }

    const res = await fetch(dataUrlCompleta);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = decodeURIComponent(nombreCodificado || meta.nombre || "libro.pdf");
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

    btnEl.innerHTML = `<i class="fas fa-check"></i> ¡Descargado!`;
    setTimeout(() => {
      btnEl.innerHTML = textoOriginal;
      btnEl.style.pointerEvents = "auto";
    }, 2500);
  } catch (err) {
    console.error("Error al descargar PDF:", err);
    alert("Hubo un problema al descargar el archivo. Intenta nuevamente.");
    btnEl.innerHTML = textoOriginal;
    btnEl.style.pointerEvents = "auto";
  }
}

// Escuchar clics en botones con archivos guardados en Firestore
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-firestore-pdf]");
  if (!btn) return;
  e.preventDefault();
  descargarPdfDesdeFirestore(btn.dataset.firestorePdf, btn);
});

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
function obtenerIdYouTube(urlOId) {
  if (!urlOId) return "";
  const match = urlOId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : urlOId.trim();
}

async function cargarVideos() {
  const videos = await fetchCollection("videos");
  const cont = $("#videos-container");
  if (!cont || !videos.length) return;

  cont.innerHTML = videos.map(v => {
    const videoId = obtenerIdYouTube(v.video_id);
    const urlVideo = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return `
      <div class="youtube-card">
        <a href="${urlVideo}" target="_blank" rel="noopener" class="yt-thumb" aria-label="Ver video en YouTube">
          <img src="${thumbUrl}" alt="${v.titulo || 'Video de YouTube'}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg'">
          <div class="play-icon">
            <i class="fab fa-youtube"></i>
          </div>
        </a>
        <div class="yt-body">
          <h4>${v.titulo || 'Video sin título'}</h4>
          <p>${v.descripcion || ''}</p>
          <a href="${urlVideo}" target="_blank" rel="noopener" class="btn btn-acento yt-btn">
            Ver video <i class="fas fa-play"></i>
          </a>
        </div>
      </div>
    `;
  }).join("");
}


/* ============================================================
   BLOG / BITÁCORA
============================================================ */
let articulosBlogCache = [];

async function cargarBlog() {
  articulosBlogCache = await fetchCollection("articulos_blog");
  const cont = $("#blog-container");
  if (!cont || !articulosBlogCache.length) return;

  cont.innerHTML = articulosBlogCache.map(post => `
    <article class="blog-card">
      ${post.imagen ? `
        <div class="blog-card-img">
          <img src="${post.imagen}" alt="${post.titulo || 'Artículo'}" loading="lazy">
        </div>
      ` : ""}
      <div class="blog-card-body">
        <div class="blog-meta">
          <span class="blog-tag">${post.categoria || "Reflexión"}</span>
          <span class="blog-date">${post.fecha || ""}</span>
        </div>
        <h3>${post.titulo || "(Sin título)"}</h3>
        <p>${post.resumen || ""}</p>
        <button class="btn-leer-post" data-post-id="${post.id}">
          Leer reflexión <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </article>
  `).join("");

  setupBlogModalListeners();
}

function setupBlogModalListeners() {
  const modal = $("#blog-modal");
  const btnClose = $("#btn-close-blog");
  if (!modal) return;

  // Abrir modal con los datos del artículo seleccionado
  document.querySelectorAll(".btn-leer-post").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.postId;
      const post = articulosBlogCache.find(p => p.id === id);
      if (!post) return;

      $("#modal-blog-cat").textContent = post.categoria || "Reflexión";
      $("#modal-blog-title").textContent = post.titulo || "";
      $("#modal-blog-date").textContent = post.fecha || "";
      $("#modal-blog-content").textContent = post.contenido || post.resumen || "";

      const imgWrap = $("#modal-blog-img-wrap");
      const imgEl = $("#modal-blog-img");
      if (post.imagen) {
        imgEl.src = post.imagen;
        imgWrap.style.display = "block";
      } else {
        imgWrap.style.display = "none";
      }

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  const cerrarModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  if (btnClose) btnClose.addEventListener("click", cerrarModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });
}

/* Cargar solo las 3 notas más recientes en la portada */
async function cargarBlogResumen() {
  const posts = await fetchCollection("articulos_blog");
  const cont = $("#blog-resumen-container");
  if (!cont || !posts.length) return;

  // Tomamos únicamente los últimos 3
  const ultimos = posts.slice(0, 3);

  cont.innerHTML = ultimos.map(post => `
    <article class="blog-card">
      ${post.imagen ? `
        <div class="blog-card-img">
          <img src="${post.imagen}" alt="${post.titulo || 'Artículo'}" loading="lazy">
        </div>
      ` : ""}
      <div class="blog-card-body">
        <div class="blog-meta">
          <span class="blog-tag">${post.categoria || "Reflexión"}</span>
          <span class="blog-date">${post.fecha || ""}</span>
        </div>
        <h3>${post.titulo || "(Sin título)"}</h3>
        <p>${post.resumen || ""}</p>
        <a href="post.html?id=${post.id}" class="btn-leer-post">
          Leer reflexión <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </article>
  `).join("");
}
/* ============================================================
   LIBROS
============================================================ */
async function cargarLibros() {
  const libros = await fetchCollection("libros");
  const cont = $("#libros-container");
  if (!cont || !libros.length) return;

  cont.innerHTML = libros.map(l => {
    const enlace = l.enlace || "#";
    const nombreDescarga = `${l.nombre_archivo || l.titulo || "libro"}.pdf`;
    const esFirestorePdf = enlace.startsWith("firestore-pdf://");

    const botonHtml = esFirestorePdf
      ? `<a href="#" data-firestore-pdf="${enlace}" class="btn btn-primario" style="padding:0.4rem 1.2rem; font-size:0.8rem;">
           <i class="fas fa-download"></i> Descargar PDF
         </a>`
      : `<a href="${enlace}" target="_blank" rel="noopener" download="${nombreDescarga}" class="btn btn-primario" style="padding:0.4rem 1.2rem; font-size:0.8rem;">
           <i class="fas fa-download"></i> Descargar PDF
         </a>`;

    const badgeHtml = l.badge
      ? `<span class="badge">⭐ ${l.badge}</span>` 
      : "";

    return `
      <div class="libro-card">
        <div class="libro-portada" style="width:100%; max-width:200px; margin:0 auto 1rem; aspect-ratio:3/4; overflow:hidden; border-radius:12px; box-shadow:0 8px 20px ;">
          <img src="${l.imagen || ""}" alt="${l.titulo || ""}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>
        <div class="libro-body">
          <h4>${l.titulo || ""}</h4>
          <p>${l.descripcion || ""}</p>
          ${badgeHtml}
          <div style="margin-top:0.8rem;">
            ${botonHtml}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ============================================================
  GALERÍA (Con límite de 20 fotos y botón Ver más)
============================================================ */
async function cargarGaleria() {
  const fotos = await fetchCollection("galeria");
  const cont = $("#galeria-container");
  if (!cont || !fotos.length) return;

  const limiteInicial = 20;
  let fotosVisibles = 0;

  const renderItemFoto = (f) => `
    <div class="galeria-item">
      <img src="${f.imagen || ''}" alt="${f.alt || 'Galería Prana para Vos'}" loading="lazy">
    </div>
  `;

  // Renderizar las primeras 20 fotos
  const iniciales = fotos.slice(0, limiteInicial);
  cont.innerHTML = iniciales.map(renderItemFoto).join("");
  fotosVisibles = iniciales.length;

  const botonPrevio = $("#btn-galeria-ver-mas");
  if (botonPrevio) botonPrevio.remove();

  if (fotos.length > limiteInicial) {
    const contenedorBoton = document.createElement("div");
    contenedorBoton.id = "wrap-galeria-btn";
    contenedorBoton.style.textAlign = "center";
    contenedorBoton.style.marginTop = "2.5rem";
    contenedorBoton.style.width = "100%";

    contenedorBoton.innerHTML = `
      <button id="btn-galeria-ver-mas" class="btn btn-primario" style="cursor:pointer; padding:0.7rem 2rem;">
        <i class="fas fa-plus"></i> Ver más fotos (${fotos.length - fotosVisibles} restantes)
      </button>
    `;

    cont.parentNode.insertBefore(contenedorBoton, cont.nextSibling);

    const btnVerMas = document.getElementById("btn-galeria-ver-mas");
    btnVerMas.addEventListener("click", () => {
      const restantes = fotos.slice(fotosVisibles);
      const htmlRestantes = restantes.map(renderItemFoto).join("");
      cont.insertAdjacentHTML("beforeend", htmlRestantes);

      if (typeof window.initDynamicListeners === "function") {
        window.initDynamicListeners();
      }

      contenedorBoton.remove();
    });
  }
}

/* ============================================================
   RECURSOS
============================================================ */
async function cargarRecursos() {
  const recursos = await fetchCollection("recursos");
  const cont = $("#recursos-container");
  if (!cont || !recursos.length) return;

  cont.innerHTML = recursos.map(r => {
    const enlace = r.enlace || "";
    const esFirestorePdf = enlace.startsWith("firestore-pdf://");
    let botonHtml = "";
    if (enlace) {
      botonHtml = esFirestorePdf
        ? `<a href="#" data-firestore-pdf="${enlace}" class="btn btn-acento" style="margin-top:0.8rem; padding:0.4rem 1.2rem; font-size:0.8rem;">
             Descargar <i class="fas fa-download"></i>
           </a>`
        : `<a href="${enlace}" target="_blank" rel="noopener" download class="btn btn-acento" style="margin-top:0.8rem; padding:0.4rem 1.2rem; font-size:0.8rem;">
             Descargar <i class="fas fa-download"></i>
           </a>`;
    }

    return `
      <div class="retiro-card">
        <i class="fas ${r.icono || 'fa-download'}"></i>
        <h4>${r.titulo || ''}</h4>
        <p>${r.descripcion || ''}</p>
        ${botonHtml}
      </div>
    `;
  }).join("");
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
    cargarBlog(),
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