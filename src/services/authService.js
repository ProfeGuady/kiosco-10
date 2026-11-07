// Servicio de autenticación con Supabase Auth y fallback para modo demostración escolar
import { supabase, isConfigured } from './supabaseClient.js';
import { store } from '../store.js';
import { DEMO_USERS } from './demoDataService.js';

export const authService = {
  // Inicializar estado de sesión
  async init() {
    if (isConfigured && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user) {
          await this.fetchAndSetProfile(session.user);
        } else {
          // Si no hay sesión en Supabase y no hay usuario local, mantener modo invitado
          const currentStoreUser = store.getState().user;
          if (!currentStoreUser) {
            store.setUser(null);
          }
        }

        // Suscribirse a cambios de estado de autenticación de Supabase
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            await this.fetchAndSetProfile(session.user);
          } else {
            store.setUser(null);
          }
        });
      } catch (err) {
        console.error('Error al inicializar sesión Supabase:', err);
      }
    }
  },

  // Obtener perfil desde la tabla `profiles`
  async fetchAndSetProfile(user) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        store.setUser(data);
      } else {
        // Fallback con metadata del usuario
        const meta = user.user_metadata || {};
        store.setUser({
          id: user.id,
          email: user.email,
          full_name: meta.full_name || 'Usuario Kiosco10',
          course: meta.course || '1° Año',
          division: meta.division || 'A',
          role: meta.role || 'alumno'
        });
      }
    } catch (err) {
      console.warn('Error al obtener perfil:', err);
    }
  },

  // Registro de nuevo usuario
  async register({ email, password, full_name, course, division, role = 'alumno' }) {
    if (!email || !password || !full_name) {
      throw new Error('Todos los campos obligatorios deben completarse');
    }
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            course,
            division,
            role
          }
        }
      });
      if (error) throw error;
      if (data?.user) {
        await this.fetchAndSetProfile(data.user);
      }
      return data;
    } else {
      // Modo Demostración
      const newUser = {
        id: 'demo-user-' + Math.floor(Math.random() * 10000),
        email,
        full_name,
        course,
        division,
        role
      };
      store.setUser(newUser);
      return { user: newUser };
    }
  },

  // Iniciar sesión
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Por favor ingresa correo y contraseña');
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data?.user) {
        await this.fetchAndSetProfile(data.user);
      }
      return data;
    } else {
      // Modo Demostración: Si coincide con preset demo, usarlo, si no crear sesión demo
      const presetKey = Object.keys(DEMO_USERS).find(k => DEMO_USERS[k].email.toLowerCase() === email.toLowerCase());
      const user = presetKey ? DEMO_USERS[presetKey] : {
        id: 'demo-user-' + Math.floor(Math.random() * 10000),
        email,
        full_name: email.split('@')[0],
        course: '4° Año',
        division: 'A',
        role: email.includes('admin') || email.includes('kiosco') ? 'admin' : (email.includes('profe') ? 'profesor' : 'alumno')
      };
      store.setUser(user);
      return { user };
    }
  },

  // Cerrar sesión
  async logout() {
    if (isConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error al cerrar sesión en Supabase:', err);
      }
    }
    store.setUser(null);
  },

  // Conmutador rápido para la presentación de la feria escolar
  switchDemoRole(role) {
    if (DEMO_USERS[role]) {
      store.setUser(DEMO_USERS[role]);
    }
  }
};

