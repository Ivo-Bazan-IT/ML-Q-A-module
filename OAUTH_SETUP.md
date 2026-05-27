# Guía: Obtener Credenciales de Mercado Libre OAuth

Este documento te guiará paso a paso para obtener tus credenciales de OAuth2 de Mercado Libre.

## 1. Crear una Cuenta de Desarrollador

### Si no tienes cuenta:

1. Ir a [Mercado Libre](https://www.mercadolibre.com.ar/)
2. Crear una cuenta vendedor
3. Verificar tu email

### Si ya tienes cuenta:

Simplemente inicia sesión.

## 2. Acceder al Panel de Desarrolladores

1. Ir a [Mercado Libre Developers](https://developers.mercadolibre.com.ar/)
2. Hacer clic en "Mi Aplicación"
3. Seleccionar tu país (Argentina, México, Brasil, etc.)

## 3. Crear una Nueva Aplicación

1. Ir a [https://developers.mercadolibre.com.ar/](https://developers.mercadolibre.com.ar/)
2. Hacer clic en "Crear nueva aplicación"
3. Completar el formulario:
   - **Nombre de la aplicación**: `ML Q&A Manager` (o el nombre que prefieras)
   - **Descripción**: "Aplicación para gestionar preguntas y respuestas en Mercado Libre"
   - **Sitio web**: (opcional) tu sitio web
   - **URL de políticas**: (opcional)
   - **Permitir acceso a cuentas de terceros**: Marcado (para desarrollo/testing)

4. Hacer clic en "Crear aplicación"

## 4. Obtener Client ID y Client Secret

Después de crear la aplicación, encontrarás:

- **Client ID**: Tu identificador único de aplicación
- **Client Secret**: Tu clave secreta (mantenla privada)

**⚠️ IMPORTANTE**: Nunca compartas tu `Client Secret` públicamente.

## 5. Configurar URLs de Redirect

1. En el panel de tu aplicación, ir a la sección "Configuración OAuth"
2. Agregar "URI de redirect autorizado":
   - Para desarrollo local: `http://localhost:3000/api/oauth/callback`
   - Para producción: `https://tu-dominio.com/api/oauth/callback`

3. Hacer clic en "Guardar cambios"

## 6. Configurar Archivo `.env`

En la raíz de tu proyecto, crea un archivo `.env`:

```bash
# Copiar desde .env.example
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Mercado Libre OAuth
ML_CLIENT_ID=your_client_id_from_step_4
ML_CLIENT_SECRET=your_client_secret_from_step_4
ML_REDIRECT_URI=http://localhost:3000/api/oauth/callback

# Base de datos
MONGODB_URI=mongodb://localhost:27017/ml-qna

# JWT
JWT_SECRET=your_strong_secret_key_here
```

## 7. Verificar Acceso

Para verificar que tus credenciales funcionan:

1. Iniciar el servidor:

   ```bash
   npm run dev
   ```

2. En el navegador, ir a:

   ```
   http://localhost:3000/api/health
   ```

   Deberías ver:

   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "environment": "development"
   }
   ```

3. Iniciar flujo de OAuth:

   ```
   POST http://localhost:3000/api/oauth/authorize
   ```

   Deberías recibir una `authUrl` válida.

## 8. Pasos para Pedir Permisos

Para acceder a información de preguntas y respuestas, puede que necesites:

### Permisos Necesarios

- `read:account`: Leer información de tu cuenta
- `offline_access`: Acceso offline (para refresh tokens)
- `write:question`: Responder preguntas
- `read:question`: Leer preguntas

### Solicitar Acceso

1. En el panel de desarrolladores, ir a "Mis Aplicaciones"
2. Seleccionar tu aplicación
3. En la sección de permisos, seleccionar los permisos necesarios
4. Hacer clic en "Actualizar"

## 9. Testing con Postman

### Importar Variables

En Postman, crear un Environment con:

```json
{
  "base_url": "http://localhost:3000",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "redirect_uri": "http://localhost:3000/api/oauth/callback",
  "token": ""
}
```

### Flujo OAuth en Postman

1. **GET Authorization URL**

   ```
   POST {{base_url}}/api/oauth/authorize
   ```

2. **Copiar URL de respuesta** en navegador y autorizar

3. **Procesar Callback**

   ```
   GET {{base_url}}/api/oauth/callback?code=YOUR_CODE&state=YOUR_STATE
   ```

4. **Guardar Token** (copiar desde respuesta y actualizar en Environment)

## 10. Scopes Disponibles en Mercado Libre

| Scope            | Descripción                     |
| ---------------- | ------------------------------- |
| `read:account`   | Leer información de la cuenta   |
| `write:account`  | Modificar información de cuenta |
| `read:feedback`  | Leer calificaciones             |
| `write:feedback` | Escribir calificaciones         |
| `read:question`  | Leer preguntas                  |
| `write:question` | Responder preguntas             |
| `read:message`   | Leer mensajes                   |
| `write:message`  | Enviar mensajes                 |
| `offline_access` | Acceso offline                  |

## 11. URLs Según País

### Argentina

- Auth: `https://auth.mercadolibre.com.ar/authorization`
- Token: `https://api.mercadolibre.com/oauth/token`
- API: `https://api.mercadolibre.com`

### México

- Auth: `https://auth.mercadolibre.com.mx/authorization`
- Token: `https://api.mercadolibre.com/oauth/token`
- API: `https://api.mercadolibre.com`

### Brasil

- Auth: `https://auth.mercadolivre.com.br/authorization`
- Token: `https://api.mercadolibre.com/oauth/token`
- API: `https://api.mercadolibre.com`

### Colombia

- Auth: `https://auth.mercadolibre.com.co/authorization`
- Token: `https://api.mercadolibre.com/oauth/token`
- API: `https://api.mercadolibre.com`

## 12. Troubleshooting

### Error: "Invalid redirect_uri"

- Verificar que la URL en `.env` coincida exactamente con la configurada en el panel
- Incluir el protocolo `http://` o `https://`

### Error: "Client not found"

- Verificar que `ML_CLIENT_ID` sea correcto
- Regenerar las credenciales desde el panel

### Error: "Invalid Client Secret"

- Verificar que `ML_CLIENT_SECRET` sea correcto
- No copiar espacios extras

### El servidor no inicia

- Verificar MongoDB esté corriendo: `docker-compose up -d`
- Verificar variables en `.env`
- Ejecutar: `npm install`

## 13. Seguridad en Producción

Para producción:

1. **Usar HTTPS** en redirect_uri
2. **Cambiar JWT_SECRET** a una clave fuerte
3. **Usar variable de entorno** para secretos (nunca en código)
4. **Habilitar CORS** solo para dominios autorizados
5. **Renovar credenciales** periódicamente
6. **Monitorear** acceso a la API
7. **Implementar rate limiting**
8. **Usar HTTPS** para todas las comunicaciones

## Recursos Útiles

- [Documentación OAuth2 Mercado Libre](https://developers.mercadolibre.com.ar/es_ar/autenticacion-oauth2)
- [API Reference](https://developers.mercadolibre.com.ar/es_ar/reference)
- [Community Forum](https://forum.developers.mercadolibre.com.ar/)

## Soporte

Si tienes problemas:

1. Revisar console del navegador (dev tools)
2. Revisar logs del servidor: `npm run dev` mostrará errores
3. Consultar documentación oficial de ML Developers
4. Contactar soporte de Mercado Libre
