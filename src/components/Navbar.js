// Componente Navbar: Cabecera principal y navegación móvil
import { store } from '../store.js';
import { formatCurrency, escapeHTML } from '../utils/formatters.js';
import { authService } from '../services/authService.js';
import { DEMO_USERS } from '../services/demoDataService.js';

export function renderNavbar(container) {
  const state = store.getState();
  const cartCount = store.getCartCount();
  const isKiosquero = state.role === 'admin';

  container.innerHTML = `
    <nav class="navbar" role="navigation" aria-label="Navegación principal">
      <div class="navbar-content">
        <!-- Logo -->
        <a href="#menu" class="brand-logo" id="nav-brand-btn">
          <div class="brand-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD429" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
              <line x1="6" y1="17" x2="18" y2="17"/>
            </svg>
          </div>
          <span>KIOSCO<span class="brand-highlight">10</span></span>
        </a>

        <!-- Buscador en tiempo real -->
        <div class="nav-search-bar">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            id="nav-search-input" 
            placeholder="Buscar pebetes, pizzas, empanadas..." 
            value="${escapeHTML(state.searchQuery)}"
            autocomplete="off"
            aria-label="Buscar productos"
          />
          ${state.searchQuery ? `<button class="clear-search-btn" id="btn-clear-search">&times;</button>` : ''}
        </div>

        <!-- Acciones de Cabecera -->
        <div class="nav-actions">
          <!-- Menú / Historial enlaces escritorio -->
          <button class="nav-link desktop-only-link ${state.currentView === 'menu' ? 'active' : ''}" id="nav-menu-btn">
            🍔 Menú
          </button>
          
          <button class="nav-link desktop-only-link ${state.currentView === 'history' ? 'active' : ''}" id="nav-history-btn">
            📋 Mis Pedidos
          </button>

          ${isKiosquero ? `
            <button class="nav-link desktop-only-link ${state.currentView === 'admin' ? 'active' : ''}" id="nav-admin-btn" style="color: var(--color-yellow); font-weight: 800;">
              ⚡ Panel Kiosquero
            </button>
          ` : ''}

          <!-- Selector de Modo Demostración / Conexión -->
          <div class="demo-role-pill" id="btn-toggle-demo-roles" title="Cambiar rol para probar la app">
            <span style="font-size: 0.9rem;">${isKiosquero ? '👨‍🍳' : (state.role === 'profesor' ? '👨‍🏫' : '🎒')}</span>
            <span class="demo-label-full">${state.user ? escapeHTML(state.user.full_name) : 'Invitado'}</span>
            <span style="font-size: 0.65rem;">▼</span>
          </div>

          <!-- Botón de Carrito -->
          <button class="cart-button-trigger" id="btn-open-cart" aria-label="Abrir carrito de compras">
            <span>🛒</span>
            <span class="desktop-only-link">Carrito</span>
            ${cartCount > 0 ? `<span class="cart-counter-badge">${cartCount}</span>` : ''}
          </button>

          <!-- Botón Conexión Supabase -->
          <button class="btn btn-ghost btn-sm" id="btn-open-config" title="Configurar conexión Supabase" style="padding: 0.4rem 0.5rem; font-size: 1.1rem;">
            ${state.isConfigured ? '🟢' : '⚙️'}
          </button>
        </div>
      </div>
    </nav>

    <!-- Barra de Navegación Inferior para Móviles -->
    <nav class="bottom-nav" aria-label="Navegación móvil">
      <div class="bottom-nav-container">
        <button class="bottom-nav-item ${state.currentView === 'menu' ? 'active' : ''}" id="mobile-nav-menu">
          <span class="bottom-nav-icon">🍔</span>
          <span>Menú</span>
        </button>

        <button class="bottom-nav-item ${state.currentView === 'history' ? 'active' : ''}" id="mobile-nav-history">
          <span class="bottom-nav-icon">📋</span>
          <span>Pedidos</span>
        </button>

        <button class="bottom-nav-item" id="mobile-nav-cart" style="position: relative;">
          <span class="bottom-nav-icon">🛒</span>
          <span>Carrito</span>
          ${cartCount > 0 ? `<span class="bottom-cart-badge">${cartCount}</span>` : ''}
        </button>

        ${isKiosquero ? `
          <button class="bottom-nav-item ${state.currentView === 'admin' ? 'active' : ''}" id="mobile-nav-admin" style="color: var(--color-yellow);">
            <span class="bottom-nav-icon">⚡</span>
            <span>Kiosco</span>
          </button>
        ` : `
          <button class="bottom-nav-item" id="mobile-nav-profile">
            <span class="bottom-nav-icon">👤</span>
            <span>Cuenta</span>
          </button>
        `}
      </div>
    </nav>
  `;

  // Bindings de Eventos
  bindNavbarEvents(container);
}

function bindNavbarEvents(container) {
  // Buscador
  const searchInput = container.querySelector('#nav-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      store.setSearchQuery(e.target.value);
    });
  }

  const clearBtn = container.querySelector('#btn-clear-search');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      store.setSearchQuery('');
      if (searchInput) searchInput.focus();
    });
  }

  // Navegación
  const brandBtn = container.querySelector('#nav-brand-btn');
  if (brandBtn) brandBtn.addEventListener('click', (e) => { e.preventDefault(); store.setView('menu'); });

  const menuBtn = container.querySelector('#nav-menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', () => store.setView('menu'));

  const historyBtn = container.querySelector('#nav-history-btn');
  if (historyBtn) historyBtn.addEventListener('click', () => store.setView('history'));

  const adminBtn = container.querySelector('#nav-admin-btn');
  if (adminBtn) adminBtn.addEventListener('click', () => store.setView('admin'));

  const openCartBtn = container.querySelector('#btn-open-cart');
  if (openCartBtn) openCartBtn.addEventListener('click', () => store.openCart(true));

  const configBtn = container.querySelector('#btn-open-config');
  if (configBtn) configBtn.addEventListener('click', () => store.openConfigModal(true));

  // Menú Móvil
  const mobileMenu = container.querySelector('#mobile-nav-menu');
  if (mobileMenu) mobileMenu.addEventListener('click', () => store.setView('menu'));

  const mobileHistory = container.querySelector('#mobile-nav-history');
  if (mobileHistory) mobileHistory.addEventListener('click', () => store.setView('history'));

  const mobileCart = container.querySelector('#mobile-nav-cart');
  if (mobileCart) mobileCart.addEventListener('click', () => store.openCart(true));

  const mobileAdmin = container.querySelector('#mobile-nav-admin');
  if (mobileAdmin) mobileAdmin.addEventListener('click', () => store.setView('admin'));

  const mobileProfile = container.querySelector('#mobile-nav-profile');
  if (mobileProfile) mobileProfile.addEventListener('click', () => store.openAuthModal(true));

  // Menú desplegable rápido de roles demo
  const rolePill = container.querySelector('#btn-toggle-demo-roles');
  if (rolePill) {
    rolePill.addEventListener('click', () => {
      showDemoRoleQuickModal();
    });
  }
}

function showDemoRoleQuickModal() {
  const currentRole = store.getState().role;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'demo-roles-modal';
  modal.innerHTML = `
    <div class="modal-card" style="max-width: 400px;">
      <div class="modal-header">
        <h3 class="modal-title">Cambiar Rol (Modo Demo)</h3>
        <button class="toast-close" id="close-role-modal">&times;</button>
      </div>
      <div class="modal-body" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          Ideal para la muestra escolar: permite simular tanto la experiencia del alumno que pide como la del kiosquero que prepara.
        </p>
        
        <button class="btn btn-secondary ${currentRole === 'alumno' ? 'btn-primary' : ''}" id="switch-to-student" style="justify-content: flex-start;">
          <span>🎒</span>
          <div style="text-align: left;">
            <div><strong>Santiago Benítez (Alumno)</strong></div>
            <div style="font-size: 0.75rem; opacity: 0.8;">4° Año A — Puede pedir y ver su historial</div>
          </div>
        </button>

        <button class="btn btn-secondary ${currentRole === 'profesor' ? 'btn-primary' : ''}" id="switch-to-teacher" style="justify-content: flex-start;">
          <span>👨‍🏫</span>
          <div style="text-align: left;">
            <div><strong>Prof. Marcelo Morales (Docente)</strong></div>
            <div style="font-size: 0.75rem; opacity: 0.8;">Sala de Profesores — Pedidos prioritarios</div>
          </div>
        </button>

        <button class="btn btn-secondary ${currentRole === 'admin' ? 'btn-primary' : ''}" id="switch-to-admin" style="justify-content: flex-start; border-color: var(--color-yellow);">
          <span>⚡</span>
          <div style="text-align: left;">
            <div><strong>Don Roberto (Kiosquero Admin)</strong></div>
            <div style="font-size: 0.75rem; opacity: 0.8;">Panel en tiempo real + edición de precios y stock</div>
          </div>
        </button>

        <div style="margin-top: 0.5rem; pt: 0.5rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between;">
          <button class="btn btn-ghost btn-sm" id="btn-custom-auth">Ingresar con otra cuenta</button>
          <button class="btn btn-secondary btn-sm" id="btn-logout-current">Cerrar sesión</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#close-role-modal').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  modal.querySelector('#switch-to-student').addEventListener('click', () => {
    authService.switchDemoRole('alumno');
    close();
  });

  modal.querySelector('#switch-to-teacher').addEventListener('click', () => {
    authService.switchDemoRole('profesor');
    close();
  });

  modal.querySelector('#switch-to-admin').addEventListener('click', () => {
    authService.switchDemoRole('admin');
    store.setView('admin');
    close();
  });

  modal.querySelector('#btn-custom-auth').addEventListener('click', () => {
    close();
    store.openAuthModal(true);
  });

  modal.querySelector('#btn-logout-current').addEventListener('click', async () => {
    await authService.logout();
    close();
  });
}

