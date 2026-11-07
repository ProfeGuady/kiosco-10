// Componente OfflineBanner: Aviso de estado de conexión a internet
import { store } from '../store.js';

export function renderOfflineBanner(container) {
  const isOnline = store.getState().isOnline;

  if (isOnline) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="offline-banner visible animate-fade-in" role="alert">
      <span>📡</span>
      <span>
        <strong>Sin conexión a internet:</strong> Podés consultar el menú, pero los pedidos necesitan conexión para sincronizarse con el kiosco.
      </span>
    </div>
  `;
}

