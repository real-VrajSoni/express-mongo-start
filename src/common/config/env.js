import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/express_mongo_start',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error('PORT must be a number between 1 and 65535');
}
