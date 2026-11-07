// Componente HeroBanner: Bienvenida, problema escolar y propuesta de valor
import { store } from '../store.js';

export function renderHeroBanner(container) {
  container.innerHTML = `
    <section class="hero-banner animate-fade-in" aria-label="Bienvenida Kiosco10">
      <div class="hero-content">
        <div class="hero-tag">
          <span>🚀</span>
          <span>SISTEMA ESCOLAR DE PEDIDOS ANTICIPADOS</span>
        </div>

        <h1 class="hero-title">
          Tu recreo, <span>sin filas</span>.
        </h1>

        <p class="hero-subtitle">
          Pedí tu pebete, empanada o bebida antes de que toque el timbre y retirá directamente por la <strong>fila rápida</strong> del buffet. ¡Aprovechá tus 15 minutos al máximo!
        </p>

        <div class="hero-badges-row">
          <div class="hero-pill">
            <span style="color: var(--color-yellow);">⚡</span>
            <span>Retiro inmediato en caja rápida</span>
          </div>

          <div class="hero-pill">
            <span style="color: #22C55E;">✓</span>
            <span>Precios escolares actualizados</span>
          </div>

          <div class="hero-pill">
            <span style="color: #60A5FA;">🔔</span>
            <span>Aviso en vivo cuando está listo</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

