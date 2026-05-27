import mongoose from 'mongoose';
import { config } from '../config/index.js';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.database.uri);
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✓ Database disconnected');
  } catch (error) {
    console.error('✗ Database disconnection failed:', error);
    throw error;
  }
}

export default mongoose;
