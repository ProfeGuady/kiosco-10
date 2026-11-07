// Componente CategoryBar: Chips de filtrado interactivo
import { CATEGORIES } from '../data/defaultProducts.js';
import { store } from '../store.js';

export function renderCategoryBar(container) {
  const currentCategory = store.getState().categoryFilter;

  container.innerHTML = `
    <div class="categories-bar-wrapper">
      <div class="categories-bar" role="tablist" aria-label="Categorías de productos">
        ${CATEGORIES.map(cat => `
          <button 
            class="category-chip ${currentCategory === cat.id ? 'active' : ''}" 
            data-category="${cat.id}"
            role="tab"
            aria-selected="${currentCategory === cat.id}"
          >
            <span class="category-icon">${cat.icon}</span>
            <span>${cat.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const chips = container.querySelectorAll('.category-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const catId = chip.getAttribute('data-category');
      store.setCategoryFilter(catId);
    });
  });
}

