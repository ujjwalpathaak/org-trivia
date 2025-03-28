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

app.use((error, req, res) => {
  error.status = error.status || 500;
  error.message = error.message || 'Server Error';

  console.error(error);

  res.status(error.status).json({
    status: error.status,
    message: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
