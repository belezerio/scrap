import app from './app';
import { config } from './config/env';

const server = app.listen(config.PORT, () => {
  console.log(`🚀 Backend Server running in [${config.NODE_ENV}] mode on port http://localhost:${config.PORT}`);
});

const handleShutdown = (signal: string) => {
  console.log(`\n⚠️ ${signal} signal received. Closing HTTP server...`);
  server.close(() => {
    console.log('🛑 HTTP server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
