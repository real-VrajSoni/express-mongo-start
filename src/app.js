import express from 'express';
import cors from 'cors';
import itemRoutes from './routes/itemRoutes.js';

const app = express();

app.use(cors()); // Let your frontend call this API.
app.use(express.json()); // Read JSON sent in requests.

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to your API!' });
});

app.use('/api/items', itemRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Express 5 sends errors from async routes here.
app.use((error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  // Express uses a status code for errors such as invalid JSON.
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: 'Something went wrong' });
});

export default app;
