# 🚀 Guía de Inicio Rápido

## Prerrequisitos

- Node.js 18+
- npm o yarn
- MongoDB 5.0+ (o Docker)
- Credenciales de Mercado Libre (Client ID y Secret)

## 1️⃣ Instalación Local

### 1.1 Clonar o descargar el proyecto

```bash
cd ML-Q&A-module/back
```

### 1.2 Instalar dependencias

```bash
npm install
```

### 1.3 Iniciar MongoDB con Docker (Opcional)

```bash
docker-compose up -d
```

O instalar MongoDB localmente:

- [macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
- [Linux](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-linux/)
- [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)

### 1.4 Obtener credenciales de Mercado Libre

Sigue los pasos en [OAUTH_SETUP.md](./OAUTH_SETUP.md)

Necesitarás:

- `ML_CLIENT_ID`
- `ML_CLIENT_SECRET`

### 1.5 Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
nano .env  # o tu editor favorito
```

Debe verse así:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb://localhost:27017/ml-qna

ML_CLIENT_ID=your_client_id
ML_CLIENT_SECRET=your_client_secret
ML_REDIRECT_URI=http://localhost:3000/api/oauth/callback

JWT_SECRET=a_very_secure_random_string_here
JWT_EXPIRES_IN=7d

LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
CACHE_TTL=3600
```

### 1.6 Iniciar servidor de desarrollo

```bash
npm run dev
```

Verás:

```
[2024-01-15T10:30:00.000Z] [INFO] Server started
✓ Database connected successfully
```

### 1.7 Verificar que está funcionando

En otra terminal:

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## 2️⃣ Flujo de Prueba Completo

### Paso 1: Iniciar OAuth

```bash
curl -X POST http://localhost:3000/api/oauth/authorize
```

Resultado:

```json
{
  "status": "success",
  "authUrl": "https://auth.mercadolibre.com.ar/authorization?...",
  "state": "abc123..."
}
```

### Paso 2: Ir a la URL de autenticación

Copiar `authUrl` en el navegador y autorizar.

### Paso 3: Obtener el código de la redirección

Cuando ML te redirige, verás una URL como:

```
http://localhost:3000/api/oauth/callback?code=ABC123&state=...
```

### Paso 4: Procesar el callback

```bash
curl -X GET "http://localhost:3000/api/oauth/callback?code=ABC123&state=..."
```

Resultado:

```json
{
  "status": "success",
  "data": {
    "localToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "mlUserId": "123456789",
    "email": "tu@email.com",
    "nickname": "tu_nickname"
  }
}
```

### Paso 5: Guardar el token

```bash
# Guardar en variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Paso 6: Sincronizar preguntas

```bash
curl -X POST http://localhost:3000/api/qna/sellers/123456789/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Paso 7: Obtener preguntas sin responder

```bash
curl -X GET "http://localhost:3000/api/qna/sellers/123456789/unanswered?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Paso 8: Responder una pregunta

```bash
curl -X POST http://localhost:3000/api/qna/questions/QUESTION_ID/answer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Sí, contamos con disponibilidad"}'
```

## 3️⃣ Usando Postman o Insomnia

### 3.1 Crear Collection

1. Nueva Collection: "ML Q&A"
2. Ir a Variables
3. Agregar variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (se completará después)

### 3.2 Requests

#### 1. Health Check

```
GET {{base_url}}/api/health
```

#### 2. Authorize

```
POST {{base_url}}/api/oauth/authorize
```

#### 3. Callback (después de autorizar en navegador)

```
GET {{base_url}}/api/oauth/callback?code={{code}}&state={{state}}
```

Guardar token en variable después de esta respuesta.

#### 4. Sync Preguntas

```
POST {{base_url}}/api/qna/sellers/YOUR_SELLER_ID/sync
Authorization: Bearer {{token}}
```

#### 5. Obtener Sin Responder

```
GET {{base_url}}/api/qna/sellers/YOUR_SELLER_ID/unanswered?limit=20
Authorization: Bearer {{token}}
```

#### 6. Responder

```
POST {{base_url}}/api/qna/questions/QUESTION_ID/answer
Authorization: Bearer {{token}}

{
  "text": "Tu respuesta aquí"
}
```

## 4️⃣ Estructura de Carpetas

```
ML-Q&A-module/back/
├── src/
│   ├── config/          # Configuración
│   ├── controllers/      # Lógica HTTP
│   ├── middleware/       # Auth, errores
│   ├── models/          # Schemas de BD
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades
│   └── index.ts         # Punto de entrada
├── dist/                # Build output
├── node_modules/        # Dependencias
├── .env                 # Variables (no versionar)
├── .env.example         # Ejemplo (versionar)
├── .gitignore
├── docker-compose.yml   # MongoDB local
├── package.json
├── tsconfig.json
├── README.md
├── ARCHITECTURE.md      # Documentación técnica
├── OAUTH_SETUP.md       # Cómo obtener credenciales
└── API_EXAMPLES.md      # Ejemplos de requests
```

## 5️⃣ Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Ejecutar producción
npm start

# Linting
npm run lint

# Formatear código
npm run format

# Tests (cuando estén implementados)
npm test

# Detener MongoDB
docker-compose down

# Ver logs de MongoDB
docker-compose logs -f mongodb
```

## 6️⃣ Variables de Entorno Importantes

| Variable           | Descripción                       | Ejemplo                                  |
| ------------------ | --------------------------------- | ---------------------------------------- |
| `NODE_ENV`         | Ambiente (development/production) | development                              |
| `PORT`             | Puerto del servidor               | 3000                                     |
| `MONGODB_URI`      | URL de conexión a MongoDB         | mongodb://localhost:27017/ml-qna         |
| `ML_CLIENT_ID`     | Client ID de ML                   | 123456789                                |
| `ML_CLIENT_SECRET` | Client Secret de ML               | abc123def456                             |
| `ML_REDIRECT_URI`  | URL de callback OAuth             | http://localhost:3000/api/oauth/callback |
| `JWT_SECRET`       | Clave secreta para JWT            | aRandomSecretString                      |
| `JWT_EXPIRES_IN`   | Expiración del JWT                | 7d                                       |

## 7️⃣ Troubleshooting

### "Connection refused" a MongoDB

```bash
# Iniciar Docker
docker-compose up -d

# O instalar MongoDB localmente
# Ver instrucciones en https://docs.mongodb.com
```

### "Client not found" de Mercado Libre

- Verificar `ML_CLIENT_ID` en `.env`
- Regenerar credenciales en panel de ML

### "Invalid redirect_uri"

- Debe coincidir exactamente con la URL en panel de ML
- Incluir protocolo: `http://` o `https://`

### Puerto 3000 en uso

```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso en puerto 3000
# Linux/macOS
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB no se conecta

```bash
# Verificar que está corriendo
docker ps

# Si no está, iniciar
docker-compose up -d

# Ver logs
docker-compose logs mongodb
```

## 8️⃣ Próximos Pasos

1. ✅ Proyecto inicializado
2. ✅ OAuth configurado
3. ✅ API Q&A lista
4. ⏭️ Crear frontend
5. ⏭️ Implementar webhooks
6. ⏭️ Agregar tests
7. ⏭️ Desplegar a producción

## 9️⃣ Recursos Adicionales

- [README.md](./README.md) - Documentación completa
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura técnica
- [OAUTH_SETUP.md](./OAUTH_SETUP.md) - Setup OAuth detallado
- [API_EXAMPLES.md](./API_EXAMPLES.md) - Ejemplos de requests
- [Mercado Libre Docs](https://developers.mercadolibre.com.ar/)

## 🆘 Soporte

Si tienes problemas:

1. Revisar logs: `npm run dev` mostrará errores
2. Revisar `.env` - asegurar todas las variables
3. Revisar MongoDB esté corriendo
4. Consultar documentación oficial en carpeta `docs/`
5. Revisar console del navegador (dev tools)

---

**¡Listo! Tu servidor está ejecutándose. Ahora puedes empezar a integrar con Mercado Libre.** 🎉
