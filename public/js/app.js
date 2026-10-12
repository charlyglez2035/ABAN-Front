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
