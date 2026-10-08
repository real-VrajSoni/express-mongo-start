import mongoose from 'mongoose';

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Add MONGODB_URI to your .env file');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

export default connectDB;
