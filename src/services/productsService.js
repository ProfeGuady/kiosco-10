// Servicio del catálogo de productos con Supabase y modo Demostración
import { supabase, isConfigured, localRealtimeChannel } from './supabaseClient.js';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts.js';
import { store } from '../store.js';

export const productsService = {
  // Cargar lista completa de productos
  async fetchProducts() {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('category')
          .order('name');

        if (error) throw error;
        if (data && data.length > 0) {
          store.setProducts(data);
          return data;
        }
      } catch (err) {
        console.warn('Error al consultar productos en Supabase, utilizando catálogo base:', err);
      }
    }

    // Modo local / demostración
    const saved = localStorage.getItem('kiosco10_products');
    let products = DEFAULT_PRODUCTS;
    if (saved) {
      try {
        products = JSON.parse(saved);
      } catch {
        products = DEFAULT_PRODUCTS;
      }
    } else {
      localStorage.setItem('kiosco10_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    store.setProducts(products);
    return products;
  },

  // Modificar precio de un producto (Función exclusiva de administración)
  async updatePrice(productId, newPrice) {
    const price = Number(newPrice);
    if (isNaN(price) || price < 0) {
      throw new Error('El precio debe ser un número positivo');
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({ price })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      store.updateProductInState(data);
      return data;
    } else {
      // Modo demostración
      const current = store.getState().products;
      const updated = current.map(p => p.id === productId ? { ...p, price } : p);
      localStorage.setItem('kiosco10_products', JSON.stringify(updated));
      store.setProducts(updated);

      // Notificar a otras pestañas en vivo
      localRealtimeChannel.postMessage({ type: 'PRODUCT_UPDATED', productId, price });
      return updated.find(p => p.id === productId);
    }
  },

  // Modificar disponibilidad (Disponible / Agotado)
  async toggleAvailability(productId, available) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({ available })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      store.updateProductInState(data);
      return data;
    } else {
      const current = store.getState().products;
      const updated = current.map(p => p.id === productId ? { ...p, available } : p);
      localStorage.setItem('kiosco10_products', JSON.stringify(updated));
      store.setProducts(updated);

      localRealtimeChannel.postMessage({ type: 'PRODUCT_AVAILABILITY_CHANGED', productId, available });
      return updated.find(p => p.id === productId);
    }
  }
};

