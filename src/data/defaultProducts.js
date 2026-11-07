// Catálogo inicial predeterminado para Kiosco10
// Utilizado como fallback offline y como datos de demostración para la muestra escolar

export const DEFAULT_PRODUCTS = [
  // --- SÁNDWICHES ---
  {
    id: 'prod-pebete-jyq',
    name: 'Pebete de jamón y queso',
    description: 'Clásico pan pebete de manteca súper tierno, abundante jamón cocido seleccionado y queso tybo fresco.',
    category: 'sandwiches',
    price: 2200,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-pebete-pollo',
    name: 'Pebete de pollo',
    description: 'Pebete relleno con pechuga de pollo desmenuzada, mayonesa suave, lechuga fresca y rodajas de tomate.',
    category: 'sandwiches',
    price: 2500,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-tostado-jyq',
    name: 'Tostado de jamón y queso',
    description: 'Tostado caliente al momento con pan crujiente, queso derretido en su punto justo y jamón cocido.',
    category: 'sandwiches',
    price: 2400,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-sandwich-miga',
    name: 'Sándwich de miga',
    description: 'Trío de sándwiches triples de miga blanca fresca, jamón y queso con suave mayonesa.',
    category: 'sandwiches',
    price: 2000,
    image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: false
  },

  // --- COMIDAS ---
  {
    id: 'prod-empanadas',
    name: 'Empanadas al horno',
    description: 'Empanada casera horneada con masa crocante: carne cortada a cuchillo suave o jamón y queso fundido.',
    category: 'comidas',
    price: 1400,
    image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-pizza',
    name: 'Porción de pizza',
    description: 'Porción grande de pizza casera al molde con salsa de tomate especial, abundante muzzarella y orégano.',
    category: 'comidas',
    price: 1800,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-panchos',
    name: 'Pancho clásico con papas pay',
    description: 'Salchicha vienesa en pan esponjoso caliente, aderezos a elección (mayo, mostaza, kétchup) y lluvia de papas crocantes.',
    category: 'comidas',
    price: 1600,
    image_url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-tartas',
    name: 'Tarta individual',
    description: 'Porción individual casera horneada del día: espinaca cremosa y queso, o jamón, queso y huevo.',
    category: 'comidas',
    price: 2300,
    image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: false
  },

  // --- DULCES ---
  {
    id: 'prod-alfajores',
    name: 'Alfajor triple de chocolate',
    description: 'Tres capas de galleta de chocolate rellenas con abundante dulce de leche repostero y cobertura semiamarga.',
    category: 'dulces',
    price: 1300,
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-turrones',
    name: 'Turrón crocante de maní',
    description: 'Clásico turrón escolar de obleas crujientes relleno con pasta de maní dulce. Rico y rápido para el recreo.',
    category: 'dulces',
    price: 700,
    image_url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: false
  },
  {
    id: 'prod-galletitas',
    name: 'Galletitas rellenas',
    description: 'Paquete de galletitas dulces rellenas sabor chocolate y vainilla, ideales para compartir.',
    category: 'dulces',
    price: 1100,
    image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: false
  },
  {
    id: 'prod-budines',
    name: 'Budín casero con chips',
    description: 'Rebanada individual esponjosa de budín de vainilla con abundantes chips de chocolate fundente.',
    category: 'dulces',
    price: 1200,
    image_url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: false
  },
  {
    id: 'prod-chocolates',
    name: 'Barra de chocolate con leche',
    description: 'Tableta individual de chocolate con leche argentino con trocitos crocantes de cereal.',
    category: 'dulces',
    price: 950,
    image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },

  // --- BEBIDAS ---
  {
    id: 'prod-agua',
    name: 'Agua mineral 500ml',
    description: 'Botella de agua mineral de manantial natural bien helada, con o sin gas.',
    category: 'bebidas',
    price: 1000,
    image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: false
  },
  {
    id: 'prod-jugos',
    name: 'Jugo de naranja natural 300ml',
    description: 'Botella con jugo exprimido 100% natural de naranja fresca sin agregados de azúcar ni conservantes.',
    category: 'bebidas',
    price: 1500,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-gaseosas',
    name: 'Gaseosa 500ml',
    description: 'Gaseosa individual bien fría: Coca-Cola original, Coca-Cola Sin Azúcar, Sprite o Fanta.',
    category: 'bebidas',
    price: 1600,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: true
  },
  {
    id: 'prod-chocolatada',
    name: 'Leche chocolatada 200ml',
    description: 'Envase tetra-brik individual bien frío con sorbete incluido, rica en calcio y energía.',
    category: 'bebidas',
    price: 1100,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    available: true,
    featured: false
  }
];

export const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: '🍽️' },
  { id: 'sandwiches', label: 'Sándwiches', icon: '🥪' },
  { id: 'comidas', label: 'Comidas', icon: '🍕' },
  { id: 'dulces', label: 'Dulces', icon: '🍫' },
  { id: 'bebidas', label: 'Bebidas', icon: '🥤' }
];

export const RECESS_OPTIONS = [
  { id: 'recreo-1', label: '1° Recreo (09:40 - 09:55)', short: '1° Recreo' },
  { id: 'recreo-2', label: '2° Recreo (11:30 - 11:45)', short: '2° Recreo' },
  { id: 'almuerzo', label: 'Horario Almuerzo (13:00 - 13:40)', short: 'Almuerzo' },
  { id: 'recreo-tarde', label: 'Recreo Tarde (15:20 - 15:35)', short: 'Recreo Tarde' }
];

export const ORDER_STATUSES = {
  pendiente: { label: 'Pendiente', color: '#FFD429', bg: 'rgba(255, 212, 41, 0.15)', icon: '⏳', desc: 'Recibido en el kiosco' },
  en_preparacion: { label: 'En preparación', color: '#FB923C', bg: 'rgba(251, 146, 60, 0.15)', icon: '👨‍🍳', desc: 'Armando tu bandeja' },
  listo: { label: 'Listo para retirar', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.2)', icon: '🔔', desc: '¡Pasa por la fila rápida!' },
  entregado: { label: 'Entregado', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)', icon: '✅', desc: 'Pedido finalizado' },
  cancelado: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: '❌', desc: 'Pedido cancelado' }
};

