
/* ============================================================
   SCRIPT PÚBLICO — Prana para Vos
============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ----- Smooth scroll ----- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ----- Cerrar menú mobile  ----- */
  const menuToggle = document.getElementById('menu-toggle');
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (menuToggle && menuToggle.checked) menuToggle.checked = false;
    });
  });

 window.initDynamicListeners = function () {

  /* ----- Botones de descarga ----- */
  document.querySelectorAll('.btn-descarga').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const originalHtml = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      this.style.backgroundColor = 'var(--color-secundario)';
      this.style.color = '#fff';
      this.style.borderColor = 'var(--color-secundario)';
      this.style.pointerEvents = 'none';
      setTimeout(() => {
        this.innerHTML = originalHtml;
        this.style.backgroundColor = '';
        this.style.color = '';
        this.style.borderColor = '';
        this.style.pointerEvents = 'auto';
        alert('¡Gracias por tu interés! Pronto te contactaremos.');
      }, 2000);
    });
  });

  /* ----- Observer con reveal variado y stagger ----- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  /* Asignar clase de reveal según el tipo de contenedor */
  const grupos = [
    { sel: '.card-terapia',      clase: 'reveal-up'    },
    { sel: '.alma-item',         clase: 'reveal-scale' },
    { sel: '.proyecto-card',     clase: 'reveal-left'  },
    { sel: '.youtube-card',      clase: 'reveal-up'    },
    { sel: '.libro-card',        clase: 'reveal-blur'  },
    { sel: '.galeria-item',      clase: 'reveal-scale' },
    { sel: '.retiro-card',       clase: 'reveal-up'    },
    { sel: '.testi-card',        clase: 'reveal-right' },
    { sel: '.sobre-imagen',      clase: 'reveal-left'  },
    { sel: '.sobre-texto',       clase: 'reveal-right' }
  ];

  grupos.forEach(({ sel, clase }) => {
    const nodos = document.querySelectorAll(sel);
    nodos.forEach((el, i) => {
      if (el.dataset.revealed) return;
      el.dataset.revealed = "1";
      el.classList.add(clase);
      // Stagger de hasta 6 elementos por grupo 
      el.style.transitionDelay = `${Math.min(i, 6) * 0.08}s`;
      observer.observe(el);
    });
  });

  /* ----- Header: sombra al hacer scroll ----- */
  const topbar = document.querySelector('.topbar');
  if (topbar && !topbar.dataset.scrollBound) {
    topbar.dataset.scrollBound = "1";
    const onScroll = () => {
      topbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
};

  /* Primera ejecución */
  window.initDynamicListeners();
});

/* ============================================================
   GENERADOR DE FONDO AMBIENTAL (Versión Visible y Definida)
============================================================ */
(function initPranaAmbientBackground() {
  const previo = document.querySelector('.prana-ambient-bg');
  if (previo) previo.remove();

  const bgContainer = document.createElement('div');
  bgContainer.className = 'prana-ambient-bg';
  bgContainer.setAttribute('aria-hidden', 'true');

  bgContainer.innerHTML = `
    <!-- Manchas de acuarela -->
    <div class="watercolor-Wash wc-lavanda"></div>
    <div class="watercolor-Wash wc-rosa"></div>
    <div class="watercolor-Wash wc-salvia"></div>
    <div class="watercolor-Wash wc-dorado"></div>

    <!-- 1. Sol Radiante Dorado (Derecha superior) -->
    <div class="sacred-symbol spin-slow" style="top: 14%; right: 3%; width: 230px; height: 230px;">
      <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="100" cy="100" r="28" fill="currentColor" fill-opacity="0.12" />
        <circle cx="100" cy="100" r="44" stroke-dasharray="4 4" />
        <circle cx="100" cy="100" r="64" stroke-opacity="0.6" />
        <g stroke-opacity="0.9">
          <line x1="100" y1="4" x2="100" y2="50" />
          <line x1="100" y1="150" x2="100" y2="196" />
          <line x1="4" y1="100" x2="50" y2="100" />
          <line x1="150" y1="100" x2="196" y2="100" />
          <line x1="30" y1="30" x2="64" y2="64" />
          <line x1="136" y1="136" x2="170" y2="170" />
          <line x1="170" y1="30" x2="136" y2="64" />
          <line x1="64" y1="136" x2="30" y2="170" />
        </g>
      </svg>
    </div>

    <!-- 2. Estrella Merkaba / Tameana (Izquierda media) -->
    <div class="sacred-symbol spin-reverse-slow" style="top: 46%; left: 2%; width: 220px; height: 220px;">
      <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="100" cy="100" r="82" stroke-dasharray="3 5" />
        <polygon points="100,20 170,142 30,142" fill="currentColor" fill-opacity="0.06" />
        <polygon points="100,180 170,58 30,58" fill="currentColor" fill-opacity="0.06" />
        <polygon points="100,45 148,128 52,128" stroke-opacity="0.7" />
        <polygon points="100,155 148,72 52,72" stroke-opacity="0.7" />
        <circle cx="100" cy="100" r="18" />
      </svg>
    </div>

    <!-- 3. Espiral Reiki Lunar (Derecha media-baja) -->
    <div class="sacred-symbol lavender-tint float-gentle" style="top: 62%; right: 4%; width: 175px; height: 175px;">
      <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M100,100 m0,0 a8,8 0 1,0 16,0 a16,16 0 1,0 -32,0 a26,26 0 1,0 52,0 a38,38 0 1,0 -76,0 a52,52 0 1,0 104,0 a68,68 0 1,0 -136,0" />
      </svg>
    </div>

    <!-- 4. Fases Lunares y Media Luna (Izquierda superior) -->
    <div class="sacred-symbol lavender-tint float-gentle" style="top: 18%; left: 3%; width: 160px; height: 220px;">
      <svg viewBox="0 0 140 200" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M95,15 A95,95 0 0,0 95,185" stroke-dasharray="3 6" stroke-opacity="0.7" />
        <circle cx="72" cy="35" r="6" fill="currentColor" fill-opacity="0.2" />
        <path d="M50,65 a9,9 0 1,0 0,18 a6,9 0 1,1 0,-18" fill="currentColor" />
        <circle cx="42" cy="100" r="11" fill="currentColor" fill-opacity="0.35" />
        <path d="M50,122 a9,9 0 1,1 0,18 a6,9 0 1,0 0,-18" fill="currentColor" />
        <circle cx="72" cy="165" r="6" fill="currentColor" fill-opacity="0.2" />
      </svg>
    </div>

    <!-- 5. Ramas Botánicas y Lavanda (Inferior izquierda) -->
    <div class="sacred-symbol sage-tint float-gentle" style="bottom: 5%; left: 4%; width: 190px; height: 190px;">
      <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M25,175 Q95,110 165,25" />
        <path d="M60,140 C40,112 60,88 85,105 C75,128 60,140 60,140 Z" fill="currentColor" fill-opacity="0.25" />
        <path d="M95,108 C125,95 142,112 118,130 C100,122 95,108 95,108 Z" fill="currentColor" fill-opacity="0.25" />
        <path d="M115,78 C98,52 115,35 136,52 C128,70 115,78 115,78 Z" fill="currentColor" fill-opacity="0.25" />
        <path d="M138,52 C162,42 175,58 154,72 C142,66 138,52 138,52 Z" fill="currentColor" fill-opacity="0.25" />
      </svg>
    </div>

    <!-- 6. Cristales de Cuarzo / Amatista (Inferior derecha) -->
    <div class="sacred-symbol lavender-tint float-gentle" style="bottom: 6%; right: 5%; width: 165px; height: 165px;">
      <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
        <polygon points="100,25 128,65 120,165 80,165 72,65" fill="currentColor" fill-opacity="0.15" />
        <polyline points="72,65 100,82 128,65" />
        <line x1="100" y1="25" x2="100" y2="165" stroke-opacity="0.6" />
        <polygon points="145,60 168,90 155,165 120,165 125,85" fill="currentColor" fill-opacity="0.22" />
        <polygon points="55,75 75,100 80,165 45,165 38,105" fill="currentColor" fill-opacity="0.12" />
      </svg>
    </div>
  `;

  // Crear 32 destellos dorados más notorios
  for (let i = 0; i < 32; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = 'prana-sparkle';
    const size = (Math.random() * 6 + 4).toFixed(1);
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${(Math.random() * 94 + 3).toFixed(1)}%`;
    sparkle.style.top = `${(Math.random() * 92 + 4).toFixed(1)}%`;
    sparkle.style.setProperty('--sparkle-dur', `${(Math.random() * 6 + 6).toFixed(1)}s`);
    sparkle.style.setProperty('--sparkle-delay', `${(Math.random() * 5).toFixed(1)}s`);
    bgContainer.appendChild(sparkle);
  }

  document.body.prepend(bgContainer);
})();