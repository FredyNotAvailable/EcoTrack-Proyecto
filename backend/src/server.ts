import app from './app';
import { env } from './config/env';

export const startServer = () => {
    const PORT = env.PORT || 3001;

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`🌍 Entorno: ${env.NODE_ENV}`);
    });
};
