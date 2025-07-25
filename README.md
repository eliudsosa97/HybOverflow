# StudentOverflow

Plataforma de preguntas y respuestas académicas inspirada en StackOverflow, diseñada específicamente para estudiantes universitarios.

## Descripción del Proyecto

StudentOverflow es una aplicación web que permite a estudiantes hacer preguntas académicas, responder dudas de otros compañeros, y construir una comunidad de conocimiento colaborativo. El sistema incluye un mecanismo de reputación basado en votos, categorización de preguntas por materias, y un diseño responsive optimizado para dispositivos móviles y desktop.

## Arquitectura y Tecnologías

### Backend

- **Flask** - Framework web de Python
- **SQLAlchemy** - ORM para manejo de base de datos
- **Flask-JWT-Extended** - Autenticación basada en JWT tokens
- **SQLite** - Base de datos (desarrollo) / PostgreSQL (producción)
- **Flask-CORS** - Manejo de CORS para comunicación frontend-backend

### Frontend

- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **Axios** - Cliente HTTP para llamadas API
- **React Context** - Manejo de estado global para autenticación

## Estructura del Proyecto

```
studentoverflow/
├── backend/              # API Flask
│   ├── models/           # Modelos de base de datos
│   ├── routes/           # Endpoints de la API
│   ├── controllers/      # Lógica de negocio
│   └── instance/         # Base de datos SQLite
├── frontend/             # Aplicación Next.js
│   └── src/
│       ├── app/          # Pages y layouts (App Router)
│       ├── components/   # Componentes reutilizables
│       ├── context/      # Contextos de React
│       └── services/     # Servicios de API
└── documentation/        # Documentación técnica
    └── db/               # Esquemas de base de datos
```

## Funcionalidades Principales

### Sistema de Usuarios

- Registro e inicio de sesión con validación
- Perfiles de usuario con información académica
- Sistema de reputación basado en votos
- Persistencia de sesión con JWT tokens

### Gestión de Preguntas

- Creación de preguntas con título y contenido detallado
- Categorización por materias académicas
- Sistema de votos (upvote/downvote)
- Contador de visualizaciones
- Marcado de preguntas como resueltas

### Sistema de Respuestas

- Respuestas a preguntas con formateo de texto
- Sistema de votos para respuestas
- Funcionalidad de respuesta aceptada por el autor de la pregunta
- Ordenamiento por popularidad y fecha

### Interfaz de Usuario

- Dashboard personalizado según estado de autenticación
- Diseño responsive para móviles y desktop
- Navegación intuitiva entre secciones
- Búsqueda y filtrado de contenido

## Base de Datos

El sistema utiliza un esquema relacional con 4 entidades principales:

- **users**: Información de estudiantes registrados
- **categories**: Clasificación de preguntas por materias
- **questions**: Preguntas realizadas por estudiantes
- **answers**: Respuestas a las preguntas

Ver documentación completa en `documentation/db/ERD-StudentOverflow.md`

## Instalación y Configuración

### Prerrequisitos

- Python 3.8+
- Node.js 18+
- npm o yarn

### Backend (Flask)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### Configuración de Base de Datos

```bash
cd backend
python seed_data.py  # Crear datos de ejemplo
```

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/verify-token` - Verificación de token
- `GET /api/auth/profile` - Perfil del usuario actual

### Preguntas

- `GET /api/questions` - Lista de preguntas con filtros
- `GET /api/questions/{id}` - Detalle de pregunta específica
- `POST /api/questions` - Crear nueva pregunta
- `PUT /api/questions/{id}` - Actualizar pregunta
- `DELETE /api/questions/{id}` - Eliminar pregunta

### Respuestas

- `POST /api/answers` - Crear respuesta
- `PUT /api/answers/{id}` - Actualizar respuesta
- `DELETE /api/answers/{id}` - Eliminar respuesta
- `POST /api/answers/{id}/accept` - Marcar respuesta como aceptada

## Checkpoints Académicos

### Checkpoint 1: Estructura inicial ✓

- Configuración del proyecto
- Sistema de autenticación funcional
- Documentación inicial

### Checkpoint 2: Diseño de base de datos ✓

- Esquema entidad-relación completo
- Script SQL de implementación
- Documentación de restricciones

### Checkpoint 3: Desarrollo de vistas principales ✓

- Landing page responsive
- Sistema de login/registro
- Dashboard de usuario

### Checkpoint 4: Autenticación y autorización ✓

- JWT tokens para sesiones
- Protección de rutas
- Persistencia de autenticación

### Checkpoint 5: Funcionalidad completa ✓

- Sistema de preguntas y respuestas
- Interfaz dinámica
- Integración frontend-backend completa

## Configuración de Producción

### Variables de Entorno

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
FLASK_ENV=production
CORS_ORIGINS=https://your-domain.com
```

### Deployment

El proyecto está preparado para deployment en:

- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Vercel, Netlify
- **Base de datos**: PostgreSQL en la nube

## Contribución

Este proyecto fue desarrollado como parte del curso de Programación Avanzada, implementando las mejores prácticas de desarrollo web moderno, arquitectura MVC, y diseño de APIs RESTful.

## Licencia

Proyecto académico - Hybridge Education  
Curso: Programación Avanzada
