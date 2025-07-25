# Checkpoint 2 - Diseño de Base de Datos

## Entregables Completados

### Entregable 1: Esquema Entidad-Relación (ERD)

**Ubicación:** `documentation/db/ERD-StudentOverflow.md`

**Contenido:**

- Diagrama ERD visual con Mermaid
- Descripción detallada de 4 entidades principales
- Especificación de todas las relaciones
- Documentación de restricciones e integridad
- Índices recomendados para rendimiento
- Estimaciones de volumen de datos

### Archivos Adicionales

**`documentation/db/schema.sql`** - Script SQL completo con:

- Definiciones DDL de todas las tablas
- Índices para optimización
- Triggers para timestamps automáticos
- Vistas útiles para consultas
- Datos de ejemplo

## Entidades del Sistema

| Entidad      | Descripción                | Campos Clave                 |
| ------------ | -------------------------- | ---------------------------- |
| **USER**     | Estudiantes registrados    | username, email, reputation  |
| **CATEGORY** | Clasificación de preguntas | name, slug, color            |
| **QUESTION** | Preguntas de estudiantes   | title, content, votes, views |
| **ANSWER**   | Respuestas a preguntas     | content, is_accepted, votes  |

## Relaciones Principales

```
USER (1) ──── (N) QUESTION    "Un usuario puede hacer muchas preguntas"
USER (1) ──── (N) ANSWER      "Un usuario puede dar muchas respuestas"
CATEGORY (1) ──── (N) QUESTION "Una categoría puede tener muchas preguntas"
QUESTION (1) ──── (N) ANSWER   "Una pregunta puede tener muchas respuestas"
```

## Características del Diseño

- **Integridad referencial** completa con claves foráneas
- **Sistema de reputación** basado en votos y actividad
- **Categorización flexible** con colores personalizados
- **Métricas de engagement** (views, votes)
- **Soft deletes** para mantener historial
- **Optimizado para rendimiento** con índices estratégicos

---

**Checkpoint 2 Status:** COMPLETADO  
**Fecha de entrega:** Julio 2025  
**Próximo:** Checkpoint 3 - Screenshots de las vistas
