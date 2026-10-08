import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import userRoutes from './modules/users/user.routes.js';
import { notFound } from './common/middleware/notFound.js';
import { errorHandler } from './common/middleware/errorHandler.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.get('/ready', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ success: connected, database: connected ? 'connected' : 'disconnected' });
});

app.use('/api/v1/users', userRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
