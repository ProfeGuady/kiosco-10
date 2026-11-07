// Servicio de datos y usuarios de demostración para la muestra escolar

export const DEMO_USERS = {
  alumno: {
    id: 'demo-student-1',
    email: 'santiago.benitez@colegio.edu.ar',
    full_name: 'Santiago Benítez',
    course: '4° Año',
    division: 'A',
    role: 'alumno'
  },
  profesor: {
    id: 'demo-teacher-1',
    email: 'marcelo.morales@colegio.edu.ar',
    full_name: 'Prof. Marcelo Morales',
    course: 'Sala de Profesores',
    division: 'Secundaria',
    role: 'profesor'
  },
  admin: {
    id: 'demo-admin-1',
    email: 'kiosco@colegio.edu.ar',
    full_name: 'Roberto Kiosquero',
    course: 'Kiosco Central',
    division: 'Bufet',
    role: 'admin'
  }
};

export const INITIAL_DEMO_ORDERS = [
  {
    id: 'demo-ord-101',
    user_id: 'demo-student-1',
    order_number: '#K10-4821',
    student_name: 'Santiago Benítez',
    course: '4° Año',
    division: 'A',
    total: 3600,
    recess: '1° Recreo (09:40 - 09:55)',
    status: 'listo', // ¡Listo para retirar!
    notes: 'Por favor con mayonesa aparte',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    items: [
      { product_name: 'Pebete de jamón y queso', quantity: 1, unit_price: 2200, subtotal: 2200 },
      { product_name: 'Empanadas al horno', quantity: 1, unit_price: 1400, subtotal: 1400 }
    ]
  },
  {
    id: 'demo-ord-102',
    user_id: 'demo-student-2',
    order_number: '#K10-4822',
    student_name: 'Valentina Rossi',
    course: '5° Año',
    division: 'B',
    total: 4100,
    recess: '1° Recreo (09:40 - 09:55)',
    status: 'en_preparacion',
    notes: '',
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    items: [
      { product_name: 'Tostado de jamón y queso', quantity: 1, unit_price: 2400, subtotal: 2400 },
      { product_name: 'Gaseosa 500ml', quantity: 1, unit_price: 1600, subtotal: 1600 }
    ]
  },
  {
    id: 'demo-ord-103',
    user_id: 'demo-teacher-1',
    order_number: '#K10-4823',
    student_name: 'Prof. Marcelo Morales',
    course: 'Sala de Profesores',
    division: 'Secundaria',
    total: 3800,
    recess: '2° Recreo (11:30 - 11:45)',
    status: 'pendiente',
    notes: 'Retiro en bandeja cerrada',
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    items: [
      { product_name: 'Tarta individual', quantity: 1, unit_price: 2300, subtotal: 2300 },
      { product_name: 'Jugo de naranja natural 300ml', quantity: 1, unit_price: 1500, subtotal: 1500 }
    ]
  },
  {
    id: 'demo-ord-104',
    user_id: 'demo-student-3',
    order_number: '#K10-4819',
    student_name: 'Joaquín Gómez',
    course: '3° Año',
    division: 'C',
    total: 2000,
    recess: '1° Recreo (09:40 - 09:55)',
    status: 'entregado',
    notes: '',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    items: [
      { product_name: 'Alfajor triple de chocolate', quantity: 1, unit_price: 1300, subtotal: 1300 },
      { product_name: 'Turrón crocante de maní', quantity: 1, unit_price: 700, subtotal: 700 }
    ]
  }
];

export function getDemoOrders() {
  const stored = localStorage.getItem('kiosco10_orders');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_DEMO_ORDERS;
    }
  }
  localStorage.setItem('kiosco10_orders', JSON.stringify(INITIAL_DEMO_ORDERS));
  return INITIAL_DEMO_ORDERS;
}

export function saveDemoOrders(orders) {
  localStorage.setItem('kiosco10_orders', JSON.stringify(orders));
}

