// Modal de confirmación de pedido con animación de confetti y seguimiento de estado
import confetti from 'canvas-confetti';
import { formatCurrency, escapeHTML } from '../utils/formatters.js';
import { ORDER_STATUSES } from '../data/defaultProducts.js';
import { store } from '../store.js';

export function showOrderSuccessModal(order) {
  // Disparar confetti festivo
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD429', '#FFFFFF', '#FFA500']
    });
  } catch (e) {
    // Confetti opcional si la librería no carga
  }

  const existingModal = document.getElementById('order-success-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'order-success-modal';

  const statusKey = order.status || 'pendiente';
  const statusInfo = ORDER_STATUSES[statusKey] || ORDER_STATUSES.pendiente;

  // Determinar paso activo para el stepper visual
  const stepIndex = ['pendiente', 'en_preparacion', 'listo', 'entregado'].indexOf(statusKey);

  modal.innerHTML = `
    <div class="modal-card animate-fade-in" style="max-width: 480px; text-align: center;">
      <div class="modal-body" style="padding: 2rem 1.75rem;">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">🎉</div>
        
        <h2 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 0.25rem;">
          ¡Pedido Confirmado!
        </h2>
        
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
          Tu pedido ya fue recibido por el kiosco escolar.
        </p>

        <!-- Número de Pedido Destacado -->
        <div class="order-tracker-card" style="background-color: var(--bg-secondary); border: 2px dashed var(--color-yellow);">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Tu Número de Retiro
          </div>
          <div class="order-code-badge" style="font-size: 1.8rem; margin: 0.4rem 0;">
            ${escapeHTML(order.order_number)}
          </div>
          <div style="font-size: 0.85rem; color: var(--color-yellow);">
            ${escapeHTML(order.student_name)} (${escapeHTML(order.course)} - ${escapeHTML(order.division)})
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
            ⏰ Retiras en: <strong>${escapeHTML(order.recess)}</strong>
          </div>
        </div>

        <!-- Stepper de 4 Pasos -->
        <div class="tracker-steps">
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

        <!-- Instrucción de la fila rápida -->
        <div style="background-color: rgba(255, 212, 41, 0.08); border-radius: var(--radius-sm); padding: 0.75rem; margin: 1.25rem 0; font-size: 0.85rem; color: #FFFFFF;">
          ⚡ <strong>Fila Rápida:</strong> Cuando tu pedido figure como <em>"Listo para retirar"</em>, acercate a la ventanilla especial de Kiosco10 y mostrá el código <strong>${escapeHTML(order.order_number)}</strong>.
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
          <button class="btn btn-secondary btn-block" id="btn-close-success-modal">
            Seguir comprando
          </button>
          <button class="btn btn-primary btn-block" id="btn-view-in-history">
            Ver mis pedidos
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#btn-close-success-modal').addEventListener('click', close);
  modal.querySelector('#btn-view-in-history').addEventListener('click', () => {
    close();
    store.setView('history');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

