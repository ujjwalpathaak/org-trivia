import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

export const connectDatabase = async () => {
  try {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL not found in environment variables.');
    }

    await mongoose.connect(DATABASE_URL);

    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export const dbConnection = mongoose.connection;
