// Modal de Autenticación: Registro e Inicio de Sesión con selección de Curso, División y Rol
import { store } from '../store.js';
import { authService } from '../services/authService.js';
import { escapeHTML } from '../utils/formatters.js';

export function renderAuthModal(container) {
  const state = store.getState();
  if (!state.isAuthModalOpen) {
    container.innerHTML = '';
    return;
  }

  const mode = state.authModalMode; // 'login' | 'register'

  container.innerHTML = `
    <div class="modal-backdrop" id="auth-modal-backdrop">
      <div class="modal-card animate-fade-in" style="max-width: 460px;">
        <!-- Cabecera de Marca -->
        <div class="modal-header" style="flex-direction: column; align-items: center; text-align: center; position: relative; padding: 1.75rem 1.5rem 1rem;">
          <button class="toast-close" id="btn-close-auth-modal" style="position: absolute; top: 1rem; right: 1rem;">&times;</button>
          
          <div style="width: 52px; height: 52px; border-radius: var(--radius-sm); background-color: var(--bg-surface); border: 2px solid var(--color-yellow); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; box-shadow: 0 0 16px var(--color-yellow-glow);">
            <span style="font-size: 1.6rem;">🍔</span>
          </div>

          <h2 style="font-size: 1.4rem; font-weight: 900; letter-spacing: -0.5px;">
            KIOSCO<span style="color: var(--color-yellow);">10</span>
          </h2>
          <p style="font-size: 0.85rem; color: var(--color-yellow); font-weight: 700;">
            Tu recreo, sin filas
          </p>

          <!-- Pestañas de modo -->
          <div style="display: flex; gap: 0.5rem; width: 100%; margin-top: 1.25rem; background-color: var(--bg-primary); padding: 0.25rem; border-radius: var(--radius-sm);">
            <button class="btn btn-sm btn-block ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}" id="tab-login-btn">
              Iniciar Sesión
            </button>
            <button class="btn btn-sm btn-block ${mode === 'register' ? 'btn-primary' : 'btn-ghost'}" id="tab-register-btn">
              Crear Cuenta
            </button>
          </div>
        </div>

        <div class="modal-body" style="padding: 1.25rem 1.5rem 1.75rem;">
          <!-- Mensaje de error si ocurre -->
          <div id="auth-error-msg" style="display: none; background-color: rgba(239, 68, 68, 0.15); border: 1px solid #EF4444; color: #FCA5A5; padding: 0.65rem; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 1rem;"></div>

          <form id="auth-form" style="display: flex; flex-direction: column; gap: 0.9rem;">
            ${mode === 'register' ? `
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                  Nombre y Apellido:
                </label>
                <input type="text" id="auth-fullname" placeholder="Ej: Santiago Benítez" required />
              </div>
            ` : ''}

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                Correo Electrónico:
              </label>
              <input type="email" id="auth-email" placeholder="alumno@colegio.edu.ar" required />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                Contraseña:
              </label>
              <input type="password" id="auth-password" placeholder="••••••••" required minlength="6" />
            </div>

            ${mode === 'register' ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                    Curso:
                  </label>
                  <select id="auth-course">
                    <option value="1° Año">1° Año</option>
                    <option value="2° Año">2° Año</option>
                    <option value="3° Año">3° Año</option>
                    <option value="4° Año" selected>4° Año</option>
                    <option value="5° Año">5° Año</option>
                    <option value="6° Año">6° Año</option>
                    <option value="Docentes">Docentes</option>
                  </select>
                </div>

                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                    División:
                  </label>
                  <select id="auth-division">
                    <option value="A" selected>División A</option>
                    <option value="B">División B</option>
                    <option value="C">División C</option>
                    <option value="1ra">1ra</option>
                    <option value="2da">2da</option>
                    <option value="Única">Única</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
                  Rol en la Institución:
                </label>
                <select id="auth-role">
                  <option value="alumno" selected>🎒 Alumno</option>
                  <option value="profesor">👨‍🏫 Profesor / Docente</option>
                  <option value="admin">⚡ Administrador (Kiosquero)</option>
                </select>
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-submit-auth" style="margin-top: 0.5rem;">
              <span id="auth-submit-spinner" style="display: none;">⏳</span>
              <span id="auth-submit-label">${mode === 'login' ? 'Ingresar a Kiosco10' : 'Completar Registro'}</span>
            </button>
          </form>

          <!-- Accesos rápidos para la feria escolar -->
          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">
              ACCESO RÁPIDO PARA DEMOSTRACIÓN:
            </div>
            <div style="display: flex; gap: 0.4rem; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm btn-quick-role" data-role="alumno">
                🎒 Alumno
              </button>
              <button class="btn btn-secondary btn-sm btn-quick-role" data-role="profesor">
                👨‍🏫 Profesor
              </button>
              <button class="btn btn-secondary btn-sm btn-quick-role" data-role="admin" style="border-color: var(--color-yellow);">
                ⚡ Kiosquero
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  bindAuthEvents(container);
}

function bindAuthEvents(container) {
  const backdrop = container.querySelector('#auth-modal-backdrop');
  const closeBtn = container.querySelector('#btn-close-auth-modal');
  const close = () => store.openAuthModal(false);

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
  }

  // Pestañas
  const tabLogin = container.querySelector('#tab-login-btn');
  const tabRegister = container.querySelector('#tab-register-btn');

  if (tabLogin) tabLogin.addEventListener('click', () => store.openAuthModal(true, 'login'));
  if (tabRegister) tabRegister.addEventListener('click', () => store.openAuthModal(true, 'register'));

  // Form submit
  const form = container.querySelector('#auth-form');
  const errorMsg = container.querySelector('#auth-error-msg');
  const submitBtn = container.querySelector('#btn-submit-auth');
  const spinner = container.querySelector('#auth-submit-spinner');
  const label = container.querySelector('#auth-submit-label');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';

      const mode = store.getState().authModalMode;
      const email = container.querySelector('#auth-email').value.trim();
      const password = container.querySelector('#auth-password').value;

      submitBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline';

      try {
        if (mode === 'register') {
          const full_name = container.querySelector('#auth-fullname').value.trim();
          const course = container.querySelector('#auth-course').value;
          const division = container.querySelector('#auth-division').value;
          const role = container.querySelector('#auth-role').value;

          await authService.register({
            email,
            password,
            full_name,
            course,
            division,
            role
          });
        } else {
          await authService.login({ email, password });
        }

        close();
      } catch (err) {
        errorMsg.textContent = err.message || 'Error en la autenticación';
        errorMsg.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }

  // Quick Demo roles
  const quickButtons = container.querySelectorAll('.btn-quick-role');
  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      authService.switchDemoRole(role);
      close();
      if (role === 'admin') {
        store.setView('admin');
      }
    });
  });
}

