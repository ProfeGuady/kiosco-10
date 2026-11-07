// Kiosco10 — Punto de entrada principal de la aplicación
import './style.css';
import { store } from './store.js';
import { authService } from './services/authService.js';
import { productsService } from './services/productsService.js';
import { ordersService } from './services/ordersService.js';

import { renderNavbar } from './components/Navbar.js';
import { renderOfflineBanner } from './components/OfflineBanner.js';
import { renderCartDrawer } from './components/CartDrawer.js';
import { renderAuthModal } from './components/AuthModal.js';
import { renderConfigModal } from './components/ConfigModal.js';
import { renderMenuView } from './components/MenuView.js';
import { renderStudentHistory } from './components/StudentHistory.js';
import { renderAdminDashboard } from './components/AdminDashboard.js';

// Elementos raíces del DOM
const offlineBannerRoot = document.getElementById('offline-banner-root');
const navbarRoot = document.getElementById('navbar-root');
const mainContentRoot = document.getElementById('main-content-root');
const cartRoot = document.getElementById('cart-root');
const authModalRoot = document.getElementById('auth-modal-root');
const configModalRoot = document.getElementById('config-modal-root');

// Función principal de renderizado reactivo
function renderApp() {
  const state = store.getState();

  // 1. Elementos globales
  renderOfflineBanner(offlineBannerRoot);
  renderNavbar(navbarRoot);
  renderCartDrawer(cartRoot);
  renderAuthModal(authModalRoot);
  renderConfigModal(configModalRoot);

  // 2. Vista principal seleccionada
  switch (state.currentView) {
    case 'history':
      renderStudentHistory(mainContentRoot);
      break;
    case 'admin':
      if (state.role === 'admin') {
        renderAdminDashboard(mainContentRoot);
      } else {
        renderMenuView(mainContentRoot);
      }
      break;
    case 'menu':
    default:
      renderMenuView(mainContentRoot);
      break;
  }
}

// Inicialización de la aplicación
async function initApp() {
  console.log('🚀 Iniciando Kiosco10 — Tu recreo, sin filas...');

  // Registrar Service Worker para soporte PWA y modo offline
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('✓ Service Worker registrado:', reg.scope))
        .catch(err => console.warn('Aviso Service Worker:', err));
    });
  }

  // Escuchar cambios de estado reactivo
  store.addEventListener('statechange', () => {
    renderApp();
  });

  store.addEventListener('connectionchange', () => {
    renderApp();
  });

  // Manejo de Hash en la URL para navegación directa
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['menu', 'history', 'admin'].includes(hash)) {
      store.setView(hash);
    }
  });

  // Si hay un hash inicial
  const initialHash = window.location.hash.replace('#', '');
  if (['menu', 'history', 'admin'].includes(initialHash)) {
    store.setView(initialHash);
  }

  // Render inicial de la interfaz
  renderApp();

  // Inicializar servicios en segundo plano
  try {
    await authService.init();
    await productsService.fetchProducts();
    ordersService.initRealtime();
    await ordersService.fetchOrders();
  } catch (err) {
    console.warn('Inicialización de servicios:', err);
  }

  // Re-render con los datos cargados
  renderApp();
}

// Arrancar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

