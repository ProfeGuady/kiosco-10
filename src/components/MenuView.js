// Vista Principal: Menú del Kiosco, Categorías, Buscador y Catálogo de Productos
import { store } from '../store.js';
import { renderHeroBanner } from './HeroBanner.js';
import { renderCategoryBar } from './CategoryBar.js';
import { createProductCardHTML, bindProductCardEvents } from './ProductCard.js';
import { renderInstallPrompt } from './InstallPrompt.js';
import { escapeHTML } from '../utils/formatters.js';

export function renderMenuView(container) {
  const state = store.getState();
  const products = state.products || [];
  const searchQuery = (state.searchQuery || '').trim().toLowerCase();
  const categoryFilter = state.categoryFilter;

  // Filtrado reactivo de productos
  let filtered = products;

  if (categoryFilter !== 'todos') {
    filtered = filtered.filter(p => p.category === categoryFilter);
  }

  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery) ||
      (p.description && p.description.toLowerCase().includes(searchQuery))
    );
  }

  container.innerHTML = `
    <div class="main-container">
      <!-- Banner de instalación PWA si está disponible -->
      <div id="install-prompt-container"></div>

      <!-- Hero Banner (Solo si no está buscando) -->
      ${!searchQuery && categoryFilter === 'todos' ? `<div id="hero-banner-container"></div>` : ''}

      <!-- Barra de Categorías -->
      <div id="category-bar-container"></div>

      <!-- Título de Sección y Contador -->
      <div class="section-header">
        <h2 class="section-title">
          <span>${getCategoryEmoji(categoryFilter)}</span>
          <span>${searchQuery ? `Resultados para "${escapeHTML(state.searchQuery)}"` : getCategoryTitle(categoryFilter)}</span>
          <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: normal;">(${filtered.length})</span>
        </h2>

        ${searchQuery ? `
          <button class="btn btn-ghost btn-sm" id="btn-clear-search-results">
            Limpiar búsqueda ✕
          </button>
        ` : ''}
      </div>

      <!-- Grilla de Productos -->
      ${filtered.length === 0 ? `
        <div class="order-tracker-card" style="text-align: center; padding: 3.5rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">🔍</div>
          <h3>No encontramos productos que coincidan</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin: 0.5rem 0 1.25rem;">
            Probá buscando "pebete", "pizza", "empanadas", "chocolatada" o seleccioná otra categoría.
          </p>
          <button class="btn btn-primary" id="btn-reset-filters">
            Ver todos los productos
          </button>
        </div>
      ` : `
        <div class="products-grid" id="products-grid-list">
          ${filtered.map(p => createProductCardHTML(p)).join('')}
        </div>
      `}
    </div>
  `;

  // Renderizar componentes anidados
  const installContainer = container.querySelector('#install-prompt-container');
  if (installContainer) renderInstallPrompt(installContainer);

  const heroContainer = container.querySelector('#hero-banner-container');
  if (heroContainer) renderHeroBanner(heroContainer);

  const catContainer = container.querySelector('#category-bar-container');
  if (catContainer) renderCategoryBar(catContainer);

  // Bindings
  bindProductCardEvents(container);

  const clearSearchBtn = container.querySelector('#btn-clear-search-results');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => store.setSearchQuery(''));
  }

  const resetFiltersBtn = container.querySelector('#btn-reset-filters');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      store.setSearchQuery('');
      store.setCategoryFilter('todos');
    });
  }
}

function getCategoryEmoji(cat) {
  switch (cat) {
    case 'sandwiches': return '🥪';
    case 'comidas': return '🍕';
    case 'dulces': return '🍫';
    case 'bebidas': return '🥤';
    default: return '🍔';
  }
}

function getCategoryTitle(cat) {
  switch (cat) {
    case 'sandwiches': return 'Sándwiches y Tostados';
    case 'comidas': return 'Comidas Calientes y Minutas';
    case 'dulces': return 'Dulces, Alfajores y Galletitas';
    case 'bebidas': return 'Bebidas Frías';
    default: return 'Menú Completo del Kiosco';
  }
}

