import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';
import { errorHandler } from './middlewares/error.handler';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', router);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
