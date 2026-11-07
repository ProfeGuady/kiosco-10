// Modal de Configuración de Conexión a Supabase
import { store } from '../store.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, saveCustomSupabaseConfig, clearCustomSupabaseConfig } from '../services/supabaseClient.js';
import { escapeHTML } from '../utils/formatters.js';

export function renderConfigModal(container) {
  const state = store.getState();
  if (!state.isConfigModalOpen) {
    container.innerHTML = '';
    return;
  }

  const isConnected = state.isConfigured;

  container.innerHTML = `
    <div class="modal-backdrop" id="config-modal-backdrop">
      <div class="modal-card animate-fade-in" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.3rem;">⚙️</span>
            <h3 class="modal-title">Conexión a Supabase</h3>
          </div>
          <button class="toast-close" id="btn-close-config">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <!-- Estado Actual -->
          <div style="background-color: var(--bg-card); border-left: 4px solid ${isConnected ? '#22C55E' : 'var(--color-yellow)'}; padding: 0.85rem 1rem; border-radius: var(--radius-sm);">
            <div style="font-weight: 800; font-size: 0.95rem; color: ${isConnected ? '#22C55E' : 'var(--color-yellow)'};">
              ${isConnected ? '● Conectado a Supabase en Vivo' : '○ Modo Demostración Local Activo'}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
              ${isConnected 
                ? 'Los pedidos, productos y usuarios se sincronizan directamente con tu base de datos PostgreSQL de Supabase.'
                : 'La aplicación funciona 100% de manera autónoma con simulación local en tiempo real entre pestañas. Podés ingresar tus claves de Supabase para activar el backend en la nube.'
              }
            </div>
          </div>

          <form id="config-form" style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                Supabase Project URL:
              </label>
              <input 
                type="url" 
                id="cfg-supabase-url" 
                placeholder="https://xyzcompany.supabase.co" 
                value="${escapeHTML(SUPABASE_URL)}"
                required 
              />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                Supabase Anon / Public Key:
              </label>
              <input 
                type="text" 
                id="cfg-supabase-key" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                value="${escapeHTML(SUPABASE_ANON_KEY)}"
                required 
              />
              <span style="font-size: 0.75rem; color: #EF4444; margin-top: 0.25rem; display: block;">
                ⚠️ NUNCA ingreses la clave service_role. Utilizá únicamente la clave pública anónima (anon/public).
              </span>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
              <button type="submit" class="btn btn-primary btn-block">
                Guardar y Conectar
              </button>

              ${isConnected ? `
                <button type="button" class="btn btn-secondary" id="btn-reset-demo" style="white-space: nowrap;">
                  Volver a Modo Demo
                </button>
              ` : ''}
            </div>
          </form>

          <!-- Ayuda paso a paso -->
          <div style="background-color: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--text-secondary);">
            <strong>¿Dónde obtener estos datos?</strong>
            <ol style="margin-left: 1.25rem; margin-top: 0.4rem; line-height: 1.4;">
              <li>Creá un proyecto gratuito en <a href="https://supabase.com" target="_blank" style="color: var(--color-yellow); text-decoration: underline;">supabase.com</a></li>
              <li>Abrí el <strong>SQL Editor</strong> y ejecutá el archivo <code>supabase-schema.sql</code></li>
              <li>Andá a <strong>Project Settings -> API</strong> y copiá la URL y la anon key.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `;

  bindConfigEvents(container);
}

function bindConfigEvents(container) {
  const backdrop = container.querySelector('#config-modal-backdrop');
  const closeBtn = container.querySelector('#btn-close-config');
  const close = () => store.openConfigModal(false);

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
  }

  const form = container.querySelector('#config-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = container.querySelector('#cfg-supabase-url').value;
      const key = container.querySelector('#cfg-supabase-key').value;
      saveCustomSupabaseConfig(url, key);
    });
  }

  const resetBtn = container.querySelector('#btn-reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearCustomSupabaseConfig();
    });
  }
}

