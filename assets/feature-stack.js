class FeatureStack extends HTMLElement {
  connectedCallback() {
    this._contentWraps = this.querySelectorAll('.fs-content-wrap');
    this._layerImages = this.querySelectorAll('.fs-layer-image');
    this._hoverTimeout = null;

    this._bindHover();
    this._bindAccordion();
  }

  disconnectedCallback() {
    clearTimeout(this._hoverTimeout);
  }

  /* ---- Hover / dimming ---- */

  _setActiveWrap(activeWrap) {
    this.classList.add('has-hover');

    this._contentWraps.forEach((w) => w.classList.remove('is-active'));
    this._layerImages.forEach((img) => img.classList.remove('is-active'));

    activeWrap.classList.add('is-active');

    const layerId = activeWrap.dataset.layer;
    if (layerId) {
      const match = this.querySelector(`.fs-layer-image[data-layer="${CSS.escape(layerId)}"]`);
      if (match) match.classList.add('is-active');
    }
  }

  _clearActiveWrap() {
    this.classList.remove('has-hover');
    this._contentWraps.forEach((w) => w.classList.remove('is-active'));
    this._layerImages.forEach((img) => img.classList.remove('is-active'));
  }

  _bindHover() {
    this._contentWraps.forEach((wrap) => {
      wrap.addEventListener('mouseenter', () => {
        clearTimeout(this._hoverTimeout);
        this._setActiveWrap(wrap);
      });

      wrap.addEventListener('mouseleave', () => {
        this._hoverTimeout = setTimeout(() => this._clearActiveWrap(), 150);
      });
    });
  }

  /* ---- Acordeón ---- */

  _bindAccordion() {
    this.querySelectorAll('.fs-accordion-trigger').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();

        const item = trigger.closest('.fs-accordion-item');
        const content = item.querySelector('.fs-accordion-content');
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        /* Cerrar otros acordeones del mismo grupo */
        const parentWrap = trigger.closest('.fs-content-wrap');
        if (parentWrap) {
          parentWrap.querySelectorAll('.fs-accordion-trigger[aria-expanded="true"]').forEach((t) => {
            if (t === trigger) return;
            t.setAttribute('aria-expanded', 'false');
            const c = t.closest('.fs-accordion-item').querySelector('.fs-accordion-content');
            if (c) c.classList.remove('is-open');
          });
        }

        trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        if (content) content.classList.toggle('is-open', !isOpen);
      });
    });
  }
}

customElements.define('feature-stack', FeatureStack);
