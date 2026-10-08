import { once } from 'node:events';
import app from './src/app.js';
import { env } from './src/common/config/env.js';
import { connectDatabase, disconnectDatabase } from './src/common/config/database.js';
import { User } from './src/modules/users/user.model.js';

let server;
let shuttingDown = false;

async function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal}: shutting down`);
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  try {
    if (server?.listening) {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
    await disconnectDatabase();
    clearTimeout(timeout);
    process.exit(exitCode);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await connectDatabase();
  // Build the example's unique email index before accepting writes.
  // Larger production apps should manage indexes through migrations.
  await User.init();
  server = app.listen(env.port);
  await once(server, 'listening');
  console.log(`API listening at http://localhost:${env.port}`);
  server.on('error', (error) => {
    console.error('HTTP server error:', error);
    void shutdown('server error', 1);
  });
} catch (error) {
  console.error('Startup failed:', error.message);
  await shutdown('startup error', 1);
}
