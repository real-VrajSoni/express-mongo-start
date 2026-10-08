import express from 'express';
import cors from 'cors';
import { env } from './common/config/env.js';
import authRoutes from './module/auth/routes.js';
import sendResponse from './common/utils/ApiResponse.js';
import notFound from './common/middleware/notFound.js';
import errorHandler from './common/middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  sendResponse(res, 200, 'Welcome to your API!');
});

app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
