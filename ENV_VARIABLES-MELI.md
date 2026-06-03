# 🔐 Variables de Entorno - Referencia Rápida

## Configuración Requerida

### Mercado Libre OAuth

| Variable           | Descripción                    | Obtener desde                                                            | Default                                    |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------ |
| `ML_CLIENT_ID`     | ID de aplicación Mercado Libre | [Developers ML](https://developers.mercadolibre.com.ar/) → Mi Aplicación | ❌ Requerido                               |
| `ML_CLIENT_SECRET` | Clave secreta Mercado Libre    | [Developers ML](https://developers.mercadolibre.com.ar/) → Mi Aplicación | ❌ Requerido                               |
| `ML_REDIRECT_URI`  | URI de redirección OAuth       | Configurar en [Developers ML](https://developers.mercadolibre.com.ar/)   | `http://localhost:3000/api/oauth/callback` |

### Base de Datos

| Variable      | Descripción        | Obtener desde                                                | Default                            |
| ------------- | ------------------ | ------------------------------------------------------------ | ---------------------------------- |
| `MONGODB_URI` | Conexión a MongoDB | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) o local | `mongodb://localhost:27017/ml-qna` |

### Autenticación JWT

| Variable         | Descripción                   | Valor                    | Default                               |
| ---------------- | ----------------------------- | ------------------------ | ------------------------------------- |
| `JWT_SECRET`     | Clave secreta para firmar JWT | Generar una clave fuerte | `dev-secret-key-change-in-production` |
| `JWT_EXPIRES_IN` | Expiración del token          | Ej: `7d`, `24h`, `30d`   | `7d`                                  |

### Aplicación

| Variable      | Descripción           | Valores posibles                    | Default                 |
| ------------- | --------------------- | ----------------------------------- | ----------------------- |
| `NODE_ENV`    | Entorno de ejecución  | `development`, `production`, `test` | `development`           |
| `PORT`        | Puerto del servidor   | Número (1-65535)                    | `3000`                  |
| `CORS_ORIGIN` | Origen permitido CORS | URL válida                          | `http://localhost:3000` |

### Cache & Logging (Opcional)

| Variable    | Descripción                          | Valor                            | Default         |
| ----------- | ------------------------------------ | -------------------------------- | --------------- |
| `CACHE_TTL` | Tiempo de vida del caché en segundos | Número                           | `3600` (1 hora) |
| `LOG_LEVEL` | Nivel de logging                     | `debug`, `info`, `warn`, `error` | `info`          |

---

## 📋 Archivo `.env` Ejemplo

```env
# Mercado Libre
ML_CLIENT_ID=your_client_id_here
ML_CLIENT_SECRET=your_client_secret_here
ML_REDIRECT_URI=http://localhost:3000/api/oauth/callback

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/ml-qna

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Aplicación
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Cache & Logging (Opcional)
CACHE_TTL=3600
LOG_LEVEL=info
```

---
