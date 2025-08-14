import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { env } from './config/env.js';
import { connectDB } from './config/Db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const allowedOrigin = env.corsOrigin;
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// MongoDB setup will run before starting server

// Routes
import udyamRoutes from './routes/udyamRoutes.js';
app.use('/api', udyamRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = env.port;
if (env.nodeEnv !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () =>
        console.log(`Backend listening on port ${PORT} (CORS origin: ${allowedOrigin})`)
      );
    })
    .catch((err) => {
      console.error('Failed to start server due to DB error', err);
      process.exit(1);
    });
}

export default app;


