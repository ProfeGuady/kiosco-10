// Inicialización del cliente Supabase con soporte para modo Realtime y modo Demostración
import { createClient } from '@supabase/supabase-js';

// 1. Obtener credenciales desde variables de entorno de Vite o desde almacenamiento local configurable
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const localUrl = localStorage.getItem('kiosco10_supabase_url') || '';
const localKey = localStorage.getItem('kiosco10_supabase_key') || '';

export const SUPABASE_URL = localUrl || envUrl;
export const SUPABASE_ANON_KEY = localKey || envKey;

// Determinar si Supabase está efectivamente configurado con credenciales válidas
export const isConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('tu-proyecto') &&
  !SUPABASE_ANON_KEY.includes('tu-clave')
);

// Canal de difusión local para sincronizar pestañas en modo demostración (sin backend)
export const localRealtimeChannel = new BroadcastChannel('kiosco10_realtime_channel');

let supabaseInstance = null;

if (isConfigured) {
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  } catch (err) {
    console.error('Error al inicializar Supabase:', err);
    supabaseInstance = null;
  }
}

export const supabase = supabaseInstance;

// Helper para guardar credenciales desde la interfaz de configuración
export function saveCustomSupabaseConfig(url, key) {
  if (url && key) {
    localStorage.setItem('kiosco10_supabase_url', url.trim());
    localStorage.setItem('kiosco10_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearCustomSupabaseConfig() {
  localStorage.removeItem('kiosco10_supabase_url');
  localStorage.removeItem('kiosco10_supabase_key');
  window.location.reload();
}

