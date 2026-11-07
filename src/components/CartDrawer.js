// Componente CartDrawer: Carrito de compras lateral con selección de recreo y confirmación
import { store } from '../store.js';
import { formatCurrency, escapeHTML } from '../utils/formatters.js';
import { RECESS_OPTIONS } from '../data/defaultProducts.js';
import { ordersService } from '../services/ordersService.js';
import { showOrderSuccessModal } from './OrderSuccessModal.js';

export function renderCartDrawer(container) {
  const state = store.getState();
  const cart = state.cart;
  const isOpen = state.isCartOpen;
  const isOnline = state.isOnline;
  const cartTotal = store.getCartTotal();
  const cartCount = store.getCartCount();

  const user = state.user;
  const studentName = user ? user.full_name : '';
  const studentCourse = user ? `${user.course} - Div. ${user.division}` : '';

  container.innerHTML = `
    <!-- Fondo oscuro -->
    <div class="cart-backdrop ${isOpen ? 'open' : ''}" id="cart-backdrop"></div>

    <!-- Panel lateral -->
    <aside class="cart-drawer ${isOpen ? 'open' : ''}" id="cart-drawer-panel" aria-label="Carrito de compras">
      <div class="cart-header">
        <h2 class="cart-title">
          <span>🛒</span>
          <span>Tu Pedido (${cartCount})</span>
        </h2>
        <button class="cart-close-btn" id="btn-close-cart" aria-label="Cerrar carrito">&times;</button>
      </div>

      ${!isOnline ? `
        <div style="background-color: #7F1D1D; color: #FECACA; padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
          <span>⚠️</span>
          <span>Sin conexión a internet. Los pedidos requieren conexión para enviarse al kiosco.</span>
        </div>
      ` : ''}

      <div class="cart-body">
        ${cart.length === 0 ? `
          <div class="cart-empty-state">
            <div class="cart-empty-icon">🥪</div>
            <h3>Tu carrito está vacío</h3>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">
              Agregá sándwiches, pizzas, bebidas o dulces para retirar antes del recreo.
            </p>
            <button class="btn btn-primary" id="btn-empty-start-shopping" style="margin-top: 1.5rem;">
              Ver menú del kiosco
            </button>
          </div>
        ` : `
          <!-- Lista de productos elegidos -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${cart.map(item => `
              <div class="cart-item-card" data-id="${item.product.id}">
                <img 
                  src="${escapeHTML(item.product.image_url)}" 
                  alt="${escapeHTML(item.product.name)}" 
                  class="cart-item-thumb" 
                />
                
                <div class="cart-item-details">
                  <div class="cart-item-name">${escapeHTML(item.product.name)}</div>
                  <div class="cart-item-unit-price">${formatCurrency(item.product.price)} c/u</div>
                  <div class="cart-item-subtotal">${formatCurrency(item.product.price * item.quantity)}</div>
                </div>

                <div class="cart-stepper">
                  <button class="stepper-btn btn-cart-dec" data-id="${item.product.id}" aria-label="Disminuir cantidad">-</button>
                  <span class="stepper-value">${item.quantity}</span>
                  <button class="stepper-btn btn-cart-inc" data-id="${item.product.id}" aria-label="Aumentar cantidad">+</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Datos de Retiro y Recreo -->
          <div class="order-tracker-card" style="margin-top: 1rem;">
            <div class="recess-selector-group">
              <label for="cart-recess-select">⏰ ¿En qué recreo retiras?</label>
              <select id="cart-recess-select" style="background-color: var(--bg-secondary);">
                ${RECESS_OPTIONS.map(opt => `
                  <option value="${opt.label}" ${state.selectedRecess === opt.label ? 'selected' : ''}>
                    ${opt.label}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Datos del Alumno / Profesor -->
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
              <label style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                👤 Alumno / Retira:
              </label>
              ${user ? `
                <div style="font-weight: 800; font-size: 0.95rem; color: #FFFFFF;">${escapeHTML(studentName)}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(studentCourse)}</div>
              ` : `
                <div style="font-size: 0.85rem; color: var(--color-yellow); margin-bottom: 0.5rem;">
                  Iniciá sesión o ingresá tus datos para identificar el pedido:
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-cart-login">
                  Iniciar sesión / Identificarme
                </button>
              `}
            </div>

            <!-- Notas adicionales -->
            <div style="margin-top: 1rem;">
              <label for="cart-order-notes" style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                📝 Aclaraciones para el buffet (opcional):
              </label>
              <input 
                type="text" 
                id="cart-order-notes" 
                placeholder="Ej: Calentar bien, sin mayonesa..." 
                value="${escapeHTML(state.orderNotes)}"
              />
            </div>
          </div>
        `}
      </div>

      ${cart.length > 0 ? `
        <div class="cart-footer">
          <div class="cart-summary-row">
            <span>Total a pagar:</span>
            <span class="cart-total-value">${formatCurrency(cartTotal)}</span>
          </div>

          <button 
            class="btn btn-primary btn-block btn-lg" 
            id="btn-confirm-checkout"
            ${!isOnline ? 'disabled' : ''}
          >
            <span id="checkout-spinner" style="display: none;">⏳</span>
            <span id="checkout-btn-text">Confirmar Pedido (${formatCurrency(cartTotal)})</span>
          </button>
          
          <p style="text-align: center; font-size: 0.75rem; color: var(--text-muted);">
            🔒 Precios validados de forma segura en servidor. Se paga al retirar en el buffet.
          </p>
        </div>
      ` : ''}
    </aside>
  `;

  bindCartEvents(container);
}

function bindCartEvents(container) {
  const backdrop = container.querySelector('#cart-backdrop');
  const closeBtn = container.querySelector('#btn-close-cart');
  const emptyShopBtn = container.querySelector('#btn-empty-start-shopping');

  const close = () => store.openCart(false);
  if (backdrop) backdrop.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (emptyShopBtn) emptyShopBtn.addEventListener('click', close);

  // Steppers
  const incButtons = container.querySelectorAll('.btn-cart-inc');
  incButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = store.getState().cart.find(i => i.product.id === id);
      if (item) store.updateCartQuantity(id, item.quantity + 1);
    });
  });

  const decButtons = container.querySelectorAll('.btn-cart-dec');
  decButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = store.getState().cart.find(i => i.product.id === id);
      if (item) store.updateCartQuantity(id, item.quantity - 1);
    });
  });

  // Recreo select
  const recessSelect = container.querySelector('#cart-recess-select');
  if (recessSelect) {
    recessSelect.addEventListener('change', (e) => {
      store.setRecess(e.target.value);
    });
  }

  // Notas
  const notesInput = container.querySelector('#cart-order-notes');
  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      store.setOrderNotes(e.target.value);
    });
  }

  // Botón login en carrito
  const cartLoginBtn = container.querySelector('#btn-cart-login');
  if (cartLoginBtn) {
    cartLoginBtn.addEventListener('click', () => {
      store.openAuthModal(true);
    });
  }

  // Confirmar Pedido
  const confirmBtn = container.querySelector('#btn-confirm-checkout');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const state = store.getState();
      
      // Si no está autenticado, solicitar inicio de sesión
      if (!state.user) {
        store.openAuthModal(true);
        return;
      }

      // Validar conexión
      if (!navigator.onLine) {
        alert('Sin conexión a internet. Los pedidos requieren conexión para sincronizarse con el kiosco.');
        return;
      }

      const spinnerText = container.querySelector('#checkout-spinner');
      const btnText = container.querySelector('#checkout-btn-text');
      
      try {
        confirmBtn.disabled = true;
        if (spinnerText) spinnerText.style.display = 'inline';
        if (btnText) btnText.textContent = 'Enviando al kiosco...';

        const newOrder = await ordersService.createOrder({
          items: state.cart,
          recess: state.selectedRecess,
          notes: state.orderNotes
        });

        // Limpiar carrito
        store.clearCart();
        store.setOrderNotes('');
        store.openCart(false);

        // Mostrar confirmación visual con confetti
        showOrderSuccessModal(newOrder);

      } catch (err) {
        alert(err.message || 'Error al procesar el pedido');
      } finally {
        confirmBtn.disabled = false;
        if (spinnerText) spinnerText.style.display = 'none';
        if (btnText) btnText.textContent = 'Confirmar Pedido';
      }
    });
  }
}

