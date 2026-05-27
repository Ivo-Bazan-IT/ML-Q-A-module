# Ejemplos de Requests para Mercado Libre Q&A Module

## 1. Health Check

### GET /api/health

```
GET http://localhost:3000/api/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

## 2. OAuth Flow

### POST /api/oauth/authorize

Inicia el flujo de autenticación OAuth.

```
POST http://localhost:3000/api/oauth/authorize
Content-Type: application/json
```

**Response:**

```json
{
  "status": "success",
  "authUrl": "https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=YOUR_ID&redirect_uri=...",
  "state": "random_state_string"
}
```

### GET /api/oauth/callback

Después que el usuario se autentica en Mercado Libre, será redirigido a este endpoint.

```
GET http://localhost:3000/api/oauth/callback?code=AUTH_CODE&state=STATE
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "localToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "mlUserId": "123456789",
    "email": "user@example.com",
    "nickname": "user_nickname"
  }
}
```

### POST /api/oauth/refresh

Refresh del JWT token.

```
POST http://localhost:3000/api/oauth/refresh
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "token": "new_jwt_token"
  }
}
```

### POST /api/oauth/logout

Logout y revocación de tokens.

```
POST http://localhost:3000/api/oauth/logout
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response:**

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### GET /api/oauth/status

Obtener estado de autenticación actual.

```
GET http://localhost:3000/api/oauth/status
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "userId": "123456789",
    "authenticated": true
  }
}
```

---

## 3. Q&A Endpoints

### GET /api/qna/items/{itemId}/questions

Obtener preguntas para un producto específico.

```
GET http://localhost:3000/api/qna/items/MLB123456789/questions
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "itemId": "MLB123456789",
    "questions": [
      {
        "id": "123",
        "item": { "id": "MLB123456789" },
        "seller": { "id": 123456 },
        "buyer": { "id": 654321 },
        "text": "Is this product available?",
        "status": "ACTIVE",
        "date_created": "2024-01-15T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### GET /api/qna/sellers/{sellerId}/questions

Obtener todas las preguntas de un vendedor.

```
GET http://localhost:3000/api/qna/sellers/123456789/questions?limit=50&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**

- `limit` (opcional): Default 50
- `offset` (opcional): Default 0

**Response:**

```json
{
  "status": "success",
  "data": {
    "sellerId": "123456789",
    "questions": [...],
    "count": 5
  }
}
```

### POST /api/qna/sellers/{sellerId}/sync

Sincronizar preguntas desde Mercado Libre.

```
POST http://localhost:3000/api/qna/sellers/123456789/sync
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "sellerId": "123456789",
    "syncedCount": 10,
    "questions": [...]
  }
}
```

### GET /api/qna/sellers/{sellerId}/unanswered

Obtener preguntas sin responder.

```
GET http://localhost:3000/api/qna/sellers/123456789/unanswered?limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**

- `limit` (opcional): Default 20

**Response:**

```json
{
  "status": "success",
  "data": {
    "sellerId": "123456789",
    "unansweredCount": 3,
    "questions": [
      {
        "question": {
          "_id": "...",
          "mlQuestionId": "123",
          "mlItemId": "MLB...",
          "mlSellerId": "123456789",
          "mlBuyerId": "654321",
          "text": "¿Tiene stock?",
          "status": "active",
          "createdAt": "2024-01-15T10:00:00.000Z",
          "syncedAt": "2024-01-15T10:30:00.000Z"
        },
        "answers": []
      }
    ]
  }
}
```

### GET /api/qna/sellers/{sellerId}/answered

Obtener preguntas respondidas.

```
GET http://localhost:3000/api/qna/sellers/123456789/answered?limit=20&skip=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**

- `limit` (opcional): Default 20
- `skip` (opcional): Default 0

**Response:**

```json
{
  "status": "success",
  "data": {
    "sellerId": "123456789",
    "answeredCount": 2,
    "questions": [
      {
        "question": {...},
        "answers": [
          {
            "_id": "...",
            "mlAnswerId": "456",
            "mlQuestionId": "123",
            "mlSellerId": "123456789",
            "text": "Sí, tenemos stock disponible",
            "status": "active",
            "createdAt": "2024-01-15T11:00:00.000Z",
            "syncedAt": "2024-01-15T11:30:00.000Z"
          }
        ]
      }
    ]
  }
}
```

### GET /api/qna/questions/{questionId}

Obtener detalles de una pregunta específica.

```
GET http://localhost:3000/api/qna/questions/123
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "question": {
      "id": "123",
      "item": { "id": "MLB123456789" },
      "seller": { "id": 123456 },
      "buyer": { "id": 654321 },
      "text": "¿Cuál es el tiempo de entrega?",
      "status": "ACTIVE",
      "date_created": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

### POST /api/qna/questions/{questionId}/answer

Responder una pregunta.

```
POST http://localhost:3000/api/qna/questions/123/answer
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "text": "Realizamos entregas en 24 a 48 horas hábiles"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "answer": {
      "id": "456",
      "question_id": "123",
      "seller": { "id": 123456 },
      "text": "Realizamos entregas en 24 a 48 horas hábiles",
      "status": "ACTIVE",
      "date_created": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### DELETE /api/qna/answers/{answerId}

Eliminar una respuesta.

```
DELETE http://localhost:3000/api/qna/answers/456
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "status": "success",
  "message": "Answer deleted successfully"
}
```

---

## 4. Error Responses

### 401 Unauthorized

```json
{
  "status": "error",
  "message": "No token provided"
}
```

### 400 Bad Request

```json
{
  "status": "error",
  "message": "Question ID and answer text are required"
}
```

### 404 Not Found

```json
{
  "status": "error",
  "message": "Route /api/invalid not found"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

---

## 5. Flujo Completo de Ejemplo

### Paso 1: Iniciar autenticación

```bash
curl -X POST http://localhost:3000/api/oauth/authorize
```

Obtener `authUrl` de la respuesta.

### Paso 2: Usuario se autentica en Mercado Libre

Redirigir al usuario a `authUrl` en el navegador.

### Paso 3: Procesar callback

```bash
curl -X GET "http://localhost:3000/api/oauth/callback?code=CODE_FROM_STEP_2&state=STATE"
```

Obtener `localToken` de la respuesta.

### Paso 4: Sincronizar preguntas

```bash
curl -X POST http://localhost:3000/api/qna/sellers/123456789/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Paso 5: Obtener preguntas sin responder

```bash
curl -X GET http://localhost:3000/api/qna/sellers/123456789/unanswered?limit=20 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Paso 6: Responder una pregunta

```bash
curl -X POST http://localhost:3000/api/qna/questions/QUESTION_ID/answer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your answer here"}'
```

---

## 6. Testing con cURL

Guardar variables en un archivo `.env` y usarlas:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
TOKEN="your_jwt_token"
SELLER_ID="123456789"

# Health check
curl -X GET "$BASE_URL/api/health"

# Get unanswered questions
curl -X GET "$BASE_URL/api/qna/sellers/$SELLER_ID/unanswered" \
  -H "Authorization: Bearer $TOKEN"

# Answer a question
curl -X POST "$BASE_URL/api/qna/questions/QUESTION_ID/answer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "My answer"}'
```
