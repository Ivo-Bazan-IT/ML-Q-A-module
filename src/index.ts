import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { connectDatabase } from './utils/database.js';
import { logger } from './utils/logger.js';
import { oauthRoutes } from './routes/oauth.js';
import { qnaRoutes } from './routes/qna.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(
  cors({
    origin: config.app.corsOrigin,
    credentials: true,
  })
);

// Request logging middleware
app.use((req, express, next) => {
  const start = Date.now();
  express.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.path}`, {
      duration: `${duration}ms`,
      status: express.statusCode,
    });
  });
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
  });
});

app.use('/api/oauth', oauthRoutes);
app.use('/api/qna', qnaRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(config.app.port, () => {
      logger.info(`Server started`, {
        port: config.app.port,
        environment: config.app.env,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;
