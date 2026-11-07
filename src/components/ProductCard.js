// Componente ProductCard: Renderizado y lógica de cada producto
import { formatCurrency, escapeHTML } from '../utils/formatters.js';
import { store } from '../store.js';

export function createProductCardHTML(product) {
  const isAvailable = product.available !== false;
  const isFeatured = Boolean(product.featured);

  return `
    <article class="product-card ${!isAvailable ? 'unavailable' : ''} animate-fade-in" data-id="${product.id}">
      <div class="product-img-wrapper">
        <img 
          src="${escapeHTML(product.image_url)}" 
          alt="${escapeHTML(product.name)}" 
          class="product-img"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';"
        />

        <div class="product-card-badges">
          ${isFeatured ? `<span class="badge badge-featured">★ Destacado</span>` : ''}
          ${!isAvailable ? `<span class="badge badge-danger">Agotado</span>` : ''}
        </div>
      </div>

      <div class="product-card-body">
        <h3 class="product-card-title">${escapeHTML(product.name)}</h3>
        <p class="product-card-desc">${escapeHTML(product.description || '')}</p>

        <div class="product-card-footer">
          <span class="product-price">${formatCurrency(product.price)}</span>

          <button 
            class="btn btn-add-cart btn-add-product" 
            data-id="${product.id}"
            ${!isAvailable ? 'disabled' : ''}
            aria-label="Agregar ${escapeHTML(product.name)} al carrito"
          >
            <span>+</span>
            <span>${isAvailable ? 'Agregar' : 'Agotado'}</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

export function bindProductCardEvents(container) {
  const addButtons = container.querySelectorAll('.btn-add-product');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.getAttribute('data-id');
      const products = store.getState().products;
      const product = products.find(p => p.id === productId);

      if (product && product.available !== false) {
        store.addToCart(product, 1);

        // Feedback táctil/visual en el botón
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>✓</span><span>Agregado</span>';
        btn.style.backgroundColor = '#22C55E';
        btn.style.color = '#FFFFFF';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.backgroundColor = '';
          btn.style.color = '';
        }, 800);
      }
    });
  });
}

