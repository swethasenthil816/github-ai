import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests (development friendly)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Setup express JSON body parsing
app.use(express.json());

// Main backend routes
app.use('/api', analyzeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'AI GitHub Project Explainer Server is running'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GlobalErrorHandler]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Launch server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 API Endpoint: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
