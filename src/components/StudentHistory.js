// Componente StudentHistory: Historial de pedidos del alumno con seguimiento en vivo
import { store } from '../store.js';
import { ordersService } from '../services/ordersService.js';
import { formatCurrency, formatDateTime, formatRelativeTime, escapeHTML } from '../utils/formatters.js';
import { ORDER_STATUSES } from '../data/defaultProducts.js';

export function renderStudentHistory(container) {
  const state = store.getState();
  const user = state.user;
  const orders = state.orders;

  if (!user) {
    container.innerHTML = `
      <div class="main-container animate-fade-in" style="max-width: 600px; text-align: center; padding: 3rem 1rem;">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">📋</div>
        <h2>Iniciá sesión para ver tus pedidos</h2>
        <p style="margin: 0.75rem 0 1.5rem;">
          Consultá el estado en tiempo real de tus compras y retirá sin filas.
        </p>
        <button class="btn btn-primary btn-lg" id="btn-history-login">
          Iniciar sesión
        </button>
      </div>
    `;
    const loginBtn = container.querySelector('#btn-history-login');
    if (loginBtn) loginBtn.addEventListener('click', () => store.openAuthModal(true));
    return;
  }

  // Filtrar pedidos del alumno actual
  const userOrders = state.role === 'admin' 
    ? orders 
    : orders.filter(o => o.user_id === user.id);

  container.innerHTML = `
    <div class="main-container animate-fade-in">
      <div class="section-header">
        <div>
          <h2 class="section-title">
            <span>📋</span>
            <span>Mis Pedidos</span>
          </h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Alumno: <strong>${escapeHTML(user.full_name)}</strong> (${escapeHTML(user.course)} ${escapeHTML(user.division)})
          </p>
        </div>

        <button class="btn btn-secondary btn-sm" id="btn-refresh-history">
          🔄 Actualizar
        </button>
      </div>

      ${userOrders.length === 0 ? `
        <div class="order-tracker-card" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">🥪</div>
          <h3>Aún no realizaste ningún pedido</h3>
          <p style="margin: 0.5rem 0 1.25rem; font-size: 0.9rem;">
            Elegí tus productos en el menú antes del recreo y retirás sin demora.
          </p>
          <button class="btn btn-primary" id="btn-history-go-menu">
            Ir al Menú del Kiosco
          </button>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${userOrders.map(order => {
            const st = ORDER_STATUSES[order.status] || ORDER_STATUSES.pendiente;
            const stepIndex = ['pendiente', 'en_preparacion', 'listo', 'entregado'].indexOf(order.status);
            const isReady = order.status === 'listo';

            return `
              <div class="admin-order-card status-${order.status} animate-fade-in" style="${isReady ? 'border: 2px solid #22C55E; box-shadow: 0 0 16px rgba(34, 197, 94, 0.25);' : ''}">
                <div class="admin-order-header">
                  <div class="admin-student-info">
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <span class="order-code-badge" style="font-size: 1.15rem; margin: 0;">
                        ${escapeHTML(order.order_number)}
                      </span>
                      <span class="badge" style="background-color: ${st.bg}; color: ${st.color}; font-size: 0.85rem; padding: 0.35rem 0.75rem;">
                        ${st.icon} ${st.label}
                      </span>
                    </div>

                    <div class="admin-student-meta" style="margin-top: 0.4rem;">
                      <span>📅 ${formatDateTime(order.created_at)}</span>
                      <span>•</span>
                      <span>${formatRelativeTime(order.created_at)}</span>
                    </div>
                  </div>

                  <div class="admin-recess-pill">
                    ⏰ ${escapeHTML(order.recess)}
                  </div>
                </div>

                ${isReady ? `
                  <div style="background-color: rgba(34, 197, 94, 0.15); border: 1px solid #22C55E; border-radius: var(--radius-sm); padding: 0.75rem 1rem; color: #FFFFFF; font-weight: 700; display: flex; align-items: center; gap: 0.65rem;">
                    <span style="font-size: 1.5rem;">🔔</span>
                    <div>
                      <div>¡TU PEDIDO ESTÁ LISTO PARA RETIRAR!</div>
                      <div style="font-size: 0.8rem; font-weight: normal; opacity: 0.9;">
                        Pasá ahora por la fila rápida del kiosco y mostrá el código <strong>${escapeHTML(order.order_number)}</strong>.
                      </div>
                    </div>
                  </div>
                ` : ''}

                <!-- Stepper de 4 Pasos -->
                <div class="tracker-steps" style="margin: 0.75rem 0;">
                  <div class="tracker-step-item ${stepIndex >= 0 ? (stepIndex === 0 ? 'active' : 'completed') : ''}">
                    <div class="tracker-step-circle">⏳</div>
                    <span class="tracker-step-label">Pendiente</span>
                  </div>
                  <div class="tracker-step-item ${stepIndex >= 1 ? (stepIndex === 1 ? 'active' : 'completed') : ''}">
                    <div class="tracker-step-circle">👨‍🍳</div>
                    <span class="tracker-step-label">Preparando</span>
                  </div>
                  <div class="tracker-step-item ${stepIndex >= 2 ? (stepIndex === 2 ? 'active' : 'completed') : ''}">
                    <div class="tracker-step-circle">🔔</div>
                    <span class="tracker-step-label">Listo</span>
                  </div>
                  <div class="tracker-step-item ${stepIndex >= 3 ? 'completed' : ''}">
                    <div class="tracker-step-circle">✅</div>
                    <span class="tracker-step-label">Entregado</span>
                  </div>
                </div>

                <!-- Detalle de productos -->
                <div class="admin-order-items-table">
                  ${(order.items || []).map(item => `
                    <div class="admin-order-item-row">
                      <div class="admin-item-qty-name">
                        <span class="admin-qty-badge">${item.quantity}x</span>
                        <span>${escapeHTML(item.product_name)}</span>
                      </div>
                      <span style="color: var(--text-secondary);">${formatCurrency(item.subtotal)}</span>
                    </div>
                  `).join('')}

                  ${order.notes ? `
                    <div style="font-size: 0.8rem; color: var(--color-yellow); margin-top: 0.35rem; font-style: italic;">
                      Nota: "${escapeHTML(order.notes)}"
                    </div>
                  ` : ''}
                </div>

                <div class="admin-order-footer">
                  <div class="admin-total-wrapper">
                    <span class="admin-total-label">Total del pedido:</span>
                    <span class="admin-total-amount">${formatCurrency(order.total)}</span>
                  </div>

                  <span style="font-size: 0.8rem; color: var(--text-muted);">
                    Se abona en efectivo o Mercado Pago al retirar
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  bindStudentHistoryEvents(container);
}

function bindStudentHistoryEvents(container) {
  const refreshBtn = container.querySelector('#btn-refresh-history');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Actualizando...';
      await ordersService.fetchOrders();
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 Actualizar';
    });
  }

  const goMenuBtn = container.querySelector('#btn-history-go-menu');
  if (goMenuBtn) {
    goMenuBtn.addEventListener('click', () => store.setView('menu'));
  }
}

