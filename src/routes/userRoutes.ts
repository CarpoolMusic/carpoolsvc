import express from 'express';
import { login } from './login';
import { createMusicSession } from './createMusicSession';
import { createAccount } from './createAccount';
import { authenticateJWT } from '@server/middleware';

const router = express.Router();

router.post('/login', (req, res) => {
    void login(req, res);
});

router.post('/createMusicSession', authenticateJWT, (req, res) => {
    void createMusicSession(req, res);
});

router.post('/createAccount', (req, res) => {
    void createAccount(req, res);
});

export default router;