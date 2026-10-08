import express from 'express';
import cors from 'cors';
import authRoutes from './module/auth/routes.js';
import errorHandler from './common/middleware/errorHandler.js';
import sendResponse from './common/utils/ApiResponse.js';
import ApiError from './common/utils/ApiError.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  sendResponse(res, 200, 'Welcome to your API!');
});

app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

app.use(errorHandler);

export default app;
