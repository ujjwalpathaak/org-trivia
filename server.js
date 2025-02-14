dotenv.config();
import dotenv from "dotenv";
import express from "express";
const app = express();

import cors from "cors";
import router from "./routes/router.js";

const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN?.split(",");

app.use(cors());
// app.use(cors({
//     origin: ALLOWED_ORIGINS,
//     credentials: true
// }));

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});