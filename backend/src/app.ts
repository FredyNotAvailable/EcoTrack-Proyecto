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

// LOGGER GLOBAL - Ver todo lo que llega
app.use((req, res, next) => {
    console.log(`[Express] 📢 Hit: ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
    next();
});

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

// Configuración de CORS dinámica
const allowedOrigins = [
    'https://ecotrack.vercel.app',
    'https://ecotrack.app',
    'https://eco-track-proyecto.vercel.app',
    'https://ecotrackproyecto.vercel.app'
];

// Si existe una URL de frontend en el env, la agregamos
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        // En desarrollo o si no hay origen (como móvil/Postman), permitir todo
        if (!origin || env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Intento de acceso bloqueado desde origen no permitido: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
