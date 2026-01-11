import { startServer } from './server';

// Punto de entrada principal
try {
    startServer();
} catch (error) {
    console.error('💥 Error fatal al iniciar el servidor:', error);
    process.exit(1);
}
