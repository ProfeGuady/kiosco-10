// Servicio de pedidos con Supabase Realtime, validación segura de precios y modo demostración
import { supabase, isConfigured, localRealtimeChannel } from './supabaseClient.js';
import { store } from '../store.js';
import { getDemoOrders, saveDemoOrders } from './demoDataService.js';
import { audioService } from './audioService.js';

let realtimeSubscription = null;

export const ordersService = {
  // Inicializar suscripción Realtime a la tabla `orders`
  initRealtime() {
    // 1. Escuchar canal local de demostración (Sincroniza pestañas abiertas)
    localRealtimeChannel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'NEW_ORDER') {
        const currentOrders = store.getState().orders;
        const exists = currentOrders.some(o => o.id === data.order.id);
        if (!exists) {
          store.addOrder(data.order);
          // Si el usuario actual es kiosquero, sonar campana y alertar
          if (store.getState().role === 'admin') {
            audioService.playNewOrderSound();
            this.showToastNotification(`Nuevo pedido recibido: ${data.order.order_number} (${data.order.student_name})`);
          }
        }
      } else if (data.type === 'STATUS_UPDATED') {
        store.updateOrderStatus(data.orderId, data.status);
        // Si el pedido pertenece al alumno logueado, alertar cambio
        const currentUser = store.getState().user;
        if (currentUser && data.userId === currentUser.id) {
          if (data.status === 'listo') {
            audioService.playSuccessSound();
            this.showToastNotification(`¡Tu pedido ${data.orderNumber} está LISTO para retirar por la fila rápida! 🔔`, 'success');
          } else {
            this.showToastNotification(`El pedido ${data.orderNumber} cambió a estado: ${data.status}`);
          }
        }
      }
    };

    // 2. Si Supabase está configurado, suscribirse al canal Realtime de Supabase
    if (isConfigured && supabase) {
      try {
        if (realtimeSubscription) {
          supabase.removeChannel(realtimeSubscription);
        }

        realtimeSubscription = supabase
          .channel('public:orders')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'orders' },
            async (payload) => {
              const newOrder = payload.new;
              // Consultar items del pedido recién creado
              const { data: items } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', newOrder.id);

              const fullOrder = { ...newOrder, items: items || [] };
              store.addOrder(fullOrder);

              if (store.getState().role === 'admin') {
                audioService.playNewOrderSound();
                this.showToastNotification(`Nuevo pedido: ${newOrder.order_number} de ${newOrder.student_name}`);
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'orders' },
            (payload) => {
              const updated = payload.new;
              store.updateOrderStatus(updated.id, updated.status);

              const currentUser = store.getState().user;
              if (currentUser && updated.user_id === currentUser.id) {
                if (updated.status === 'listo') {
                  audioService.playSuccessSound();
                  this.showToastNotification(`¡Tu pedido ${updated.order_number} está LISTO para retirar! 🔔`, 'success');
                } else {
                  this.showToastNotification(`Tu pedido ${updated.order_number} está: ${updated.status}`);
                }
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Error al iniciar canal Realtime de Supabase:', err);
      }
    }
  },

  // Obtener pedidos según el rol (Alumno ve solo los suyos, Admin ve todos)
  async fetchOrders() {
    const { user, role } = store.getState();
    if (!user) {
      store.setOrders([]);
      return [];
    }

    if (isConfigured && supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false });

        // Si no es admin, filtrar estrictamente por su propio user_id
        if (role !== 'admin') {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        store.setOrders(data || []);
        return data || [];
      } catch (err) {
        console.warn('Error al consultar pedidos en Supabase, utilizando almacenamiento local:', err);
      }
    }

    // Modo Demostración
    const allDemoOrders = getDemoOrders();
    let userOrders = allDemoOrders;
    if (role !== 'admin') {
      userOrders = allDemoOrders.filter(o => o.user_id === user.id);
    }
    store.setOrders(userOrders);
    return userOrders;
  },

  // CREACIÓN SEGURA DE PEDIDOS:
  // Valida que haya conexión, calcula los precios reales con el catálogo oficial
  // para evitar manipulación de montos desde la consola del navegador.
  async createOrder({ items, recess, notes }) {
    // 1. Validar conexión estricta
    if (!navigator.onLine) {
      throw new Error('Sin conexión a internet. Los pedidos necesitan conexión para sincronizarse con el kiosco.');
    }

    const { user, products } = store.getState();
    if (!user) {
      throw new Error('Debes iniciar sesión para confirmar el pedido');
    }

    if (!items || items.length === 0) {
      throw new Error('El carrito no contiene productos');
    }

    // 2. Validación y cálculo de precios con la lista oficial (Seguridad Antifraude)
    const secureItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const officialProduct = products.find(p => p.id === item.product.id);
      if (!officialProduct) {
        throw new Error(`El producto seleccionado ya no está disponible`);
      }
      if (!officialProduct.available) {
        throw new Error(`El producto "${officialProduct.name}" se encuentra agotado`);
      }

      const itemQty = Number(item.quantity) || 1;
      const unitPrice = Number(officialProduct.price);
      const subtotal = unitPrice * itemQty;
      calculatedTotal += subtotal;

      secureItems.push({
        product_id: officialProduct.id,
        product_name: officialProduct.name,
        quantity: itemQty,
        unit_price: unitPrice,
        subtotal
      });
    }

    // Generar identificador de pedido único (#K10-XXXX)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `#K10-${randomCode}`;

    // 3. Si Supabase está conectado, invocar la función RPC segura o insertar con RLS
    if (isConfigured && supabase) {
      try {
        // Intentar primero procedimiento almacenado seguro en base de datos
        const rpcPayload = {
          p_recess: recess,
          p_notes: notes || '',
          p_items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity }))
        };

        const { data: rpcResult, error: rpcError } = await supabase.rpc('create_secure_order', rpcPayload);

        if (!rpcError && rpcResult) {
          // Consultar el pedido insertado
          const { data: insertedOrder } = await supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('id', rpcResult.order_id)
            .single();

          if (insertedOrder) {
            store.addOrder(insertedOrder);
            audioService.playSuccessSound();
            return insertedOrder;
          }
        }

        // Si la función RPC aún no fue ejecutada en el editor SQL, fallback a inserción segura directa
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            order_number: orderNumber,
            student_name: user.full_name,
            course: user.course || '1° Año',
            division: user.division || 'A',
            total: calculatedTotal,
            recess: recess,
            status: 'pendiente',
            notes: notes || ''
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Insertar items
        const itemsToInsert = secureItems.map(si => ({
          order_id: orderData.id,
          product_id: si.product_id,
          product_name: si.product_name,
          quantity: si.quantity,
          unit_price: si.unit_price,
          subtotal: si.subtotal
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;

        const completeOrder = { ...orderData, items: secureItems };
        store.addOrder(completeOrder);
        audioService.playSuccessSound();
        return completeOrder;
      } catch (err) {
        console.error('Error al guardar pedido en Supabase:', err);
        throw new Error('No se pudo confirmar el pedido en el servidor. Por favor verifica tu conexión: ' + (err.message || err));
      }
    }

    // 4. Modo Demostración Escolar
    const newDemoOrder = {
      id: 'ord-' + Date.now(),
      user_id: user.id,
      order_number: orderNumber,
      student_name: user.full_name,
      course: user.course || '4° Año',
      division: user.division || 'A',
      total: calculatedTotal,
      recess: recess,
      status: 'pendiente',
      notes: notes || '',
      created_at: new Date().toISOString(),
      items: secureItems
    };

    const currentOrders = getDemoOrders();
    const updatedOrders = [newDemoOrder, ...currentOrders];
    saveDemoOrders(updatedOrders);
    store.addOrder(newDemoOrder);

    // Notificar en tiempo real a otras pestañas abiertas (ej. pestaña del Kiosquero)
    localRealtimeChannel.postMessage({ type: 'NEW_ORDER', order: newDemoOrder });
    audioService.playSuccessSound();

    return newDemoOrder;
  },

  // Cambiar estado de un pedido (Exclusivo Kiosquero / Administrador)
  async updateStatus(orderId, newStatus) {
    const { orders } = store.getState();
    const targetOrder = orders.find(o => o.id === orderId);

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      store.updateOrderStatus(orderId, newStatus);
      return data;
    } else {
      // Modo demostración
      const allOrders = getDemoOrders();
      const updated = allOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      saveDemoOrders(updated);
      store.updateOrderStatus(orderId, newStatus);

      localRealtimeChannel.postMessage({
        type: 'STATUS_UPDATED',
        orderId,
        status: newStatus,
        orderNumber: targetOrder ? targetOrder.order_number : '',
        userId: targetOrder ? targetOrder.user_id : ''
      });
      return { id: orderId, status: newStatus };
    }
  },

  // Notificación flotante Toast
  showToastNotification(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `k10-toast toast-${type} animate-slide-in`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : '🔔')}</span>
        <span class="toast-text">${message}</span>
      </div>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }
};

