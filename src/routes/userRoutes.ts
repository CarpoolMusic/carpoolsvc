import express from 'express';
import { login } from './login';
import { createMusicSession } from './createMusicSession';
import { createUser } from './createUser';
import { authenticateJWT } from '@server/middleware';

const router = express.Router();

router.post('/login', (req, res) => {
    void login(req, res);
});

router.post('/createMusicSession', authenticateJWT, (req, res) => {
    void createMusicSession(req, res);
});

router.post('/createUser', authenticateJWT, (req, res) => {
    void createUser(req, res);
});

export default router;