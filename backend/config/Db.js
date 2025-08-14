import mongoose from 'mongoose';
import { env } from './env.js';

let hasConnected = false;

export async function connectDB() {
  if (hasConnected) return;
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || (process.env.DB_DRIVER || 'memory') === 'memory') {
    console.warn('DB in memory mode or MONGODB_URI not set; skipping MongoDB connection');
    hasConnected = true;
    return;
  }
  try {
    await mongoose.connect(mongoUri, {

      // Prefer IPv4 in environments where IPv6 DNS can cause timeouts
      family: 4,
      // Fail faster instead of hanging for a long time on DNS/server selection
      serverSelectionTimeoutMS: 10000,
    });
    hasConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
}

export default mongoose;