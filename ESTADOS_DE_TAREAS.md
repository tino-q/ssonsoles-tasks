# 📊 ESTADOS DE TAREAS - DOCUMENTACIÓN COMPLETA

## 🎯 **ESTADOS IMPLEMENTADOS**

Basados en REQUERIMIENTOS.md con arquitectura event sourced.

**Estado**    | **Descripción**                          | **Color**   | **Implementado** | **Event Sourced**
------------- | ---------------------------------------- | ----------- | ---------------- | ------------------------------
**URGENTE**   | Sin limpiadora asignada                  | 🔴 Rojo     | ✅                | ✅ Snapshots automáticos
**ESP_OK**    | Limpiadora asignada, esperando respuesta | 🟡 Amarillo | ✅                | ✅ Snapshots automáticos
**CONFIR**    | Confirmada por limpiadora                | 🟢 Verde    | ✅                | ✅ Snapshots automáticos
**REJECTED**  | Rechazada por limpiadora                 | 🟠 Naranja  | ✅                | ✅ Snapshots + RejectionService
**TENTATIVO** | Propone horario alternativo              | 🔵 Azul     | ✅                | ✅ Snapshots + ProposalService
**COMPLETED** | Finalizada con videos y comentarios      | 🟣 Morado   | ✅                | ✅ Snapshots automáticos

## 🔄 **DIAGRAMA DE FLUJO**

```
. \t\t\t\t\t\t\t\t\t┌─────────────────┐
                    │    SISTEMA      │
                    │   (Auto-gen)    │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    URGENTE      │◄──────────────────┐
                    │   (Sin asignar) │                   │
                    │     🔴 Rojo     │                   │
                    └─────────┬───────┘                   │
                              │                           │
                   ┌─────────────────────────────────────┘
                   │  ADMIN asigna limpiadora
                   │
                   ▼
         ┌─────────────────┐
         │     ESP_OK      │
         │   (Asignada)    │
         │   🟡 Amarillo   │
         └─────────┬───────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌─────────────┐  ┌─────────────┐
│ CONFIR  │  │  REJECTED   │  │ TENTATIVO   │
│(Acepta) │  │ (Rechaza)   │  │(Propone Hr.)│
│🟢 Verde │  │🟠 Naranja   │  │ 🔵 Azul     │
└─────┬───┘  └─────┬───────┘  └─────┬───────┘
      │            │                │
      │            │                │
      │            └────────────────┼─────────┐
      │                             │         │
      │                             │         │
      │            ┌────────────────┘         │
      │            │ ADMIN reasigna           │
      │            │                          │
      │            ▼                          │
      │      ┌─────────────────┐              │
      │      │     ESP_OK      │              │
      │      │  (Reasignada)   │              │
      │      │   🟡 Amarillo   │              │
      │      └─────────────────┘              │
      │                                       │
      │              ┌────────────────────────┘
      │              │ ADMIN acepta/rechaza propuesta
      │              │
      │              ▼
      │      ┌─────────────────┐
      │      │ CONFIR/ESP_OK   │
      │      │   (Según resp)  │
      │      └─────────────────┘
      │
      │
      ▼
┌─────────────────┐
│   COMPLETED     │
│   (Finalizada)  │
│   🟣 Morado     │
└─────────────────┘
```

## 📋 **TRANSICIONES Y ACTORES**

### **🤖 SISTEMA (Automático)**

**Acción**                | **Desde** | **Hacia** | **Servicio**             | **Snapshot**
------------------------- | --------- | --------- | ------------------------ | ------------
Crear tarea desde reserva | -         | URGENTE   | TaskService.createTask() | ✅
Crear tarea manual        | -         | URGENTE   | TaskService.createTask() | ✅

### **👤 ADMIN (Gestión)**

**Acción**             | **Desde** | **Hacia** | **Servicio**                      | **Snapshot**
---------------------- | --------- | --------- | --------------------------------- | ------------
Asignar limpiadora     | URGENTE   | ESP_OK    | TaskService.assignTask()          | ✅
Reasignar tras rechazo | REJECTED  | ESP_OK    | TaskService.assignTask()          | ✅
Aprobar propuesta      | TENTATIVO | CONFIR    | ProposalService.approveProposal() | ✅
Rechazar propuesta     | TENTATIVO | ESP_OK    | ProposalService.rejectProposal()  | ✅

### **👩‍💼 LIMPIADORA (Respuesta)**

**Acción**        | **Desde** | **Hacia** | **Servicio**                     | **Datos Adicionales**
----------------- | --------- | --------- | -------------------------------- | ---------------------
Confirmar tarea   | ESP_OK    | CONFIR    | TaskService.updateTaskStatus()   | ✅ Snapshot
Rechazar tarea    | ESP_OK    | REJECTED  | RejectionService.logRejection()  | ✅ Snapshot + Motivo
Proponer horario  | ESP_OK    | TENTATIVO | ProposalService.createProposal() | ✅ Snapshot + Horario
Finalizar trabajo | CONFIR    | COMPLETED | TaskService.updateTaskStatus()   | ✅ Snapshot + Videos

### **💬 COMENTARIOS (Independientes)**

**Acción**         | **Disponible En** | **Servicio**                     | **Persistencia**
------------------ | ----------------- | -------------------------------- | ----------------
Agregar comentario | TODOS los estados | CommentService.addComment()      | ✅ task_comments
Ver comentarios    | TODOS los estados | CommentService.getTaskComments() | ✅ task_comments

## 🔍 **ARQUITECTURA EVENT SOURCED**

### **📸 Snapshots Automáticos**

- **Cada cambio de estado** → Snapshot completo en `task_events`
- **Ordenados por tiempo** → Historial completo consultable
- **Incluye actor** → Quién hizo el cambio

### **📝 Datos Específicos**

- **Rechazos** → `task_rejections` con motivos detallados
- **Propuestas** → `task_proposals` con horarios y workflow
- **Comentarios** → `task_comments` independientes del estado

### **🔄 Flujo de Datos**

```
Acción → Actualizar tasks → Capturar snapshot → Guardar datos específicos
```

## 🗄️ **ESTRUCTURA DE SHEETS**

### **1\. tasks** (Estado actual - SIMPLIFICADO)

```
| id | property | type | date | status | assigned_cleaner_id | created_at | updated_at | created_by | last_updated_by |
```

### **2\. task_events** (Snapshots históricos - SIMPLIFICADO)

```
| snapshot_id | task_id | property | type | date | status | assigned_cleaner_id | created_at | updated_at | created_by | last_updated_by | snapshot_timestamp | changed_by |
```

### **3\. task_comments** (Comentarios independientes)

```
| id | task_id | user_id | comment | timestamp | comment_type |
```

### **4\. task_rejections** (Rechazos específicos)

```
| id | task_id | user_id | rejection_reason | timestamp | previous_cleaner_id |
```

### **5\. task_proposals** (Propuestas de horario)

```
| id | task_id | user_id | proposed_time | proposal_reason | timestamp | status |
```

### **6\. task_timings** (Eventos de tiempo - NUEVO)

```
| id | task_id | user_id | event_type | timestamp | recorded_at |
```
*event_type: ENTRY o EXIT*

### **7\. task_product_usage** (Uso de productos - NUEVO)

```
| id | task_id | user_id | product_id | quantity | notes | timestamp |
```

## 🎯 **CARACTERÍSTICAS CLAVE**

### **✅ Implementado Según Requerimientos**

- Estados exactos de REQUERIMIENTOS.md
- Colores específicos mantenidos (rojo, amarillo, verde, naranja, azul)
- Workflow completo admin-limpiadora

### **✅ Event Sourcing Completo**

- Historial inmutable de cambios
- Reconstrucción de estado posible
- Análisis temporal disponible

### **✅ Robustez**

- Menos mutaciones en tabla principal
- Datos específicos en sheets separados
- Comentarios independientes del estado

### **✅ Análisis Avanzado**

- Estadísticas de rechazos por limpiadora
- Propuestas de horario más comunes
- Rendimiento por limpiadora
- Cambios por período de tiempo

## 🚀 **SERVICIOS IMPLEMENTADOS**

### **EventService.gs**

- `captureSnapshot()` - Captura automática de snapshots
- `getTaskHistory()` - Historial completo de una tarea
- `getRecentChanges()` - Cambios recientes en el sistema
- `getChangeStatistics()` - Estadísticas de cambios por usuario

### **CommentService.gs**

- `addComment()` - Agregar comentario a cualquier tarea
- `getTaskComments()` - Obtener comentarios de una tarea
- `searchComments()` - Buscar comentarios por texto

### **RejectionService.gs**

- `logRejection()` - Registrar rechazo con motivo
- `getRejectionStatistics()` - Estadísticas de rechazos
- `getUserRejectionRate()` - Tasa de rechazo por usuario

### **ProposalService.gs**

- `createProposal()` - Crear propuesta de horario
- `approveProposal()` - Aprobar propuesta (admin)
- `rejectProposal()` - Rechazar propuesta (admin)
- `getPendingProposals()` - Propuestas pendientes

### **TimingService.gs** (NUEVO)

- `logEntry()` - Registrar entrada a tarea
- `logExit()` - Registrar salida de tarea
- `getTaskTimings()` - Obtener eventos de tiempo de tarea
- `calculateTaskDuration()` - Calcular duración total

### **ProductUsageService.gs** (NUEVO)

- `logProductUsage()` - Registrar uso de producto
- `logMultipleProductUsage()` - Registrar múltiples productos
- `getTaskProductUsage()` - Obtener productos usados en tarea
- `getProductUsageStatistics()` - Estadísticas de uso

## 🎉 **RESULTADO FINAL**

**Sistema completo con:**

- 📊 Estados bien definidos y consistentes
- 🔄 Flujo de trabajo claro y funcional
- 📈 Event sourcing para análisis avanzado
- 💪 Arquitectura robusta y escalable
- 🎯 Cumplimiento total de requerimientos

**Fecha de implementación:** Julio 2024  
**Versión:** 2.0 Event Sourced Completo  
**Estado:** Listo para producción  
**Cambios v2.0:**
- ✅ Eliminado manejo de media (videos)
- ✅ Separación de eventos de tiempo (task_timings)
- ✅ Separación de eventos de productos (task_product_usage)
- ✅ Tabla tasks simplificada sin mutaciones innecesarias
- ✅ Arquitectura 100% event sourced
