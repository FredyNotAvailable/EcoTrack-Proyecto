import app from './app';
import { env } from './config/env';
import { initCrons } from './config/cron';

export const startServer = () => {
    const PORT = env.PORT || 3001;

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`🌍 Entorno: ${env.NODE_ENV}`);
        
        // Iniciar cron jobs
        initCrons();
    });
};
