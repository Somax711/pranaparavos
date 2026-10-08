<<<<<<< HEAD
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
=======
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
>>>>>>> 763b9fe96dd33c59b34b0d3670d8afcc369c61af
