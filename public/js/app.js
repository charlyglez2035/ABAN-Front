// Menú móvil: muestra/oculta la navegación en pantallas pequeñas
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Aparición al hacer scroll: los bloques entran deslizándose hacia arriba.
  // Los hermanos dentro de una misma rejilla se escalonan ligeramente.
  const revealSelector = [
    '.section-title', '.section-subtitle', '.catalog-block-title',
    '.feature-card', '.course-card', '.catalog-card', '.service-card',
    '.about-grid > *', '.gallery-grid figure', '.cta-content',
    '.card-form', '.info-card', '.map-embed'
  ].join(',');
  const revealEls = document.querySelectorAll(revealSelector);
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealEls.forEach((el) => {
      const index = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 70}ms`);
      el.classList.add('reveal');
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  }

  // Fichas de curso (pop-ups): abrir con data-modal, cerrar con la X o clic fuera
  const closeModal = (modal) => {
    if (reduceMotion) return modal.close();
    modal.classList.add('is-closing');
    // animationend también burbujea desde el contenido; solo cuenta el del propio diálogo
    modal.addEventListener('animationend', function onEnd(e) {
      if (e.target !== modal) return;
      modal.removeEventListener('animationend', onEnd);
      modal.classList.remove('is-closing');
      modal.close();
    });
  };
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    const modal = document.getElementById(btn.dataset.modal);
    if (modal) btn.addEventListener('click', () => modal.showModal());
  });
  document.querySelectorAll('.course-modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-close]')) closeModal(modal);
    });
    // Esc: usar la misma animación de salida
    modal.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeModal(modal);
    });
  });

  // Contacto: si viene de una ficha (?curso=...), prellena asunto y mensaje
  const curso = new URLSearchParams(location.search).get('curso');
  const asunto = document.getElementById('asunto');
  const mensaje = document.getElementById('mensaje');
  if (curso && asunto && mensaje) {
    asunto.value = 'Información de cursos';
    mensaje.value = `Hola, me interesa el curso "${curso}". Quisiera recibir información sobre fechas, costos y modalidad.`;
  }

  // Envío de formularios (Contacto / Agendar Sesión) al backend
  document.querySelectorAll('.ajax-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const statusEl = form.querySelector('.form-status');
      const submitBtn = form.querySelector('button[type="submit"]');
      const endpoint = form.dataset.endpoint || '/enviar-contacto';
      const tipo = form.dataset.tipo || 'Contacto';

      const data = Object.fromEntries(new FormData(form).entries());
      data.tipo = tipo;

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json().catch(() => ({}));

        if (res.ok && result.ok) {
          statusEl.textContent = '¡Listo! Tu mensaje fue enviado. Te contactaremos pronto.';
          statusEl.className = 'form-status success';
          form.reset();
        } else {
          throw new Error(result.error || 'No se pudo enviar el mensaje.');
        }
      } catch (err) {
        statusEl.textContent = 'Hubo un problema al enviar tu mensaje. Intenta de nuevo o escríbenos a soporte.aban@gmail.com.';
        statusEl.className = 'form-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });
});
