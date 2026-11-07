# 🏆 GUÍA DE DEFENSA ANTE EL JURADO — KIOSCO10
### *"Tu recreo, sin filas"*

Esta guía está diseñada para que puedas exponer y defender el proyecto **Kiosco10** frente al jurado docente, directivos escolares y compañeros con total solvencia, seguridad y claridad técnica.

---

## ⏱️ 1. Pitch de Apertura (Discurso de 30 Segundos)

> *"Buenos días, señores del jurado. En nuestro colegio, el recreo dura solo 15 minutos. Pero más de la mitad de ese tiempo se pierde haciendo una fila interminable en el buffet. Muchos alumnos se quedan sin comer o tienen que tragar a las apuradas antes de que suene el timbre.*
>
> *Para resolver este problema creamos **Kiosco10**, una aplicación web progresiva que permite a los alumnos y profesores encargar su comida con anticipación y retirarla en segundos por una fila rápida.*
>
> *Con Kiosco10, el buffet organiza sus pedidos con antelación, y los estudiantes recuperan su recreo."*

---

## 🎯 2. El Problema Real y la Solución

| Situación Tradicional (Sin Kiosco10) | Con Kiosco10 |
| :--- | :--- |
| **Pérdida de tiempo:** 10 de los 15 minutos del recreo se van en la fila. | **Retiro exprés:** El pedido se retira en 15 segundos mostrando un código único. |
| **Aglomeraciones y caos:** 200 alumnos amontonados frente a la ventanilla. | **Flujo ordenado:** Los pedidos ya están preparados en bandejas numeradas. |
| **Falta de stock inesperada:** El alumno hace la fila y al llegar le dicen *"se terminaron las empanadas"*. | **Disponibilidad en vivo:** Si un producto se agota, la app lo muestra antes de pedir. |
| **Errores de cobro y cambios:** El kiosquero atiende, prepara y cobra al mismo tiempo. | **Precisión total:** Los totales vienen calculados y validados por el sistema. |

---

## 🎬 3. Guion de Demostración en Vivo (Paso a Paso)

Para la muestra escolar, se recomienda tener abierta la aplicación en **dos dispositivos** (o dos pestañas del navegador en pantalla dividida):
- **Pestaña Izquierda:** Alumno (Santiago Benítez - 4° Año A).
- **Pestaña Derecha:** Kiosquero (Don Roberto - Administrador).

### Paso 1: Experiencia del Alumno (1 minuto)
1. Mostrá la pantalla principal:
   - *"Noten la estética moderna inspirada en apps profesionales de delivery, con los colores de la institución: negro, amarillo y blanco."*
   - Demostrá el buscador escribiendo *"pebete"* o *"pizza"*.
   - Mostrá cómo los filtros por categorías (*Sándwiches, Comidas, Dulces, Bebidas*) responden de forma instantánea.
2. Agregá 2 productos al carrito (ejemplo: *Pebete de jamón y queso* + *Jugo de naranja natural*).
3. Abrí el carrito lateral:
   - Mostrá cómo se ajustan las cantidades (+/-) y se calcula el total automáticamente.
   - Seleccioná el horario: **"1° Recreo (09:40 - 09:55)"**.
   - Agregá una nota opcional: *"Por favor con mayonesa aparte"*.
4. Hacé clic en **"Confirmar Pedido"**:
   - Se dispara la animación festiva de confetti.
   - Se genera el código único de retiro (ejemplo: `#K10-4821`).
   - Se visualiza el **stepper de 4 estados** (Pendiente ➔ Preparando ➔ Listo ➔ Entregado).

### Paso 2: Experiencia del Kiosquero en Tiempo Real (1 minuto)
1. Al momento de confirmar el pedido, señalá la pestaña del Kiosquero:
   - **¡Sonará la campana escolar!** (mediante la Web Audio API nativa).
   - El pedido aparecerá en la parte superior sin tener que recargar la página.
   - El kiosquero ve: **Nombre del alumno, Curso (4° A), Recreo de retiro, productos solicitados y la nota especial**.
2. Mostrá el control de operaciones:
   - El kiosquero presiona **"👨‍🍳 Empezar a Preparar"** ➔ El estado cambia a *En preparación*.
   - Cuando el pedido está listo en la bandeja, el kiosquero presiona **"🔔 Marcar LISTO p/ Retirar"**.
3. Mirá de nuevo la pantalla del alumno:
   - El alumno recibe en vivo una tarjeta verde brillante: **"¡TU PEDIDO ESTÁ LISTO PARA RETIRAR! Pasá por la fila rápida"**.
4. El kiosquero presiona **"✅ Entregar y Cobrar"** y el pedido pasa al historial completado, actualizando las métricas de recaudación diaria.

### Paso 3: Flexibilidad Administrativa (30 segundos)
1. Hacé clic en **"🏷️ Editar Precios y Stock"** en el panel del kiosquero:
   - Cambiá el precio de un alfajor o marcá las *Empanadas* como *"Agotado"*.
   - Mostrá en el menú del alumno cómo el botón pasa inmediatamente a *"Agotado"* y se deshabilita para evitar ventas de mercadería inexistente.

---

## 💻 4. Pilares Técnicos para Destacar

Si el jurado tiene perfil técnico o docente de informática, destacá estos 5 puntos:

1. **Arquitectura Serverless y PostgreSQL (Supabase):**
   - No es una simple maqueta: utiliza una base de datos relacional PostgreSQL con tablas normalizadas (`profiles`, `products`, `orders`, `order_items`).
2. **Seguridad Antifraude (Server-Side Price Validation):**
   - *"Un problema común en proyectos de estudiantes es que el navegador calcula el total y lo manda a la base de datos, permitiendo que alguien altere el precio con F12. En Kiosco10 implementamos una función segura en PostgreSQL (`create_secure_order`) con `SECURITY DEFINER` que consulta los precios oficiales en el servidor y rechaza cualquier intento de manipulación."*
3. **Políticas de Seguridad RLS (Row Level Security):**
   - Cada alumno solo tiene permiso para consultar sus propios pedidos. Solo los usuarios con rol `admin` tienen acceso a la totalidad de los despachos.
4. **PWA (Progressive Web App):**
   - Se puede instalar directamente en Android, iOS y computadoras sin intermediarios ni costos de publicación en tiendas de aplicaciones.
   - Cuenta con Service Worker y caché estática para abrir instantáneamente.
5. **Web Audio API:**
   - La campana escolar de alerta no depende de archivos de audio externos que puedan fallar por falta de red; es un sintetizador acústico generado matemáticamente en el navegador.

---

## ❓ 5. Preguntas Frecuentes del Jurado y Respuestas Clave

### P1: *"¿Por qué no hacen esto simplemente con un grupo de WhatsApp?"*
> **Respuesta:** *"WhatsApp genera confusión masiva: mensajes perdidos, pedidos duplicados, necesidad de anotar en un cuaderno, falta de cálculo automático de dinero y ninguna integración con stock. Kiosco10 centraliza todo en una pantalla profesional con métricas exactas, control de stock y número de retiro único sin sobrecargar el celular de nadie."*

### P2: *"¿Qué sucede si un alumno no tiene internet o se caen los datos?"*
> **Respuesta:** *"Kiosco10 es una PWA con Service Worker. La interfaz abre siempre, incluso sin conexión. Si no hay internet, la aplicación detecta el estado offline y le advierte claramente al alumno que los pedidos requieren conexión para sincronizarse con la cocina, impidiendo que el alumno crea falsamente que su pedido fue recibido cuando en realidad no llegó."*

### P3: *"¿Cómo pagan los alumnos el pedido?"*
> **Respuesta:** *"El sistema está pensado para la realidad de las escuelas secundarias: el pedido se encarga por adelantado y se abona al momento del retiro en la fila rápida, aceptando tanto efectivo con cambio justo como Mercado Pago / QR en ventanilla, reduciendo el tiempo de transacción a pocos segundos."*

### P4: *"¿Se puede instalar en iPhones?"*
> **Respuesta:** *"Sí, cumple con el estándar de Apple para PWAs. Con solo pulsar 'Compartir' y 'Agregar a pantalla de inicio' en Safari, se instala como una app nativa con ícono propio y sin barra de direcciones."*

### P5: *"¿Qué costo de mantenimiento tiene para la escuela?"*
> **Respuesta:** *"Cero pesos. La aplicación está alojada en el plan gratuito de Vercel y utiliza el nivel libre de Supabase, que soporta hasta 500 MB de base de datos y 50.000 usuarios activos mensuales, más que suficiente para toda la comunidad educativa."*

---

## 🏁 6. Conclusión de Cierre

> *"Kiosco10 demuestra cómo la tecnología bien aplicada puede resolver una molestia diaria que todos sufrimos en la escuela. Es una herramienta real, segura, atractiva y lista para implementarse desde el próximo lunes en nuestro buffet. Muchas gracias."*

