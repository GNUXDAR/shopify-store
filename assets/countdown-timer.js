(function () {
  // Función para inicializar todos los countdown timers en la página
  function initCountdownTimers() {
    const countdownSections = document.querySelectorAll('.countdown-timer-section');

    countdownSections.forEach((section) => {
      const countdownElement = section.querySelector('.countdown-container');
      const endDateInput = section.getAttribute('data-end-date');
      const expiredText = section.getAttribute('data-expired-text');

      let endDate;

      if (endDateInput && isValidDate(endDateInput)) {
        // Si hay una fecha configurada en los ajustes usarla
        endDate = new Date(endDateInput).getTime();
      } else {
        // Si no hay fecha configurada  usar 30 días desde ahora
        const now = new Date();
        now.setDate(now.getDate() + 30);
        endDate = now.getTime();

        // debugging
        console.log('Usando fecha predeterminada (30 días desde ahora):', now.toLocaleString());
      }

      // Actualizar el countdown inmediatamente
      updateCountdown(countdownElement, endDate, expiredText);

      // Configurar el intervalo para actualizar cada segundo
      const interval = setInterval(function () {
        updateCountdown(countdownElement, endDate, expiredText, interval);
      }, 1000);
    });
  }

  // Funcion de validar fechas,
  function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  // Funcion de actualizar el countdown
  function updateCountdown(element, endDate, expiredText, interval) {
    const now = new Date().getTime();
    const distance = endDate - now;

    if (distance < 0) {
      if (interval) clearInterval(interval);
      element.innerHTML = `<div class="countdown-expired">${expiredText}</div>`;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    element.innerHTML = `
        <div class="countdown-item"><span>${days}</span>Días</div>
        <div class="countdown-item"><span>${hours}</span>Horas</div>
        <div class="countdown-item"><span>${minutes}</span>Minutos</div>
        <div class="countdown-item"><span>${seconds}</span>Segundos</div>
      `;
  }

  // Inicializar cuando el DOM este listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdownTimers);
  } else {
    initCountdownTimers();
  }
})();
