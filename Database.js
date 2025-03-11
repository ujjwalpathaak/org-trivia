dotenv.config();

import dotenv from 'dotenv';
import mongoose from 'mongoose';

const DATABASE_URL = process.env.DATABASE_URL;

export const connectDatabase = async () => {
  try {
    if (!DATABASE_URL) {
      throw new Error('not found DATABASE_URL');
    }
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}