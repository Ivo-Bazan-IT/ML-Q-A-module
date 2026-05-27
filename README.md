# Mercado Libre Q&A Module - Backend

Un módulo robusto y escalable para gestionar preguntas y respuestas de Mercado Libre con autenticación OAuth2.

## 🎯 Características

- **OAuth2 Integration**: Autenticación segura con Mercado Libre
- **Token Management**: Gestión automática de tokens de acceso y refresh tokens
- **Q&A Management**: Sincronización y gestión de preguntas y respuestas
- **Local Database**: Almacenamiento en MongoDB con sincronización
- **JWT Authentication**: Tokens JWT locales para API security
- **Caching**: Sistema de caché para optimizar requests
- **Error Handling**: Manejo robusto de errores
- **TypeScript**: Código totalmente tipado

## 📋 Requisitos

- Node.js 18+
- MongoDB 5.0+
- Credenciales de Mercado Libre (Client ID y Secret)

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copiar `.env.example` a `.env` y completar con tus credenciales:

```bash
cp .env.example .env
```

```env
# Mercado Libre OAuth
ML_CLIENT_ID=your_client_id
ML_CLIENT_SECRET=your_client_secret
ML_REDIRECT_URI=http://localhost:3000/api/oauth/callback

# Database
MONGODB_URI=mongodb://localhost:27017/ml-qna

# JWT
JWT_SECRET=your_secret_key
```

### 3. Obtener Credenciales de Mercado Libre

1. Ir a [Mercado Libre Developers](https://developers.mercadolibre.com.ar/)
2. Crear una aplicación
3. Obtener Client ID y Client Secret
4. Configurar Redirect URI en la aplicación

## 🏃 Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## 📚 Estructura del Proyecto

```
src/
├── config/          # Configuración de la aplicación
├── controllers/     # Controladores de rutas
├── middleware/      # Middlewares (auth, error handling)
├── models/          # Modelos de MongoDB
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── utils/           # Utilidades (database, logger)
└── index.ts         # Punto de entrada
```

## 🔐 Flujo OAuth2

### 1. Iniciar Autenticación

```
POST /api/oauth/authorize
```

**Respuesta:**

```json
{
  "status": "success",
  "authUrl": "https://auth.mercadolibre.com.ar/...",
  "state": "random_state_string"
}
```

### 2. Usuario se autentica en Mercado Libre

El usuario es redirigido a la URL de autenticación de Mercado Libre.

### 3. Callback

```
GET /api/oauth/callback?code=AUTH_CODE&state=STATE
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "localToken": "jwt_token",
    "mlUserId": 123456789,
    "email": "user@example.com",
    "nickname": "user_nickname"
  }
}
```

## 📡 Endpoints de OAuth

### `POST /api/oauth/authorize`

Inicia el flujo de autenticación OAuth.

**Request:** Sin parámetros

**Response:**

```json
{
  "status": "success",
  "authUrl": "string",
  "state": "string"
}
```

### `GET /api/oauth/callback`

Callback después de autenticación en Mercado Libre.

**Query Parameters:**

- `code` (required): Authorization code
- `state` (optional): State parameter

**Response:**

```json
{
  "status": "success",
  "data": {
    "localToken": "string",
    "mlUserId": "string",
    "email": "string",
    "nickname": "string"
  }
}
```

### `POST /api/oauth/refresh`

Refresh JWT token (requiere autenticación).

**Headers:**

```
Authorization: Bearer {localToken}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "token": "string"
  }
}
```

### `POST /api/oauth/logout`

Revoca token y realiza logout (requiere autenticación).

**Headers:**

```
Authorization: Bearer {localToken}
```

**Response:**

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### `GET /api/oauth/status`

Obtiene estado de autenticación (requiere autenticación).

**Headers:**

```
Authorization: Bearer {localToken}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "userId": "string",
    "authenticated": true
  }
}
```

## 🤔 Endpoints de Q&A

Todos los endpoints de Q&A requieren autenticación (header `Authorization: Bearer {token}`).

### `GET /api/qna/items/:itemId/questions`

Obtiene preguntas para un producto específico.

**Query Parameters:**

- `itemId` (path, required): ID del producto en Mercado Libre

**Response:**

```json
{
  "status": "success",
  "data": {
    "itemId": "string",
    "questions": [...],
    "count": 0
  }
}
```

### `GET /api/qna/sellers/:sellerId/questions`

Obtiene todas las preguntas de un vendedor.

**Query Parameters:**

- `sellerId` (path, required): ID del vendedor
- `limit` (query, optional): Default 50
- `offset` (query, optional): Default 0

**Response:**

```json
{
  "status": "success",
  "data": {
    "sellerId": "string",
    "questions": [...],
    "count": 0
  }
}
```

### `POST /api/qna/sellers/:sellerId/sync`

Sincroniza preguntas de Mercado Libre para un vendedor.

**Response:**

```json
{
  "status": "success",
  "data": {
    "sellerId": "string",
    "syncedCount": 0,
    "questions": [...]
  }
}
```

### `GET /api/qna/sellers/:sellerId/unanswered`

Obtiene preguntas sin responder de un vendedor.

**Query Parameters:**

- `sellerId` (path, required): ID del vendedor
- `limit` (query, optional): Default 20

**Response:**

```json
{
  "status": "success",
  "data": {
    "sellerId": "string",
    "unansweredCount": 0,
    "questions": [
      {
        "question": {...},
        "answers": []
      }
    ]
  }
}
```

### `GET /api/qna/sellers/:sellerId/answered`

Obtiene preguntas respondidas de un vendedor.

**Query Parameters:**

- `sellerId` (path, required): ID del vendedor
- `limit` (query, optional): Default 20
- `skip` (query, optional): Default 0

**Response:**

```json
{
  "status": "success",
  "data": {
    "sellerId": "string",
    "answeredCount": 0,
    "questions": [...]
  }
}
```

### `GET /api/qna/questions/:questionId`

Obtiene detalles de una pregunta específica.

**Response:**

```json
{
  "status": "success",
  "data": {
    "question": {...}
  }
}
```

### `POST /api/qna/questions/:questionId/answer`

Responde una pregunta.

**Body:**

```json
{
  "text": "Your answer text here"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "answer": {...}
  }
}
```

### `DELETE /api/qna/answers/:answerId`

Elimina una respuesta.

**Response:**

```json
{
  "status": "success",
  "message": "Answer deleted successfully"
}
```

## 🗄️ Modelos de Base de Datos

### OAuthToken

```typescript
{
  userId: String (index),
  mlUserId: String (index),
  accessToken: String,
  refreshToken: String (index),
  expiresAt: Date,
  scope: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Question

```typescript
{
  mlQuestionId: String (unique, index),
  mlItemId: String (index),
  mlSellerId: String (index),
  mlBuyerId: String,
  text: String,
  status: Enum ('active', 'archived', 'banned'),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  syncedAt: Date
}
```

### Answer

```typescript
{
  mlAnswerId: String (unique, index),
  mlQuestionId: String (index),
  mlSellerId: String (index),
  text: String,
  status: Enum ('active', 'archived', 'banned'),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  syncedAt: Date
}
```

## 🔍 Health Check

```
GET /api/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## 🚨 Manejo de Errores

Todos los errores siguen el formato:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Códigos de error comunes:

- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## 📝 Ejemplo de Flujo Completo

### 1. Cliente inicia autenticación

```bash
curl -X POST http://localhost:3000/api/oauth/authorize
```

### 2. Usuario es redirigido a Mercado Libre

El frontend redirige al usuario a la URL retornada.

### 3. Usuario se autentica

Mercado Libre redirige de vuelta al callback.

### 4. Backend procesa el callback

```bash
curl -X GET "http://localhost:3000/api/oauth/callback?code=AUTH_CODE"
```

### 5. Cliente obtiene el JWT

```json
{
  "localToken": "eyJhbGciOiJIUzI1NiIs...",
  "mlUserId": "123456789"
}
```

### 6. Cliente usa el JWT para acceder a Q&A

```bash
curl -X GET http://localhost:3000/api/qna/sellers/123456789/unanswered \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 7. Sincronizar preguntas

```bash
curl -X POST http://localhost:3000/api/qna/sellers/123456789/sync \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 8. Responder pregunta

```bash
curl -X POST http://localhost:3000/api/qna/questions/QUESTION_ID/answer \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"text": "This is my answer"}'
```

## 🛠️ Scripts útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Linting
npm run lint

# Formatear código
npm run format

# Tests
npm test
```

## 📦 Dependencias Principales

- **express**: Framework web
- **mongoose**: ODM para MongoDB
- **axios**: Cliente HTTP
- **jsonwebtoken**: Generación de JWT
- **cors**: CORS middleware
- **dotenv**: Variables de entorno
- **node-cache**: Caching en memoria

## 🔒 Seguridad

- Tokens JWT con expiración
- Refresh tokens para renovación automática
- Validación de entrada en todos los endpoints
- CORS configurado
- Manejo de errores seguro
- Variables de entorno sensibles

## 📊 Próximas Mejoras

- [ ] Rate limiting
- [ ] Webhooks para sincronización automática
- [ ] Bulk operations
- [ ] Estadísticas y reportes
- [ ] Moderation queue
- [ ] Auto-responder templates
- [ ] Tests unitarios e integración
- [ ] API documentation (Swagger)
- [ ] Redis caching
- [ ] Message queue (Bull/RabbitMQ)

## 📞 Soporte

Para issues o preguntas, contactar al equipo de desarrollo.

## 📄 Licencia

MIT
