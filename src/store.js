// Gestor de estado global reactivo para Kiosco10
import { DEFAULT_PRODUCTS, RECESS_OPTIONS } from './data/defaultProducts.js';
import { isConfigured } from './services/supabaseClient.js';

class AppStore extends EventTarget {
  constructor() {
    super();

    // Cargar carrito previo de localStorage
    const savedCart = localStorage.getItem('kiosco10_cart');
    let parsedCart = [];
    try {
      parsedCart = savedCart ? JSON.parse(savedCart) : [];
    } catch {
      parsedCart = [];
    }

    // Cargar usuario demo previo si existe
    const savedUser = localStorage.getItem('kiosco10_user');
    let parsedUser = null;
    try {
      parsedUser = savedUser ? JSON.parse(savedUser) : null;
    } catch {
      parsedUser = null;
    }

    // Si no hay usuario y estamos en modo demo, inicializar con usuario Alumno por defecto para facilitar pruebas
    if (!parsedUser && !isConfigured) {
      parsedUser = {
        id: 'demo-student-id',
        email: 'alumno@colegio.edu.ar',
        full_name: 'Santiago Benítez',
        course: '4° Año',
        division: 'A',
        role: 'alumno'
      };
      localStorage.setItem('kiosco10_user', JSON.stringify(parsedUser));
    }

    this.state = {
      // Conexión
      isOnline: navigator.onLine,
      isConfigured: isConfigured,

      // Autenticación
      user: parsedUser,
      isAuthenticated: Boolean(parsedUser),
      role: parsedUser ? parsedUser.role : 'guest',

      // Navegación
      currentView: 'menu', // 'menu' | 'history' | 'admin'
      categoryFilter: 'todos',
      searchQuery: '',

      // Carrito
      cart: parsedCart,
      selectedRecess: RECESS_OPTIONS[0].label,
      orderNotes: '',

      // Modales y estados UI
      isCartOpen: false,
      isAuthModalOpen: false,
      authModalMode: 'login', // 'login' | 'register'
      isConfigModalOpen: false,

      // Catálogo y pedidos
      products: [...DEFAULT_PRODUCTS],
      orders: [],
      activeOrderModal: null
    };

    // Escuchar eventos de conexión a internet
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }

  getState() {
    return this.state;
  }

  // Notificar cambios a la interfaz
  setState(updater) {
    if (typeof updater === 'function') {
      this.state = { ...this.state, ...updater(this.state) };
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.dispatchEvent(new CustomEvent('statechange', { detail: this.state }));
  }

  // Métodos de Conexión
  setOnline(status) {
    this.setState({ isOnline: status });
    this.dispatchEvent(new CustomEvent('connectionchange', { detail: status }));
  }

  // Métodos de Autenticación
  setUser(user) {
    if (user) {
      localStorage.setItem('kiosco10_user', JSON.stringify(user));
      this.setState({
        user,
        isAuthenticated: true,
        role: user.role || 'alumno'
      });
    } else {
      localStorage.removeItem('kiosco10_user');
      this.setState({
        user: null,
        isAuthenticated: false,
        role: 'guest',
        currentView: 'menu'
      });
    }
  }

  // Métodos de Carrito
  addToCart(product, quantity = 1) {
    const existingIndex = this.state.cart.findIndex(item => item.product.id === product.id);
    let newCart = [...this.state.cart];

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ product, quantity });
    }

    this.saveCart(newCart);
  }

  updateCartQuantity(productId, quantity) {
    let newCart = [...this.state.cart];
    if (quantity <= 0) {
      newCart = newCart.filter(item => item.product.id !== productId);
    } else {
      const item = newCart.find(i => i.product.id === productId);
      if (item) item.quantity = quantity;
    }
    this.saveCart(newCart);
  }

  removeFromCart(productId) {
    const newCart = this.state.cart.filter(item => item.product.id !== productId);
    this.saveCart(newCart);
  }

  clearCart() {
    this.saveCart([]);
  }

  saveCart(cart) {
    localStorage.setItem('kiosco10_cart', JSON.stringify(cart));
    this.setState({ cart });
  }

  getCartCount() {
    return this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotal() {
    return this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  // Métodos de Navegación y Filtros
  setView(view) {
    // Si intenta ir al panel kiosquero y no es admin, pedir login o denegar
    if (view === 'admin' && this.state.role !== 'admin') {
      this.setState({ isAuthModalOpen: true, authModalMode: 'login' });
      return;
    }
    this.setState({ currentView: view });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setCategoryFilter(category) {
    this.setState({ categoryFilter: category });
  }

  setSearchQuery(query) {
    this.setState({ searchQuery: query });
  }

  setRecess(recess) {
    this.setState({ selectedRecess: recess });
  }

  setOrderNotes(notes) {
    this.setState({ orderNotes: notes });
  }

  // Modales
  openCart(isOpen = true) {
    this.setState({ isCartOpen: isOpen });
  }

  openAuthModal(isOpen = true, mode = 'login') {
    this.setState({ isAuthModalOpen: isOpen, authModalMode: mode });
  }

  openConfigModal(isOpen = true) {
    this.setState({ isConfigModalOpen: isOpen });
  }

  setActiveOrderModal(order) {
    this.setState({ activeOrderModal: order });
  }

  // Catálogo de productos
  setProducts(products) {
    this.setState({ products });
  }

  updateProductInState(updatedProduct) {
    const products = this.state.products.map(p => 
      p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
    );
    this.setState({ products });
  }

  // Pedidos
  setOrders(orders) {
    this.setState({ orders });
  }

  addOrder(order) {
    const orders = [order, ...this.state.orders.filter(o => o.id !== order.id)];
    this.setState({ orders });
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.state.orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o
    );
    this.setState({ orders });
  }
}

export const store = new AppStore();

