import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Recursos de traducción
const resources = {
  en: {
    translation: {
      // App General
      "app.title": "Cleaning Tasks!!!",
      "app.welcome": "Welcome, {{name}}",
      "app.logout": "Logout",
      
      // Login
      "login.title": "Cleaner Login",
      "login.phone": "Phone Number:",
      "login.button": "Login",
      "login.error.notFound": "Phone number not found or inactive",
      "login.error.failed": "Login failed. Please try again.",
      "login.error.loadCleaners": "Failed to load cleaners data",
      
      // Loading Messages
      "loading.default": "Loading...",
      "loading.credentials": "Verifying credentials...",
      "loading.tasks": "Loading tasks...",
      "loading.refreshing": "Refreshing tasks...",
      "loading.updateTask": "Updating task status...",
      "loading.rejecting": "Rejecting task...",
      "loading.creating": "Creating proposal...",
      "loading.comments": "Loading comments...",
      "loading.sending": "Sending comment...",
      "loading.products": "Loading products...",
      "loading.starting": "Starting task...",
      "loading.finishing": "Finishing task...",
      "loading.completing": "Completing task...",
      "loading.saving": "Saving comments...",
      "loading.logging": "Logging product usage...",
      
      // Task Panel
      "tasks.title": "Your Tasks",
      "tasks.noTasks": "No tasks assigned",
      "tasks.all": "All ({{count}})",
      "tasks.tryAgain": "Try Again",
      "tasks.unableToLoad": "Unable to load tasks.",
      "tasks.error.load": "Failed to load tasks. Please try again.",
      "tasks.error.refresh": "Failed to refresh tasks. Please try again.",
      "tasks.error.update": "Failed to update task. Please try again.",
      
      // Task Status
      "status.urgente": "Urgent - Not Assigned",
      "status.espOk": "Awaiting Response",
      "status.confir": "Confirmed",
      "status.rejected": "Rejected",
      "status.tentativo": "Alternative Time Proposed",
      
      // Task Actions
      "task.respond": "Respond to Task",
      "task.confirm": "✅ Confirm",
      "task.reject": "❌ Reject",
      "task.propose": "🕒 Propose Time",
      "task.cancel": "Cancel",
      "task.begin": "📋 Begin Task",
      "task.comments": "💬 View Comments",
      "task.type.cleaning": "Cleaning",
      
      // Task Response Form
      "response.comments": "Comments (optional):",
      "response.commentsPlaceholder": "Any additional comments...",
      "response.suggestTime": "Suggest alternative time (optional):",
      "response.rejected": "Task rejected",
      "response.alternativeTime": "Alternative time proposed",
      
      // Comments
      "comments.title": "💬 Task Comments",
      "comments.noComments": "No comments yet",
      "comments.placeholder": "Write a comment...",
      "comments.send": "Send",
      "comments.sending": "Sending...",
      "comments.type.initial": "Initial Note",
      "comments.type.confirmation": "Confirmation",
      "comments.type.rejection": "Rejection",
      "comments.type.proposal": "Proposal",
      "comments.type.general": "Comment",
      "comments.user": "User ID: {{id}}",
      
      // Task Execution
      "execution.back": "← Back",
      "execution.phase.start": "Ready to Start",
      "execution.phase.progress": "In Progress",
      "execution.phase.end": "Task Completed",
      "execution.start": "Start Task",
      "execution.finish": "Finish Task",
      "execution.complete": "Complete Task",
      "execution.startTime": "Start Time:",
      "execution.endTime": "End Time:",
      "execution.duration": "Duration:",
      "execution.comments": "Final Comments:",
      "execution.commentsPlaceholder": "Add any final comments about the task...",
      "execution.products": "Products Used:",
      "execution.productsError": "Failed to load products",
      "execution.productsNone": "No products available",
      "execution.productQuantity": "Quantity:",
      "execution.error.complete": "Failed to complete task:",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.add": "Add",
      "common.remove": "Remove",
      "common.close": "Close",
      "common.refresh": "Refresh",
      "common.back": "Back",
      "common.next": "Next",
      "common.previous": "Previous",
      "common.yes": "Yes",
      "common.no": "No",
      
      // Session
      "session.restored": "Session restored",
      "session.expired": "Session expired, please login again",
      "session.welcome": "Welcome back, {{name}}!"
    }
  },
  es: {
    translation: {
      // App General
      "app.title": "Tareas de Limpieza!!!",
      "app.welcome": "Bienvenido, {{name}}",
      "app.logout": "Cerrar Sesión",
      
      // Login
      "login.title": "Ingreso de Limpiador",
      "login.phone": "Número de Teléfono:",
      "login.button": "Ingresar",
      "login.error.notFound": "Número de teléfono no encontrado o inactivo",
      "login.error.failed": "Error de ingreso. Por favor intente nuevamente.",
      "login.error.loadCleaners": "Error al cargar datos de limpiadores",
      
      // Loading Messages
      "loading.default": "Cargando...",
      "loading.credentials": "Verificando credenciales...",
      "loading.tasks": "Cargando tareas...",
      "loading.refreshing": "Actualizando tareas...",
      "loading.updateTask": "Actualizando estado de tarea...",
      "loading.rejecting": "Rechazando tarea...",
      "loading.creating": "Creando propuesta...",
      "loading.comments": "Cargando comentarios...",
      "loading.sending": "Enviando comentario...",
      "loading.products": "Cargando productos...",
      "loading.starting": "Iniciando tarea...",
      "loading.finishing": "Finalizando tarea...",
      "loading.completing": "Completando tarea...",
      "loading.saving": "Guardando comentarios...",
      "loading.logging": "Registrando uso de productos...",
      
      // Task Panel
      "tasks.title": "Tus Tareas",
      "tasks.noTasks": "No hay tareas asignadas",
      "tasks.all": "Todas ({{count}})",
      "tasks.tryAgain": "Intentar Nuevamente",
      "tasks.unableToLoad": "No se pudieron cargar las tareas.",
      "tasks.error.load": "Error al cargar tareas. Por favor intente nuevamente.",
      "tasks.error.refresh": "Error al actualizar tareas. Por favor intente nuevamente.",
      "tasks.error.update": "Error al actualizar tarea. Por favor intente nuevamente.",
      
      // Task Status
      "status.urgente": "Urgente - Sin Asignar",
      "status.espOk": "Esperando Confirmación",
      "status.confir": "Confirmado",
      "status.rejected": "Rechazado",
      "status.tentativo": "Horario Alternativo Propuesto",
      
      // Task Actions
      "task.respond": "Responder a Tarea",
      "task.confirm": "✅ Confirmar",
      "task.reject": "❌ Rechazar",
      "task.propose": "🕒 Proponer Horario",
      "task.cancel": "Cancelar",
      "task.begin": "📋 Comenzar Tarea",
      "task.comments": "💬 Ver Comentarios",
      "task.type.cleaning": "Limpieza",
      
      // Task Response Form
      "response.comments": "Comentarios (opcional):",
      "response.commentsPlaceholder": "Comentarios adicionales...",
      "response.suggestTime": "Sugerir horario alternativo (opcional):",
      "response.rejected": "Tarea rechazada",
      "response.alternativeTime": "Horario alternativo propuesto",
      
      // Comments
      "comments.title": "💬 Comentarios de la Tarea",
      "comments.noComments": "No hay comentarios todavía",
      "comments.placeholder": "Escribe un comentario...",
      "comments.send": "Enviar",
      "comments.sending": "Enviando...",
      "comments.type.initial": "Nota Inicial",
      "comments.type.confirmation": "Confirmación",
      "comments.type.rejection": "Rechazo",
      "comments.type.proposal": "Propuesta",
      "comments.type.general": "Comentario",
      "comments.user": "Usuario ID: {{id}}",
      
      // Task Execution
      "execution.back": "← Atrás",
      "execution.phase.start": "Listo para Comenzar",
      "execution.phase.progress": "En Progreso",
      "execution.phase.end": "Tarea Completada",
      "execution.start": "Iniciar Tarea",
      "execution.finish": "Terminar Tarea",
      "execution.complete": "Completar Tarea",
      "execution.startTime": "Hora de Inicio:",
      "execution.endTime": "Hora de Fin:",
      "execution.duration": "Duración:",
      "execution.comments": "Comentarios Finales:",
      "execution.commentsPlaceholder": "Agregar comentarios finales sobre la tarea...",
      "execution.products": "Productos Utilizados:",
      "execution.productsError": "Error al cargar productos",
      "execution.productsNone": "No hay productos disponibles",
      "execution.productQuantity": "Cantidad:",
      "execution.error.complete": "Error al completar tarea:",
      
      // Common
      "common.loading": "Cargando...",
      "common.error": "Error",
      "common.success": "Éxito",
      "common.cancel": "Cancelar",
      "common.save": "Guardar",
      "common.delete": "Eliminar",
      "common.edit": "Editar",
      "common.add": "Agregar",
      "common.remove": "Quitar",
      "common.close": "Cerrar",
      "common.refresh": "Actualizar",
      "common.back": "Atrás",
      "common.next": "Siguiente",
      "common.previous": "Anterior",
      "common.yes": "Sí",
      "common.no": "No",
      
      // Session
      "session.restored": "Sesión restaurada",
      "session.expired": "Sesión expirada, por favor inicie sesión nuevamente",
      "session.welcome": "¡Bienvenido de nuevo, {{name}}!"
    }
  }
};

// Función para obtener idioma guardado
const getStoredLanguage = () => {
  try {
    return localStorage.getItem('cleaningApp.language') || 'es';
  } catch (error) {
    return 'es';
  }
};

// Función para guardar idioma
const saveLanguage = (lng) => {
  try {
    localStorage.setItem('cleaningApp.language', lng);
  } catch (error) {
    console.error('Error saving language to localStorage:', error);
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getStoredLanguage(), // idioma guardado o por defecto
    fallbackLng: 'en', // idioma de respaldo
    
    interpolation: {
      escapeValue: false // react already does escaping
    },
    
    debug: false // cambiar a true para debug
  });

// Escuchar cambios de idioma y guardarlos
i18n.on('languageChanged', (lng) => {
  saveLanguage(lng);
});

export default i18n;