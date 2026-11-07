// Componente InstallPrompt: Instalador PWA para Android, iPhone y PC
let deferredPrompt = null;

// Capturar evento de instalación nativo
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const promptContainer = document.getElementById('install-prompt-container');
  if (promptContainer) {
    renderInstallPrompt(promptContainer);
  }
});

export function renderInstallPrompt(container) {
  // Verificar si ya está instalado en modo standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) {
    container.innerHTML = '';
    return;
  }

  // Detectar iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (!deferredPrompt && !isIOS) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="pwa-install-banner visible animate-fade-in">
      <div style="display: flex; align-items: center; gap: 0.85rem;">
        <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background-color: #111111; border: 1px solid var(--color-yellow); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
          ⚡
        </div>
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: #FFFFFF;">
            Instalar Kiosco10 en tu celular
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">
            ${isIOS ? 'Tocá "Compartir" y elegí "Agregar a pantalla de inicio"' : 'Acceso rápido y sin filas directo desde tu pantalla de inicio'}
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        ${!isIOS ? `
          <button class="btn btn-primary btn-sm" id="btn-trigger-pwa-install">
            Instalar App
          </button>
        ` : `
          <span style="font-size: 0.85rem; color: var(--color-yellow); font-weight: 700;">
            Safari ⎋
          </span>
        `}
        <button class="toast-close" id="btn-dismiss-install" style="font-size: 1.25rem;">&times;</button>
      </div>
    </div>
  `;

  const installBtn = container.querySelector('#btn-trigger-pwa-install');
  if (installBtn && deferredPrompt) {
    installBtn.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        container.innerHTML = '';
      }
      deferredPrompt = null;
    });
  }

  const dismissBtn = container.querySelector('#btn-dismiss-install');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      container.innerHTML = '';
    });
  }
}

