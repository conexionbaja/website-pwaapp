# Conexión Baja — Documentación del Proyecto (Español)

---

## 1. Resumen de Fases

### Fase A — Base del Sistema
- Sistema de autenticación con correo/contraseña y Google OAuth
- Páginas de registro e inicio de sesión
- Rutas basadas en roles (admin, usuario, chofer, gerente logístico, ejecutivo)
- Soporte bilingüe (Español/Inglés) mediante LanguageContext
- Encabezado con navegación responsiva y selector de idioma
- Pie de página con suscripción a boletín y enlaces a redes sociales
- Sistema de diseño con tema oscuro
- Botón flotante de WhatsApp para atención al cliente

### Fase B — Esquema de Base de Datos
- Esquema completo con políticas de seguridad (RLS) para todas las tablas:
  - `shipments` — rastreo, estado, asignación de chofer/camión
  - `shipment_pallets` — detalles de carga por tarima con posicionamiento por ruta
  - `shipment_status_log` — historial completo de cambios de estado
  - `drivers` — registros de choferes con estado de disponibilidad
  - `trucks` — gestión de flota con seguimiento de mantenimiento
  - `invoices` — facturación con múltiples estados de pago
  - `quote_requests` — flujo de cotizaciones con precio y vigencia
  - `blog_posts` — contenido de blog/noticias bilingüe
  - `services` — listado de servicios con imágenes
  - `cms_pages` — contenido CMS flexible por slug/sección
  - `newsletter_subscribers` — gestión de lista de correo
  - `newsletter_emails` — borradores y envíos de boletín
  - `contact_messages` — mensajes del formulario de contacto
  - `user_roles` — control de acceso basado en roles
  - `profiles` — datos de perfil de usuario

### Fase C — Panel de Administración (CMS)
- Panel de administración con 12 pestañas y CRUD completo:
  - Páginas, Blog/Noticias, Servicios, Solicitudes de Cotización, Mensajes de Contacto
  - Envíos (con gestión de tarimas), Choferes, Camiones
  - Facturas, Reportes/Analítica, Boletín, Suscriptores

### Fase D — Páginas Públicas
- Página de Servicios (impulsada por CMS, bilingüe)
- Listado de Blog + páginas individuales con renderizado HTML
- Página de Nosotros (impulsada por CMS)
- Formulario de cotización con selección de ciudades (7 ciudades de Baja California)
- Formulario de envío con tipos de paquete y dimensiones

### Fase E — Portales por Rol
- **Portal del Cliente**: cotizaciones, envíos con tarimas/historial de estado, facturas, gestión de perfil, cambio de contraseña, toggle de boletín
- **Portal del Chofer**: estado de disponibilidad, envíos asignados, actualizaciones de estado/ubicación/notas, vista de tarimas, historial de estado
- **Panel Ejecutivo**: tarjetas KPI (envíos activos, ingresos, utilización de flota, cotizaciones pendientes), gráfica de ingresos, gráfica de estados de envío, actividad reciente, resumen de disponibilidad de choferes

### Fase F — Contacto e Integración
- Formulario de contacto conectado a base de datos con notificación al admin
- Pestaña de Mensajes de Contacto en admin con flujo leído/respondido
- Formulario de cotización mejorado con selección de ciudades
- Enlace al Portal en el encabezado para usuarios regulares
- Función edge `send-contact-notification`

### Fase G — Logística y Operaciones
- **Portal de Gerente Logístico**: todos los envíos con actualizaciones de estado, vista de camiones, vista de choferes
- Navegación basada en roles en el encabezado (enlaces de admin, chofer, logística, ejecutivo)
- Año dinámico en el pie de página
- Función edge para notificaciones de contacto

### Fase H — SEO, Imágenes, Tiempo Real
- Componente `PageMeta` para título/descripción SEO dinámica en todas las páginas públicas
- Componente `ImageUpload` para admin (arrastrar y soltar a almacenamiento en la nube)
- Bucket de almacenamiento `public-images` con políticas de seguridad
- Actualizaciones de rastreo en tiempo real en `/rastreo` (cambios de estado en vivo)
- Actualizaciones de envío en tiempo real en el Portal del cliente
- Contenido CMS opcional para la página principal con respaldo de traducciones

---

## 2. Lista de Verificación No Técnica

> Elementos a completar por un miembro del equipo no técnico antes del lanzamiento.

### Cuentas de Usuario a Crear
- [ ] **Usuario Admin**: Registrar una cuenta y asignar rol `admin` mediante el backend
- [ ] **Usuario Chofer**: Registrar una cuenta, crear un registro de chofer con el ID del usuario, asignar rol `driver`
- [ ] **Gerente Logístico**: Registrar una cuenta, asignar rol `logistics_manager`
- [ ] **Usuario Ejecutivo**: Registrar una cuenta, asignar rol `executive`
- [ ] **Cuenta de prueba de cliente**: Registrar un usuario regular para probar el portal

### Información del Negocio a Proporcionar
- [ ] **Número de WhatsApp**: Reemplazar el número de ejemplo (`5216641234567`) en `src/components/WhatsAppButton.tsx` con el número real de WhatsApp Business
- [ ] **Datos de contacto**: Actualizar dirección, teléfono y correo real en la página de Contacto
- [ ] **Enlaces de redes sociales**: Actualizar URLs de Instagram y WhatsApp en `src/components/Footer.tsx`
- [ ] **Redirect de Google OAuth**: Configurar la URI de redirección correcta para tu dominio de producción

### Contenido a Crear (vía Admin CMS)
- [ ] **Nosotros**: Crear contenido con slug=`about`, section_key=`main` — una versión en español y otra en inglés
- [ ] **Servicios**: Crear al menos 2–3 servicios con descripciones e imágenes (versiones ES + EN)
- [ ] **Publicaciones de Blog**: Crear al menos 1–2 publicaciones (ES + EN)
- [ ] **Página principal (opcional)**: Crear contenido CMS con slug=`home` y section_keys: `hero`, `how_it_works`, `why_choose`, `cta`

### Precios y Reglas de Negocio
- [ ] Definir tarifas de envío por ruta y peso
- [ ] Establecer información de precios para cada listado de servicio
- [ ] Definir métodos de pago aceptados y términos

### Cuentas de Terceros
- [ ] **Servicio de correo**: Configurar SendGrid, Resend o similar para envío real de correos (actualmente solo registra en consola)
- [ ] **Google OAuth**: Configurar credenciales en los ajustes del proveedor de autenticación
- [ ] **Dominio personalizado** (opcional): Configurar en Ajustes → Dominios del proyecto

### Configuración de Flota
- [ ] Agregar todos los camiones vía Admin → Camiones (placa, modelo, capacidad, VIN)
- [ ] Agregar todos los choferes vía Admin → Choferes (nombre, teléfono, número de licencia)
- [ ] Asignar choferes a camiones
- [ ] Establecer estados iniciales de disponibilidad para choferes

---

## 3. Elementos de Desarrollo Pendientes

### Marcadores de Posición y Datos de Ejemplo
| Elemento | Estado Actual | Qué Se Necesita |
|----------|--------------|-----------------|
| Correos de notificación de contacto | La función edge solo registra en consola | Integrar API de SendGrid/Resend |
| Envío de boletín | Se marca como "enviado" pero no envía | Integrar servicio de correo |
| Procesamiento de pagos | Sin integración | Agregar Stripe o Mercado Pago |
| Motor de precios | Solo cotizaciones manuales | Cálculo automático por ruta/peso |
| Facturas PDF | El campo `pdf_url` existe, sin generación | Librería o servicio de generación de PDF |
| Datos de ingresos en reportes | Depende de montos ingresados manualmente | Integración contable |
| Número de WhatsApp | Marcador `5216641234567` | Número real de negocio |
| Info de contacto | Dirección/teléfono/correo de ejemplo | Datos reales del negocio |
| Enlaces de redes sociales | URLs genéricas | Enlaces reales de redes sociales |
| Flujo de recuperación de contraseña | No implementado | Recuperación por correo electrónico |
| Recordatorio de verificación de correo | No implementado | Opción de reenviar correo de verificación |

### Almacenamiento
- El bucket `public-images` está creado pero necesita pruebas con archivos reales
- Sin validación de tamaño de archivo del lado del servidor (solo del lado del cliente a 5MB)

---

## 4. Plan de Pruebas QA (Paso a Paso)

### 4.1 Páginas Públicas (Sin Inicio de Sesión)
1. Visitar la página principal (`/`) — verificar que las secciones hero, cómo funciona, por qué elegirnos y CTA se rendericen correctamente
2. Cambiar idioma EN↔ES — verificar que TODO el texto visible cambie
3. Visitar `/servicios` — verificar que los servicios se carguen desde la base de datos (o mostrar estado vacío)
4. Visitar `/blog` — verificar que las publicaciones se carguen (o estado vacío)
5. Visitar `/contacto` — llenar formulario y enviar — verificar notificación de éxito; revisar la pestaña de Mensajes de Contacto en admin
6. Visitar `/cotizar` — llenar formulario de cotización y enviar — verificar mensaje de éxito
7. Visitar `/rastreo` — ingresar número de rastreo inválido — verificar mensaje "no encontrado"
8. Visitar `/nosotros` — verificar que el contenido CMS se cargue
9. Hacer clic en botón de WhatsApp — verificar que abra la URL correcta
10. En el pie de página, suscribirse al boletín — ingresar correo, verificar notificación de éxito
11. Revisar el título de la pestaña del navegador en cada página (SEO PageMeta)
12. Probar en vista móvil — verificar menú hamburguesa, diseño responsivo

### 4.2 Autenticación
13. Registrar nueva cuenta con correo/contraseña
14. Revisar correo para enlace de confirmación (si la auto-confirmación está desactivada)
15. Iniciar sesión con correo/contraseña
16. Iniciar sesión con Google OAuth
17. Verificar redirección: usuario regular → `/portal`, admin → `/admin`, chofer → `/driver`, etc.
18. Cerrar sesión — verificar redirección a la página principal

### 4.3 Portal del Cliente (`/portal`)
19. Iniciar sesión como usuario regular
20. **Pestaña Cotizaciones**: Enviar una cotización vía `/cotizar` primero, luego verificar que aparezca aquí
21. **Pestaña Envíos**: Verificar que los envíos aparezcan (el admin debe crear uno para este usuario primero)
22. Expandir un envío — verificar que se carguen tarimas e historial de estado
23. **Pestaña Facturas**: Verificar que las facturas aparezcan
24. **Pestaña Perfil**: Actualizar nombre/teléfono, guardar, refrescar, verificar que los datos persistan
25. Cambiar contraseña — verificar que funcione
26. Activar/desactivar suscripción al boletín

### 4.4 Panel de Administración (`/admin`)
27. Iniciar sesión como usuario admin
28. **Pestaña Páginas**: Crear/editar una página CMS con carga de imagen
29. **Pestaña Blog**: Crear una nueva publicación con imagen, marcar como publicada
30. **Pestaña Servicios**: Crear un servicio con imagen
31. **Pestaña Cotizaciones**: Ver cotizaciones enviadas, actualizar estado/precio, convertir a envío/factura
32. **Pestaña Mensajes**: Ver mensajes, marcar como leído/respondido
33. **Pestaña Envíos**: Crear un envío, asignar chofer/camión, agregar tarimas
34. Actualizar estado del envío — verificar que se cree una entrada en el historial
35. **Pestaña Choferes**: Agregar/editar un chofer
36. **Pestaña Camiones**: Agregar/editar un camión, asignar un chofer
37. **Pestaña Facturas**: Crear una factura para un envío
38. **Pestaña Reportes**: Verificar que las tarjetas KPI y gráficas se rendericen con datos
39. **Pestaña Boletín**: Componer y "enviar" un boletín
40. **Pestaña Suscriptores**: Ver lista de suscriptores, exportar CSV

### 4.5 Portal del Chofer (`/driver`)
41. Iniciar sesión como usuario chofer
42. Verificar que el encabezado del chofer muestre nombre y botones de disponibilidad
43. Cambiar estado de disponibilidad (Disponible / No Disponible / En Ruta)
44. Ver envíos asignados (el admin debe asignar primero)
45. Actualizar estado del envío, ubicación y notas
46. Verificar que la entrada del historial de estado aparezca

### 4.6 Portal Logístico (`/logistics`)
47. Iniciar sesión como gerente logístico
48. **Pestaña Envíos**: Verificar que todos los envíos sean visibles; actualizar estado de un envío con notas
49. **Pestaña Camiones**: Verificar lista de camiones (solo lectura)
50. **Pestaña Choferes**: Verificar lista de choferes (solo lectura)

### 4.7 Panel Ejecutivo (`/executive`)
51. Iniciar sesión como usuario ejecutivo
52. Verificar que las tarjetas KPI se muestren correctamente
53. Verificar que la gráfica de ingresos y la gráfica circular de estados se rendericen

### 4.8 Tiempo Real
54. Abrir `/rastreo` con un número de rastreo válido
55. En otro navegador/pestaña, actualizar el estado de ese envío desde el panel de admin
56. Verificar que la página de rastreo se actualice automáticamente (sin refrescar)
57. Repetir con el Portal del cliente — verificar que el estado del envío se actualice en vivo

### 4.9 Navegadores Cruzados y Móvil
58. Probar en Chrome, Firefox, Safari
59. Probar vista móvil en páginas clave (Inicio, Enviar, Rastreo, Portal)
60. Verificar que el cambio de idioma funcione en todas las páginas probadas

---

## 5. Resumen de Marketing

### Conexión Baja: La Forma Inteligente de Enviar por Baja California

Conexión Baja es una **plataforma de logística moderna e integral** diseñada para la península de Baja California. Construida para velocidad, transparencia y control operativo total, empodera a negocios e individuos para **enviar, rastrear y gestionar envíos** con total confianza.

🚀 **Reserva Instantánea de Envíos** — Solicita recolecciones y entregas en 7 ciudades principales desde Tijuana hasta Cabo San Lucas con solo unos clics.

📍 **Rastreo en Tiempo Real** — Sigue tus paquetes en vivo con actualizaciones automáticas de estado, desde la recolección hasta la entrega. Sin necesidad de refrescar.

👥 **Paneles Multi-Rol** — Portales diseñados a la medida para clientes, choferes, gerentes logísticos y ejecutivos — cada uno con herramientas específicas y datos en vivo.

🌐 **Completamente Bilingüe** — Disponible en español e inglés, sirviendo a la diversa comunidad de Baja California.

📝 **CMS Integrado** — Gestiona publicaciones de blog, servicios y contenido de páginas sin tocar una sola línea de código.

🔔 **Notificaciones Inteligentes** — Alertas instantáneas para nuevas cotizaciones, solicitudes de contacto y actualizaciones de envío.

🔒 **Seguridad Empresarial** — Inicio de sesión por correo, contraseña y Google con control de acceso basado en roles y protección de datos a nivel de fila.

📊 **Inteligencia Ejecutiva** — Paneles KPI con tendencias de ingresos, utilización de flota e información operativa en tiempo real.

📸 **Gestión de Imágenes** — Carga de imágenes con arrastrar y soltar para blog, servicios y páginas.

📰 **Motor de Boletín** — Gestión de suscriptores y composición de correos integrada.

💬 **Integración con WhatsApp** — Soporte al cliente con un solo toque vía WhatsApp Business.

📱 **Diseño Mobile-First** — Interfaz responsiva con tema oscuro optimizada para cualquier dispositivo.

---

## 6. Recomendaciones de Funcionalidades Futuras

| # | Funcionalidad | Descripción |
|---|---------------|-------------|
| 1 | **Integración de Pagos** | Aceptar pagos en línea vía Stripe o Mercado Pago |
| 2 | **Motor de Precios Automático** | Calcular cotizaciones automáticamente por ruta, peso y tipo de paquete |
| 3 | **Generación de Facturas PDF** | Auto-generar facturas descargables en PDF |
| 4 | **Notificaciones Push** | Notificaciones push del navegador para cambios de estado de envío |
| 5 | **Integración de Servicio de Correo** | Conectar SendGrid/Resend para notificaciones y boletines reales |
| 6 | **PWA para Choferes** | App Web Progresiva con soporte offline para instalar en pantalla de inicio |
| 7 | **Optimización de Rutas** | Sugerir rutas óptimas de entrega basadas en múltiples paradas |
| 8 | **Calificaciones de Clientes** | Permitir que los clientes califiquen su experiencia de entrega |
| 9 | **Escaneo de Código de Barras/QR** | Escanear códigos de rastreo para búsquedas rápidas |
| 10 | **Soporte Multi-Inquilino** | Permitir a clientes empresariales gestionar sub-cuentas |
| 11 | **Seguro de Envío** | Complemento opcional de seguro para paquetes de alto valor |
| 12 | **Exportación de Analítica** | Exportación CSV/PDF de reportes y datos de envíos |
| 13 | **Flujo de Contraseña Olvidada** | Recuperación de contraseña vía enlace por correo |
| 14 | **Bot de WhatsApp** | Actualizaciones automáticas de rastreo vía WhatsApp Business API |

---

*Documento generado: Febrero 2026*
*Plataforma: Conexión Baja Envíos PWA*
