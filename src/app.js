import express from 'express';
import cors from 'cors';
import authRoutes from './module/auth/routes.js';
import errorHandler from './common/middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to your API!' });
});

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

export default app;
