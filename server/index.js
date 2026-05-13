import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Route imports
import analyzeRoutes from './routes/analyze.js';
import statusRoutes from './routes/status.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // For development/local D3 scripts if needed
}));
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(morgan(':timestamp :method :url :status :res[content-length] - :response-time ms'));

// Custom morgan token for timestamp
morgan.token('timestamp', () => new Date().toISOString());

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/status', statusRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${new Date().toISOString()}:`, err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`[RepoLens] Server running on port ${PORT}`);
  console.log(`[RepoLens] Environment: ${process.env.NODE_ENV || 'development'}`);
});
