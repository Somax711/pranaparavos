document.addEventListener('DOMContentLoaded', () => {
  const botonesDescarga = document.querySelectorAll('.btn-descarga');

  botonesDescarga.forEach(boton => {
    boton.addEventListener('click', function(e) {
      const contenidoOriginal = this.innerHTML;
      
      this.innerHTML = '<span class="icono">✅</span> ¡Descargando...!';
      this.style.backgroundColor = 'var(--color-secundario)';
      this.style.color = '#fff';
      this.style.borderColor = 'var(--color-secundario)';
      this.style.pointerEvents = 'none'; 

      setTimeout(() => {
        this.innerHTML = contenidoOriginal;
        this.style.backgroundColor = '';
        this.style.color = '';
        this.style.borderColor = '';
        this.style.pointerEvents = 'auto';
      }, 3000);
    });
  });
});