-- ==============================================================================
-- KIOSCO10 — TU RECREO, SIN FILAS
-- SCRIPT DE BASE DE DATOS SUPABASE (PostgreSQL + RLS + Realtime)
-- ==============================================================================

-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. TABLA: PROFILES (Perfiles de usuarios extendiendo auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  course text not null default '1° Año',
  division text not null default 'A',
  role text not null check (role in ('alumno', 'profesor', 'admin')) default 'alumno',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. TABLA: PRODUCTS (Catálogo de productos del Kiosco)
-- ==============================================================================
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null check (category in ('sandwiches', 'comidas', 'dulces', 'bebidas')),
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  available boolean default true not null,
  featured boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 4. TABLA: ORDERS (Pedidos realizados)
-- ==============================================================================
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  order_number text not null unique,
  student_name text not null,
  course text not null,
  division text not null,
  total numeric(10,2) not null check (total >= 0),
  recess text not null,
  status text not null check (status in ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')) default 'pendiente',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 5. TABLA: ORDER_ITEMS (Detalle de cada pedido)
-- ==============================================================================
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

-- Índices para optimizar consultas frecuentes y Realtime
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_available on public.products(available);

-- ==============================================================================
-- 6. FUNCIONES DE SEGURIDAD Y HELPERS
-- ==============================================================================

-- Verificar si el usuario actual tiene rol 'admin'
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;

-- Trigger para crear perfil automáticamente al registrarse en auth.users
create or replace function public.handle_new_user()
returns trigger security definer as $$
begin
  insert into public.profiles (id, full_name, email, course, division, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario Kiosco10'),
    new.email,
    coalesce(new.raw_user_meta_data->>'course', '1° Año'),
    coalesce(new.raw_user_meta_data->>'division', 'A'),
    coalesce(new.raw_user_meta_data->>'role', 'alumno')
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 7. FUNCIÓN SEGURA PARA CREAR PEDIDOS (VALIDACIÓN SERVER-SIDE DE PRECIOS)
-- Nunca confiar en los precios enviados por el cliente.
-- Esta función lee los precios reales directamente de la tabla `products`.
-- ==============================================================================
create or replace function public.create_secure_order(
  p_recess text,
  p_notes text,
  p_items jsonb
)
returns jsonb security definer as $$
declare
  v_user_id uuid;
  v_user_name text;
  v_course text;
  v_division text;
  v_order_id uuid;
  v_order_number text;
  v_order_total numeric(10,2) := 0;
  v_item jsonb;
  v_prod_id uuid;
  v_prod_name text;
  v_prod_price numeric(10,2);
  v_prod_available boolean;
  v_qty integer;
  v_subtotal numeric(10,2);
  v_random_code integer;
begin
  -- 1. Validar autenticación
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Debe iniciar sesión para realizar un pedido';
  end if;

  -- 2. Obtener datos del alumno/profesor desde profiles
  select full_name, course, division
  into v_user_name, v_course, v_division
  from public.profiles
  where id = v_user_id;

  if v_user_name is null then
    v_user_name := 'Usuario Registrado';
    v_course := '1° Año';
    v_division := 'A';
  end if;

  -- 3. Validar que la lista de items no esté vacía
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  -- 4. Generar número único de pedido (Formato: #K10-4821)
  v_random_code := floor(random() * 9000 + 1000)::int;
  v_order_number := '#K10-' || v_random_code::text;

  -- 5. Crear el pedido inicial
  insert into public.orders (
    user_id,
    order_number,
    student_name,
    course,
    division,
    total,
    recess,
    status,
    notes
  ) values (
    v_user_id,
    v_order_number,
    v_user_name,
    v_course,
    v_division,
    0, -- se actualiza luego del cálculo real
    p_recess,
    'pendiente',
    p_notes
  ) returning id into v_order_id;

  -- 6. Iterar sobre cada producto, consultar precio oficial y validar disponibilidad
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_prod_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;

    if v_qty <= 0 then
      raise exception 'La cantidad debe ser mayor a 0';
    end if;

    select name, price, available
    into v_prod_name, v_prod_price, v_prod_available
    from public.products
    where id = v_prod_id;

    if v_prod_name is null then
      raise exception 'Producto no encontrado: %', v_prod_id;
    end if;

    if not v_prod_available then
      raise exception 'El producto "%" está agotado en este momento', v_prod_name;
    end if;

    v_subtotal := v_prod_price * v_qty;
    v_order_total := v_order_total + v_subtotal;

    -- Insertar item con precio seguro verificado en servidor
    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal
    ) values (
      v_order_id,
      v_prod_id,
      v_prod_name,
      v_qty,
      v_prod_price,
      v_subtotal
    );
  end loop;

  -- 7. Actualizar el total oficial del pedido
  update public.orders
  set total = v_order_total
  where id = v_order_id;

  -- 8. Retornar resumen del pedido generado
  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_order_total,
    'status', 'pendiente',
    'student_name', v_user_name,
    'course', v_course,
    'division', v_division,
    'recess', p_recess
  );
end;
$$ language plpgsql;

-- ==============================================================================
-- 8. POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- PROFILES:
-- Cada usuario lee y edita su propio perfil; admins leen todos.
create policy "Ver perfiles propios o admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Actualizar perfil propio o admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Insertar perfil propio"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- PRODUCTS:
-- Lectura pública para cualquier usuario (incluso anónimos para ver menú).
create policy "Cualquiera puede ver productos disponibles"
  on public.products for select
  using (true);

-- Solo administradores pueden agregar, editar o borrar productos
create policy "Admins gestionan productos"
  on public.products for all
  using (public.is_admin());

-- ORDERS:
-- Alumnos solo ven sus propios pedidos; admins ven todos los pedidos.
create policy "Ver pedidos propios o todos si es admin"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Crear pedidos autenticados"
  on public.orders for insert
  with check (auth.uid() is not null);

create policy "Admins actualizan estado de pedidos"
  on public.orders for update
  using (public.is_admin());

-- ORDER ITEMS:
-- Los usuarios ven los items de sus pedidos; admins ven todos.
create policy "Ver items de pedidos propios o admin"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Crear items autenticado"
  on public.order_items for insert
  with check (auth.uid() is not null);

-- ==============================================================================
-- 9. SUPABASE REALTIME
-- ==============================================================================
-- Habilitar publicaciones para que los cambios se transmitan en vivo
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end;
$$;

-- ==============================================================================
-- 10. DATOS DE DEMOSTRACIÓN (SEED DATA COMPLETO PARA MUESTRA ESCOLAR)
-- Todos los productos solicitados en el pliego con fotos optimizadas y precios ARS
-- ==============================================================================
insert into public.products (name, description, category, price, image_url, available, featured) values
  -- SÁNDWICHES
  ('Pebete de jamón y queso', 'Clásico pebete en pan suave de manteca, jamón cocido seleccionado y queso tybo fresco.', 'sandwiches', 2200.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', true, true),
  ('Pebete de pollo', 'Pebete relleno con pechuga de pollo desmenuzada, mayonesa suave, lechuga y tomate fresco.', 'sandwiches', 2500.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', true, true),
  ('Tostado de jamón y queso', 'Tostado caliente en pan de miga o blanco crocante, queso fundido y jamón.', 'sandwiches', 2400.00, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80', true, true),
  ('Sándwich de miga', 'Triángulos triples de jamón cocido y queso tybo fresco, súper esponjosos.', 'sandwiches', 2000.00, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80', true, false),

  -- COMIDAS
  ('Empanadas al horno', 'Empanadas caseras de carne cortada a cuchillo o jamón y queso, masa crocante.', 'comidas', 1400.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80', true, true),
  ('Porción de pizza', 'Muzzarella artesanal con salsa de tomate especial, orégano y aceituna verde.', 'comidas', 1800.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', true, true),
  ('Pancho clásico con lluvia de papas', 'Salchicha de primera marca en pan súper tierno, aderezos a elección y papas pay.', 'comidas', 1600.00, 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80', true, true),
  ('Tarta individual', 'Masa casera rellena de espinaca con queso cremoso o jamón, queso y huevo.', 'comidas', 2300.00, 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80', true, false),

  -- DULCES
  ('Alfajor triple de chocolate', 'Relleno con abundante dulce de leche repostero y baño de chocolate semiamargo.', 'dulces', 1300.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', true, true),
  ('Turrón crocante de maní', 'Turrón clásico de oblea relleno con pasta de maní crocante, ideal para el recreo.', 'dulces', 700.00, 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80', true, false),
  ('Galletitas dulces variadas', 'Paquete individual de galletitas rellenas de chocolate y vainilla.', 'dulces', 1100.00, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80', true, false),
  ('Budín casero con chips', 'Porción individual esponjosa de vainilla con abundantes chips de chocolate.', 'dulces', 1200.00, 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80', true, false),
  ('Barra de chocolate con leche', 'Tableta individual de chocolate con leche suave y crocantes de cereal.', 'dulces', 950.00, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80', true, true),

  -- BEBIDAS
  ('Agua mineral 500ml', 'Agua pura de manantial bien fría, con o sin gas.', 'bebidas', 1000.00, 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80', true, false),
  ('Jugo de naranja exprimido 300ml', 'Jugo 100% natural de naranjas frescas recién exprimidas, sin conservantes.', 'bebidas', 1500.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', true, true),
  ('Gaseosa línea Coca-Cola 500ml', 'Botella individual fría (Coca-Cola, Sprite o Fanta tradicional o Zero).', 'bebidas', 1600.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80', true, true),
  ('Leche chocolatada 200ml', 'Chocolatada en cartoncito individual fría, rica en calcio y energía.', 'bebidas', 1100.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', true, false)
on conflict do nothing;

