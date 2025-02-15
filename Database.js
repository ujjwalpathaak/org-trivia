dotenv.config();

import dotenv from "dotenv";
import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL;

export const connectDatabase = async () => {
    try {
        if (!DATABASE_URL) {
            throw new Error("not found DATABASE_URL");
        }

        await mongoose.connect(DATABASE_URL);

        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("Database Connection Error:", error.message);
    }
};
