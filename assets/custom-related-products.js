(function () {
  // Función principal para inicializar productos relacionados
  function initRelatedProducts() {
    // Inicializar el slider si existe
    initRelatedProductsSlider();

    // Cargar productos relacionados basados en categorías y etiquetas (not found)
    loadRelatedProducts();
    // console.log('Cargar productos relacionados ' + loadRelatedProducts());
  }

  // Función para cargar productos relacionados
  function loadRelatedProducts() {
    const relatedSections = document.querySelectorAll('.related-products-custom');

    relatedSections.forEach((section) => {
      const slider = section.querySelector('[data-related-products-slider]');
      if (!slider) return;

      // Obtener el producto actual
      const productHandle = window.location.pathname.split('/').pop();
      const currentProduct = getCurrentProductData();

      if (!currentProduct) {
        console.log('No se pudo obtener información del producto actual');
        return;
      }

      // Obtener productos relacionados
      getRelatedProducts(currentProduct)
        .then((relatedProducts) => {
          if (relatedProducts.length > 0) {
            renderRelatedProducts(slider, relatedProducts);
            initRelatedProductsSlider(); // Reiniciar slider después de cargar productos
          } else {
            showNoRelatedProductsMessage(slider);
          }
        })
        .catch((error) => {
          console.error('Error al cargar productos relacionados:', error);
          showNoRelatedProductsMessage(slider);
        });
    });
  }

  // Función para obtener datos del producto actual
  function getCurrentProductData() {
    // Intentar obtener datos de las metaetiquetas o variables globales de Shopify
    const productData = window.productData || getProductDataFromMeta() || getProductDataFromJSON();

    if (!productData && window.Shopify && window.Shopify.product) {
      return window.Shopify.product;
    }

    return productData;
  }

  // Función para extraer datos de producto de metaetiquetas
  function getProductDataFromMeta() {
    const metaTags = document.querySelectorAll('meta[property^="product:"]');
    if (metaTags.length === 0) return null;

    const productData = {
      id: getMetaContent('product:id'),
      handle: getMetaContent('product:handle') || window.location.pathname.split('/').pop(),
      title: getMetaContent('product:title') || document.title,
      type: getMetaContent('product:type'),
      tags: getMetaContent('product:tags') ? getMetaContent('product:tags').split(',') : [],
      vendor: getMetaContent('product:vendor'),
    };

    return productData;
  }

  // Helper para obtener contenido de metaetiquetas
  function getMetaContent(property) {
    const meta = document.querySelector(`meta[property="${property}"]`);
    return meta ? meta.getAttribute('content') : null;
  }

  // Función para extraer datos de producto de JSON-LD
  function getProductDataFromJSON() {
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLd) return null;

    try {
      const data = JSON.parse(jsonLd.textContent);
      if (data['@type'] === 'Product') {
        return {
          id: data['@id'] || data.url,
          handle: extractHandleFromUrl(data.url),
          title: data.name,
          type: data.category,
          tags: data.keywords ? data.keywords.split(',') : [],
          vendor: data.brand ? data.brand.name : null,
        };
      }
    } catch (e) {
      console.error('Error parsing JSON-LD:', e);
    }

    return null;
  }

  // Helper para extraer handle de URL
  function extractHandleFromUrl(url) {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  // Función para obtener productos relacionados
  async function getRelatedProducts(currentProduct) {
    try {
      // Intentar usar la API de recomendaciones de Shopify
      if (window.Shopify && window.Shopify.routes) {
        const response = await fetch(
          `${window.Shopify.routes.root}recommendations/products.json?product_id=${currentProduct.id}&limit=8`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            return data.products;
          }
        }
      }

      // Fallback: buscar productos con mismas etiquetas o categoría
      return await findRelatedProductsFallback(currentProduct);
    } catch (error) {
      console.error('Error fetching related products:', error);
      return await findRelatedProductsFallback(currentProduct);
    }
  }

  // Función alternativa para encontrar productos relacionados
  async function findRelatedProductsFallback(currentProduct) {
    try {
      // Obtener todos los productos (puede necesitar ajustes según tu tema)
      const response = await fetch(`${window.Shopify.routes.root}products.json?limit=50`);
      if (!response.ok) return [];

      const data = await response.json();
      if (!data.products) return [];

      // Filtrar productos relacionados
      return data.products
        .filter((product) => {
          // Excluir el producto actual
          if (product.handle === currentProduct.handle || product.id === currentProduct.id) {
            return false;
          }

          // Prioridad 1: Mismas etiquetas
          const commonTags =
            currentProduct.tags && product.tags ? currentProduct.tags.filter((tag) => product.tags.includes(tag)) : [];

          // Prioridad 2: Mismo tipo/categoría
          const sameType =
            currentProduct.type && product.type && currentProduct.type.toLowerCase() === product.type.toLowerCase();

          // Prioridad 3: Mismo vendor
          const sameVendor =
            currentProduct.vendor &&
            product.vendor &&
            currentProduct.vendor.toLowerCase() === product.vendor.toLowerCase();

          // Puntuación para ordenar por relevancia
          let score = 0;
          if (commonTags.length > 0) score += 10 + commonTags.length;
          if (sameType) score += 5;
          if (sameVendor) score += 3;

          product._relevanceScore = score;
          return score > 0;
        })
        .sort((a, b) => b._relevanceScore - a._relevanceScore)
        .slice(0, 8); // Limitar a 8 productos
    } catch (error) {
      console.error('Error in fallback related products:', error);
      return [];
    }
  }

  // Función para renderizar productos relacionados
  function renderRelatedProducts(slider, products) {
    const grid = slider.querySelector('ul');
    if (!grid) return;

    // Limpiar grid existente
    grid.innerHTML = '';

    // Crear elementos de producto
    products.forEach((product) => {
      const li = document.createElement('li');
      li.className = 'grid__item';
      li.innerHTML = createProductCardHTML(product);
      grid.appendChild(li);
    });
  }

  // Función para crear HTML de tarjeta de producto
  function createProductCardHTML(product) {
    return `
        <div class="card-wrapper product-card-wrapper underline-links-hover">
          <div class="card card--card card--media color-background-1" style="--ratio-percent: 100%;">
            <div class="card__media">
              <div class="media media--transparent media--hover-effect">
                <img src="${product.featured_image || product.images[0]}" 
                     alt="${product.title}" 
                     loading="lazy">
              </div>
            </div>
            <div class="card__content">
              <div class="card__information">
                <h3 class="card__heading h5">
                  <a href="${window.Shopify.routes.root}products/${product.handle}">
                    ${product.title}
                  </a>
                </h3>
                <div class="card__price">
                  ${renderProductPrice(product)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
  }

  // Función para renderizar precio del producto
  function renderProductPrice(product) {
    if (!product.variants) return '';

    const price = product.variants[0].price;
    const comparePrice = product.variants[0].compare_at_price;

    if (comparePrice && comparePrice > price) {
      return `
          <div class="price price--on-sale">
            <span class="price-item price-item--sale">${formatMoney(price)}</span>
            <span class="price-item price-item--regular" style="text-decoration: line-through;">${formatMoney(
              comparePrice
            )}</span>
          </div>
        `;
    }

    return `<div class="price">${formatMoney(price)}</div>`;
  }

  // Helper para formatear dinero
  function formatMoney(amount) {
    if (typeof amount !== 'string') amount = amount.toString();
    return window.Shopify?.formatMoney?.(amount) || `$${amount}`;
  }

  // Función para mostrar mensaje cuando no hay productos relacionados
  function showNoRelatedProductsMessage(slider) {
    const grid = slider.querySelector('ul');
    if (grid) {
      grid.innerHTML = `
          <li class="grid__item full-width">
            <div class="related-products-empty">
              <p>No hay productos relacionados disponibles en este momento.</p>
            </div>
          </li>
        `;
    }

    // Ocultar navegación si no hay productos
    const navigation = slider.closest('.related-products-custom').querySelector('.related-products__navigation');
    if (navigation) {
      navigation.style.display = 'none';
    }
  }

  // Función para inicializar el slider de productos relacionados
  function initRelatedProductsSlider() {
    const sliders = document.querySelectorAll('[data-related-products-slider]');

    sliders.forEach((slider) => {
      const section = slider.closest('.related-products-custom');
      if (!section) return;

      const sectionId = section.id || Object.keys(window.relatedProductsConfig || {})[0];
      const config = window.relatedProductsConfig ? window.relatedProductsConfig[sectionId] : null;

      const columnsDesktop = config ? config.columnsDesktop : 4;
      const columnsMobile = config ? config.columnsMobile : 2;

      const prevButton = section.querySelector('.related-products__nav-button--prev');
      const nextButton = section.querySelector('.related-products__nav-button--next');

      if (!slider || !prevButton || !nextButton) return;

      let currentPosition = 0;
      const products = slider.querySelectorAll('.grid__item');
      const totalProducts = products.length;

      if (totalProducts === 0) {
        // Ocultar navegación si no hay productos
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        return;
      }

      // Ajustar productos por vista en dispositivos móviles
      function getProductsPerView() {
        if (window.innerWidth < 750) {
          return columnsMobile;
        }
        return columnsDesktop;
      }

      function updateSlider() {
        if (products.length === 0) return;

        const itemWidth = products[0].offsetWidth + parseInt(getComputedStyle(products[0]).marginRight);
        const visibleProducts = getProductsPerView();
        const maxPosition = Math.max(0, (totalProducts - visibleProducts) * itemWidth);

        currentPosition = Math.min(maxPosition, Math.max(0, currentPosition));
        slider.querySelector('ul').style.transform = `translateX(-${currentPosition}px)`;

        // Actualizar estado de los botones
        prevButton.disabled = currentPosition === 0;
        nextButton.disabled = currentPosition >= maxPosition;

        // Estilos para botones deshabilitados
        prevButton.style.opacity = prevButton.disabled ? '0.5' : '1';
        prevButton.style.cursor = prevButton.disabled ? 'not-allowed' : 'pointer';
        nextButton.style.opacity = nextButton.disabled ? '0.5' : '1';
        nextButton.style.cursor = nextButton.disabled ? 'not-allowed' : 'pointer';
      }

      prevButton.addEventListener('click', function () {
        if (this.disabled) return;

        const itemWidth = products[0].offsetWidth + parseInt(getComputedStyle(products[0]).marginRight);
        const visibleProducts = getProductsPerView();
        currentPosition = Math.max(0, currentPosition - visibleProducts * itemWidth);
        updateSlider();
      });

      nextButton.addEventListener('click', function () {
        if (this.disabled) return;

        const itemWidth = products[0].offsetWidth + parseInt(getComputedStyle(products[0]).marginRight);
        const visibleProducts = getProductsPerView();
        const maxPosition = Math.max(0, (totalProducts - visibleProducts) * itemWidth);
        currentPosition = Math.min(maxPosition, currentPosition + visibleProducts * itemWidth);
        updateSlider();
      });

      // Actualizar en redimensionamiento de ventana
      let resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateSlider, 250);
      });

      // Inicializar slider
      updateSlider();
    });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelatedProducts);
  } else {
    initRelatedProducts();
  }
})();
