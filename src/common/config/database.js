import mongoose from 'mongoose';
import { env } from './env.js';

// Fail requests promptly if the database connection is unavailable.
mongoose.set('bufferCommands', false);

export async function connectDatabase() {
  if (!env.mongodbUri) throw new Error('MONGODB_URI is required; copy env.example to .env');
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
