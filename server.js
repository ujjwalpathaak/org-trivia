dotenv.config();

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { connectDatabase } from './Database.js';
import { startJobs } from './jobs/index.js';
import { isProduction, logService } from './middleware/utils.js';
import router from './routes/router.js';

const app = express();
const isProductionServer = isProduction();

const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGINS = isProductionServer
  ? process.env.CORS_ORIGIN?.split(',')
  : '*';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({ origin: ALLOWED_ORIGINS }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

connectDatabase();
isProductionServer && startJobs();

app.use('/', router);

app.use(logService);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
