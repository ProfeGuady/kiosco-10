// Componente AdminDashboard: Panel de control en tiempo real para el Kiosquero escolar
import { store } from '../store.js';
import { ordersService } from '../services/ordersService.js';
import { productsService } from '../services/productsService.js';
import { audioService } from '../services/audioService.js';
import { formatCurrency, formatDateTime, formatRelativeTime, escapeHTML } from '../utils/formatters.js';
import { ORDER_STATUSES, RECESS_OPTIONS } from '../data/defaultProducts.js';

let activeStatusFilter = 'todos';
let activeRecessFilter = 'todos';

export function renderAdminDashboard(container) {
  const state = store.getState();
  const orders = state.orders || [];
  const products = state.products || [];

  // Cálculos de Métricas
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pendiente').length;
  const prepCount = orders.filter(o => o.status === 'en_preparacion').length;
  const readyCount = orders.filter(o => o.status === 'listo').length;
  const deliveredCount = orders.filter(o => o.status === 'entregado').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  // Filtrado de pedidos
  let filteredOrders = orders;
  if (activeStatusFilter !== 'todos') {
    filteredOrders = filteredOrders.filter(o => o.status === activeStatusFilter);
  }
  if (activeRecessFilter !== 'todos') {
    filteredOrders = filteredOrders.filter(o => o.recess === activeRecessFilter);
  }

  container.innerHTML = `
    <div class="main-container admin-dashboard animate-fade-in">
      <!-- Encabezado del Panel -->
      <div class="section-header" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <h2 class="section-title">
              <span>⚡</span>
              <span>Panel del Kiosquero</span>
            </h2>
            <span class="badge badge-yellow pulse-badge">● EN VIVO</span>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">
            Recepción de pedidos en tiempo real para el despacho sin filas.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <button class="btn btn-secondary btn-sm" id="btn-toggle-sound" title="Activar/desactivar sonido de campana">
            <span>${audioService.soundEnabled ? '🔔 Sonido ON' : '🔕 Sonido OFF'}</span>
          </button>

          <button class="btn btn-primary btn-sm" id="btn-open-price-editor">
            <span>🏷️</span>
            <span>Editar Precios y Stock</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de Métricas -->
      <div class="admin-metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">📦</div>
          <div class="metric-info">
            <span class="metric-label">Total Pedidos</span>
            <span class="metric-value">${totalOrdersCount}</span>
          </div>
        </div>

        <div class="metric-card" style="border-left-color: var(--color-yellow);">
          <div class="metric-icon" style="background-color: var(--color-yellow-light); color: var(--color-yellow);">⏳</div>
          <div class="metric-info">
            <span class="metric-label">Por Preparar</span>
            <span class="metric-value">${pendingCount + prepCount}</span>
          </div>
        </div>

        <div class="metric-card" style="border-left-color: #22C55E;">
          <div class="metric-icon" style="background-color: rgba(34, 197, 94, 0.15); color: #22C55E;">🔔</div>
          <div class="metric-info">
            <span class="metric-label">Listos p/ Retiro</span>
            <span class="metric-value">${readyCount}</span>
          </div>
        </div>

        <div class="metric-card" style="border-left-color: #38BDF8;">
          <div class="metric-icon" style="background-color: rgba(56, 189, 248, 0.15); color: #38BDF8;">💵</div>
          <div class="metric-info">
            <span class="metric-label">Facturación Total</span>
            <span class="metric-value" style="font-size: 1.35rem;">${formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros de Estado y Recreo -->
      <div class="admin-toolbar">
        <div class="admin-filter-tabs">
          <button class="admin-tab-btn ${activeStatusFilter === 'todos' ? 'active' : ''}" data-filter="todos">
            Todos (${totalOrdersCount})
          </button>
          <button class="admin-tab-btn ${activeStatusFilter === 'pendiente' ? 'active' : ''}" data-filter="pendiente" style="color: var(--color-yellow);">
            ⏳ Pendientes (${pendingCount})
          </button>
          <button class="admin-tab-btn ${activeStatusFilter === 'en_preparacion' ? 'active' : ''}" data-filter="en_preparacion" style="color: #FB923C;">
            👨‍🍳 Preparando (${prepCount})
          </button>
          <button class="admin-tab-btn ${activeStatusFilter === 'listo' ? 'active' : ''}" data-filter="listo" style="color: #22C55E;">
            🔔 Listos (${readyCount})
          </button>
          <button class="admin-tab-btn ${activeStatusFilter === 'entregado' ? 'active' : ''}" data-filter="entregado" style="color: #94A3B8;">
            ✅ Entregados (${deliveredCount})
          </button>
        </div>

        <!-- Filtro por Recreo -->
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">Recreo:</span>
          <select id="admin-recess-filter-select" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.85rem;">
            <option value="todos">Todos los recreos</option>
            ${RECESS_OPTIONS.map(opt => `
              <option value="${opt.label}" ${activeRecessFilter === opt.label ? 'selected' : ''}>
                ${opt.short}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Lista de Pedidos en Vivo -->
      <div class="admin-orders-list">
        ${filteredOrders.length === 0 ? `
          <div class="order-tracker-card" style="text-align: center; padding: 3rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 0.75rem;">🥪</div>
            <h3>No hay pedidos en esta categoría</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">
              Los pedidos entrantes aparecerán aquí automáticamente con alerta sonora.
            </p>
          </div>
        ` : `
          ${filteredOrders.map(order => {
            const st = ORDER_STATUSES[order.status] || ORDER_STATUSES.pendiente;
            const items = order.items || [];

            return `
              <div class="admin-order-card status-${order.status} animate-fade-in" data-id="${order.id}">
                <div class="admin-order-header">
                  <div class="admin-student-info">
                    <div class="admin-student-name">
                      <span class="order-code-badge" style="font-size: 1.15rem; margin: 0;">
                        ${escapeHTML(order.order_number)}
                      </span>
                      <span>${escapeHTML(order.student_name)}</span>
                    </div>

                    <div class="admin-student-meta">
                      <span>🎓 <strong>${escapeHTML(order.course)} - Div. ${escapeHTML(order.division)}</strong></span>
                      <span>•</span>
                      <span>⏱️ ${formatRelativeTime(order.created_at)}</span>
                      <span>•</span>
                      <span>${formatDateTime(order.created_at)}</span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <div class="admin-recess-pill">
                      ⏰ ${escapeHTML(order.recess)}
                    </div>
                    <span class="badge" style="background-color: ${st.bg}; color: ${st.color}; font-size: 0.85rem; padding: 0.35rem 0.75rem;">
                      ${st.icon} ${st.label}
                    </span>
                  </div>
                </div>

                <!-- Detalle de Productos -->
                <div class="admin-order-items-table">
                  ${items.map(item => `
                    <div class="admin-order-item-row">
                      <div class="admin-item-qty-name">
                        <span class="admin-qty-badge">${item.quantity}x</span>
                        <span style="font-size: 0.95rem;">${escapeHTML(item.product_name)}</span>
                      </div>
                      <span style="font-weight: 700; color: #FFFFFF;">${formatCurrency(item.subtotal)}</span>
                    </div>
                  `).join('')}

                  ${order.notes ? `
                    <div style="margin-top: 0.5rem; padding: 0.4rem 0.65rem; background-color: rgba(255, 212, 41, 0.1); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--color-yellow);">
                      ⚠️ Aclaración del alumno: "<strong>${escapeHTML(order.notes)}</strong>"
                    </div>
                  ` : ''}
                </div>

                <!-- Pie de Pedido y Botones de Transición -->
                <div class="admin-order-footer">
                  <div class="admin-total-wrapper">
                    <span class="admin-total-label">Total a cobrar:</span>
                    <span class="admin-total-amount">${formatCurrency(order.total)}</span>
                  </div>

                  <div class="admin-actions-group">
                    ${order.status === 'pendiente' ? `
                      <button class="btn btn-secondary btn-sm btn-change-status" data-id="${order.id}" data-status="en_preparacion" style="color: #FB923C; border-color: #FB923C;">
                        👨‍🍳 Empezar a Preparar
                      </button>
                    ` : ''}

                    ${order.status === 'en_preparacion' || order.status === 'pendiente' ? `
                      <button class="btn btn-primary btn-sm btn-change-status" data-id="${order.id}" data-status="listo" style="background-color: #22C55E; color: #FFFFFF;">
                        🔔 Marcar LISTO p/ Retirar
                      </button>
                    ` : ''}

                    ${order.status === 'listo' ? `
                      <button class="btn btn-primary btn-sm btn-change-status" data-id="${order.id}" data-status="entregado">
                        ✅ Entregar y Cobrar
                      </button>
                    ` : ''}

                    ${order.status !== 'entregado' && order.status !== 'cancelado' ? `
                      <button class="btn btn-ghost btn-sm btn-cancel-order" data-id="${order.id}" style="color: #EF4444; font-size: 0.8rem;">
                        ✕ Cancelar
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  bindAdminEvents(container);
}

function bindAdminEvents(container) {
  // Filtros de estado
  const tabBtns = container.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeStatusFilter = btn.getAttribute('data-filter');
      renderAdminDashboard(container);
    });
  });

  // Filtro de recreo
  const recessSelect = container.querySelector('#admin-recess-filter-select');
  if (recessSelect) {
    recessSelect.addEventListener('change', (e) => {
      activeRecessFilter = e.target.value;
      renderAdminDashboard(container);
    });
  }

  // Toggle sonido
  const soundBtn = container.querySelector('#btn-toggle-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isEnabled = audioService.toggleSound();
      soundBtn.innerHTML = `<span>${isEnabled ? '🔔 Sonido ON' : '🔕 Sonido OFF'}</span>`;
      if (isEnabled) audioService.playNewOrderSound();
    });
  }

  // Botón abrir editor de precios
  const priceBtn = container.querySelector('#btn-open-price-editor');
  if (priceBtn) {
    priceBtn.addEventListener('click', () => {
      showPriceAndStockModal();
    });
  }

  // Cambio de estado de pedidos
  const statusButtons = container.querySelectorAll('.btn-change-status');
  statusButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const orderId = btn.getAttribute('data-id');
      const newStatus = btn.getAttribute('data-status');
      btn.disabled = true;
      try {
        await ordersService.updateStatus(orderId, newStatus);
        renderAdminDashboard(container);
      } catch (err) {
        alert('Error al actualizar estado: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    });
  });

  // Cancelar pedido
  const cancelButtons = container.querySelectorAll('.btn-cancel-order');
  cancelButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const orderId = btn.getAttribute('data-id');
      if (confirm('¿Seguro que deseas cancelar este pedido?')) {
        await ordersService.updateStatus(orderId, 'cancelado');
        renderAdminDashboard(container);
      }
    });
  });
}

// Modal para modificar precios y stock del catálogo
function showPriceAndStockModal() {
  const products = store.getState().products;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'price-editor-modal';

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 650px;">
      <div class="modal-header">
        <h3 class="modal-title">🏷️ Gestión de Precios y Disponibilidad</h3>
        <button class="toast-close" id="close-price-modal">&times;</button>
      </div>

      <div class="modal-body">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Como kiosquero podés ajustar los precios en pesos argentinos o marcar un producto como "Agotado" si se terminaron los ingredientes.
        </p>

        <div class="price-editor-modal-list">
          ${products.map(prod => `
            <div class="price-editor-item" data-id="${prod.id}">
              <div class="price-item-info">
                <img src="${escapeHTML(prod.image_url)}" alt="${escapeHTML(prod.name)}" class="price-item-thumb" />
                <div>
                  <div class="price-item-name">${escapeHTML(prod.name)}</div>
                  <div class="price-item-cat">${escapeHTML(prod.category)}</div>
                </div>
              </div>

              <div class="price-item-controls">
                <!-- Input de precio -->
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <span style="font-weight: 800; color: var(--color-yellow);">$</span>
                  <input 
                    type="number" 
                    class="price-input-compact" 
                    value="${prod.price}" 
                    min="0" 
                    step="50"
                    data-id="${prod.id}"
                  />
                </div>

                <!-- Botón de guardar precio individual -->
                <button class="btn btn-secondary btn-sm btn-save-price" data-id="${prod.id}" title="Guardar nuevo precio">
                  💾
                </button>

                <!-- Botón de stock toggle -->
                <button 
                  class="btn btn-sm stock-toggle-btn ${prod.available !== false ? 'btn-primary' : 'btn-secondary'}" 
                  data-id="${prod.id}"
                  data-available="${prod.available !== false}"
                  style="${prod.available === false ? 'color: #EF4444; border-color: #EF4444;' : ''}"
                >
                  ${prod.available !== false ? 'Disponible' : 'Agotado'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-header" style="justify-content: flex-end;">
        <button class="btn btn-primary" id="btn-done-price-modal">Listo</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#close-price-modal').addEventListener('click', close);
  modal.querySelector('#btn-done-price-modal').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  // Guardar precio
  modal.querySelectorAll('.btn-save-price').forEach(btn => {
    btn.addEventListener('click', async () => {
      const prodId = btn.getAttribute('data-id');
      const input = modal.querySelector(`input[data-id="${prodId}"]`);
      if (input) {
        const val = Number(input.value);
        if (val >= 0) {
          btn.textContent = '⏳';
          await productsService.updatePrice(prodId, val);
          btn.textContent = '✓';
          setTimeout(() => { btn.textContent = '💾'; }, 1000);
        }
      }
    });
  });

  // Toggle Stock
  modal.querySelectorAll('.stock-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const prodId = btn.getAttribute('data-id');
      const currentAvailable = btn.getAttribute('data-available') === 'true';
      const newAvailable = !currentAvailable;

      btn.disabled = true;
      await productsService.toggleAvailability(prodId, newAvailable);
      btn.disabled = false;

      btn.setAttribute('data-available', String(newAvailable));
      if (newAvailable) {
        btn.textContent = 'Disponible';
        btn.className = 'btn btn-sm stock-toggle-btn btn-primary';
        btn.style.color = '';
        btn.style.borderColor = '';
      } else {
        btn.textContent = 'Agotado';
        btn.className = 'btn btn-sm stock-toggle-btn btn-secondary';
        btn.style.color = '#EF4444';
        btn.style.borderColor = '#EF4444';
      }
    });
  });
}

