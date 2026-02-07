import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import router from './routes';
import { errorHandler } from './middlewares/error.handler';
import { etagMiddleware } from './middlewares/etag.middleware';
import { env } from './config/env';

const app: Application = express();

// Rate Limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'production' ? 100 : 1000,
    message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiadas solicitudes, intenta más tarde' } },
    standardHeaders: true,
    legacyHeaders: false
});

// Middlewares
app.use(compression()); // Gzip compression
app.use(helmet());
app.use(cors({
    origin: env.NODE_ENV === 'production' 
        ? ['https://ecotrack.vercel.app', 'https://ecotrack.app'] 
        : '*',
    credentials: true
}));
app.use(limiter);
app.use(etagMiddleware); // ETags para caching condicional
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', router);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
