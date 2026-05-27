# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2024-01-15

### Added

- ✨ Estructura base del proyecto con Express.js y TypeScript
- 🔐 Sistema completo de OAuth2 con Mercado Libre
  - Generación de URLs de autorización
  - Intercambio de código por access token
  - Refresh automático de tokens
  - Gestión segura de credenciales
- 🔑 Autenticación con JWT
  - Generación de tokens locales
  - Middleware de validación
  - Refresh de tokens
  - Logout y revocación
- 💾 Base de datos MongoDB con Mongoose
  - Modelos para OAuth tokens
  - Modelos para preguntas y respuestas
  - Índices optimizados
  - Auto-cleanup de tokens expirados
- 🤔 API completa para Q&A
  - Obtener preguntas por producto
  - Obtener preguntas por vendedor
  - Sincronización desde Mercado Libre
  - Listar preguntas sin responder
  - Listar preguntas respondidas
  - Responder preguntas
  - Eliminar respuestas
- 💾 Caching con Node-Cache
  - Caché en memoria para tokens
  - TTL automático
  - Invalidación por usuario
- 📚 Documentación completa
  - README con instrucciones
  - Guía de inicio rápido
  - Setup de OAuth detallado
  - Ejemplos de API
  - Documentación de arquitectura
- 🧪 Script de testing interactivo
- 🐳 Docker Compose para MongoDB
- ⚙️ Configuración de TypeScript
- 📝 ESLint y Prettier

### Technical Details

- Node.js 18+ con ES2020
- Express.js 4.18
- MongoDB con Mongoose 8.0
- JWT para autenticación
- Axios para peticiones HTTP
- Node-Cache para caching
- CORS habilitado
- Variables de entorno con dotenv

## Roadmap

### [1.1.0] - Próximo

- [ ] Unit tests con Jest
- [ ] Integration tests
- [ ] Swagger/OpenAPI documentation
- [ ] Rate limiting
- [ ] Input validation mejorada
- [ ] Logging mejorado

### [1.2.0] - Futuro

- [ ] Webhooks de Mercado Libre
- [ ] Sincronización automática en background
- [ ] Queue de mensajes (Bull/RabbitMQ)
- [ ] Auto-responder con templates
- [ ] Analytics básicos

### [2.0.0] - Versión Mayor

- [ ] GraphQL API
- [ ] Redis para caching distribuido
- [ ] Soporte multi-tenant
- [ ] Admin dashboard
- [ ] Moderation queue
- [ ] API v2 con breaking changes

## Notas de Desarrollo

### Requisitos para Contribuir

- Node.js 18+
- Git
- Conocimiento de TypeScript
- Familiaridad con Express.js

### Comandos Útiles

```bash
npm run dev        # Desarrollo
npm run build      # Build
npm start          # Producción
npm run lint       # Linting
npm run format     # Formatear código
npm test           # Tests (futuro)
```

### Branches

- `main`: Versión estable
- `develop`: Desarrollo
- `feature/*`: Nuevas funcionalidades
- `fix/*`: Correcciones de bugs
- `docs/*`: Documentación

### Versionado

Seguimos [Semantic Versioning](https://semver.org/):

- MAJOR: Cambios incompatibles en API
- MINOR: Nuevas funcionalidades compatibles
- PATCH: Correcciones de bugs

---

**Última actualización:** 15 de enero de 2024
