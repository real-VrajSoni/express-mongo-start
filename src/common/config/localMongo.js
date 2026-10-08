import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';

// A real local MongoDB process. Its files persist in this ignored folder.
const dbPath = resolve('.mongo-data');
mkdirSync(dbPath, { recursive: true });
const mongo = new MongoMemoryServer({
  binary: { version: '8.2.6' },
  instance: { port: 27017, dbPath, storageEngine: 'wiredTiger' },
});

try {
  await mongo.start(true); // Use the same port as .env.example.
  console.log('Local MongoDB is running at mongodb://127.0.0.1:27017');
  console.log('Keep this terminal open. Run npm run dev in another terminal.');

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await mongo.stop();
      process.exit(0);
    });
  }
} catch (error) {
  console.error('Could not start local MongoDB:', error.message);
  console.error('If MongoDB is already running on port 27017, use it and skip npm run db.');
  process.exit(1);
}
