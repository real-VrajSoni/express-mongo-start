import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/common/config/db.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to MongoDB before starting the server.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not start the server:', error.message);
    process.exit(1);
  }
}

startServer();
