import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ml-qna',
  },

  mercadoLibre: {
    clientId: process.env.ML_CLIENT_ID || '',
    clientSecret: process.env.ML_CLIENT_SECRET || '',
    redirectUri: process.env.ML_REDIRECT_URI || 'http://localhost:3000/api/oauth/callback',
    authUrl: process.env.ML_AUTH_URL || 'https://auth.mercadolibre.com.ar/authorization',
    tokenUrl: process.env.ML_TOKEN_URL || 'https://api.mercadolibre.com/oauth/token',
    apiBaseUrl: 'https://api.mercadolibre.com',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Validate critical configuration
if (config.mercadoLibre.clientId === '') {
  console.warn('Warning: ML_CLIENT_ID is not set');
}
if (config.mercadoLibre.clientSecret === '') {
  console.warn('Warning: ML_CLIENT_SECRET is not set');
}
