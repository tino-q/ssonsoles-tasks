App de Gestión de Limpiezas – Especificación Funcional y Roadmap
1. Introducción
Esta aplicación está diseñada para gestionar las limpiezas y el mantenimiento de 6 propiedades turísticas. Permitirá visualizar tareas en calendario, asignar personal, controlar productos de limpieza, registrar videos y tiempos, y generar reportes de horas trabajadas. El sistema se utilizará principalmente desde el móvil, y la información de reservas será cargada manualmente desde un Google Sheet.
2. Módulos funcionales
- Carga de tareas desde Sheet
Importación manual de reservas desde Google Sheets. Por cada check-out se genera una tarea automática. También se pueden ingresar tareas manuales.
- Calendario de tareas
Visualización tipo Google Calendar con eventos por día, filtros por propiedad/persona, y cambio de color según estado.
- Asignación de tareas y estados
Asignación de tareas con dropdown de personal. Estados: URGENTE (rojo), ESP OK (amarillo), CONFIR (verde), MAS (naranja), TENTATIVO (azul).
- Confirmación desde panel de limpiadora
Cada limpiadora puede aceptar, rechazar o proponer horario alternativo para su tarea asignada.
- Carga de datos de limpieza
Cada limpiadora puede registrar hora de ingreso/salida, subir videos, cargar comentarios.
- Control de productos
Listado sincronizado desde Sheet. Las limpiadoras marcan productos faltantes y cantidades.
- Reportes y pagos
Resumen mensual por persona: tareas, horas, viáticos, monto total. Exportación a Excel o Google Sheets.
- Accesos y roles
Usuario administrador (control total). Limpiadoras (acceso solo a sus tareas).
- Comunicación por WhatsApp
Generación automática de mensajes prellenados por WhatsApp al asignar tareas.
3. Roadmap de desarrollo
Tarea
Prioridad
Dependencia
Conexión a Google Sheets y carga de tareas
Alta
Independiente
Vista tipo calendario con asignación
Alta
Después de carga de tareas
Generación de mensaje de WhatsApp
Media
Después de asignación
Confirmación de tareas por parte de limpiadora
Alta
Después de asignación
Registro de limpieza (hora, video, comentarios)
Alta
Después de confirmación
Control de productos
Media
Después de registro de limpieza
Generación de reportes y exportación
Alta
Después de registro de limpieza

4. Prompts para desarrollo en Claude Code
TAREA 1 — Conexión a Google Sheets y carga de tareas
Crear un backend en Node.js o Python que se conecte a un Google Sheet para leer reservas manuales. Cada fila representa una reserva con:
- propiedad, fecha_checkin, fecha_checkout
Por cada fecha_checkout, generar una tarea de limpieza. Incluir también un formulario en frontend para cargar tareas manuales con:
- propiedad, tipo de tarea (limpieza / mantenimiento / sábanas), fecha, notas opcionales.
Requisitos:
- Acceso a Google Sheets usando OAuth o clave API.
- Guardar tareas en base de datos local (MongoDB o SQLite).
- Código modular y documentado para poder actualizar el Sheet o columnas fácilmente.
TAREA 2 — Vista tipo calendario con asignación de tareas
Crear una vista tipo Google Calendar (usando FullCalendar o similar) que muestre tareas por día. Cada evento debe permitir:
- Ver notas, tipo de tarea, propiedad.
- Dropdown para seleccionar limpiadora.
Requisitos:
- Mostrar eventos en rojo si no hay limpiadora asignada (URGENTE).
- Mostrar eventos en amarillo si hay limpiadora asignada (ESP OK).
- Al seleccionar limpiadora, actualizar estado visualmente sin recargar.
- Filtros por limpiadora o propiedad.
- Compatible con vista móvil.
TAREA 3 — Generar mensaje de WhatsApp con tarea asignada
Al asignar limpiadora a una tarea, generar un link https://wa.me/<número>?text=<mensaje> con este formato:
Hola [nombre], te comparto una limpieza asignada:
FECHA: 12/07
PISO: QDCHA
¿CHECK IN HOY?: SÍ
NOTAS: Revisar persiana rota
Requisitos:
- Que se pueda abrir con un botón desde el evento del calendario.
- El número se puede asociar desde una tabla de usuarios.
- No se envía automáticamente; solo se abre el link.
TAREA 4 — Confirmación de tareas por parte de la limpiadora
Agregar funcionalidad en el panel de usuario (limpiadora) para responder a tareas asignadas en estado ESP OK.
Opciones:
- ✅ Confirmar tarea → CONFIR / Verde
- ❌ Rechazar tarea → MAS / Naranja
- 🕒 Proponer otro horario → TENTATIVO / Azul (con horario sugerido)
Requisitos:
- El cambio de estado se refleja en tiempo real en el panel del admin.
- El admin puede ver el horario propuesto si aplica.
- Cada limpiadora solo puede responder sus tareas.
TAREA 5 — Registro de limpieza (hora, video, comentarios)
En el panel de limpiadora permitir:
- Registrar hora de ingreso y salida (con validación)
- Subir video de inicio y fin
- Cargar comentarios
Requisitos:
- Calcular duración automáticamente
- Comprimir videos si pesan más de 50MB
- Guardar enlaces de video
- Solo la limpiadora asignada puede completar esta info
TAREA 6 — Control de productos de limpieza
Agregar una sección para marcar productos faltantes:
- Sincronización desde Google Sheet (solo lectura)
- Selección de productos y cantidad faltante
Requisitos:
- Guardar la solicitud por tarea y persona
- Vista de admin con reporte de productos solicitados
TAREA 7 — Generación de reportes mensuales y exportación
Crear un resumen mensual por limpiadora con:
- Tareas realizadas
- Horas totales (calculadas)
- Viáticos (editables)
- Total a pagar = horas x tarifa + viáticos
Requisitos:
- Editable desde admin
- Exportable a Excel o Google Sheets
- Filtros por mes, persona, propiedad

