import express from 'express';
import { login, signup, refresh, logout } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/api/signup', signup);
router.post('/api/login', login);
router.post('/api/refresh', refresh);
router.post('/api/logout', logout);

export default router;
