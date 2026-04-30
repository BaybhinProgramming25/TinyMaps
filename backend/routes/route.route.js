import express from 'express';
import { getRoute } from '../controllers/route.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/api/route', verifyToken, getRoute);

export default router;
