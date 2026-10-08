import mongoose from 'mongoose';
import app from './src/app.js';
import { env } from './src/common/config/env.js';
import connectDB from './src/common/config/db.js';
import User from './src/module/auth/model.js';

try {
  await connectDB();
  await User.init(); // Build the unique email index before accepting requests.

  const server = app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
  });
  server.on('error', (error) => {
    console.error('Could not start the server:', error.message);
    process.exit(1);
  });

  // Close the database connection when you stop the server with Ctrl+C.
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });
  }
} catch (error) {
  console.error('Startup failed:', error.message);
  console.error('For local MongoDB, run npm run db in another terminal.');
  await mongoose.disconnect();
  process.exit(1);
}
