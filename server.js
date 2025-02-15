dotenv.config();

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import router from "./routes/router.js";

import { isProduction, logService } from "./utils.js";
import { connectDatabase } from "./Database.js";

const app = express();

const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGINS = isProduction() ? process.env.CORS_ORIGIN?.split(",") : "*";

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logService);

connectDatabase();

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});