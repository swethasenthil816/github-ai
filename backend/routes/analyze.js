import express from 'express';
import { analyzeRepository } from '../controllers/analyzeController.js';

const router = express.Router();

// Route: POST /api/analyze
router.post('/analyze', analyzeRepository);

export default router;
