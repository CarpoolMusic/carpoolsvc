import express from 'express';
import { login } from './login';
import { createMusicSession } from './createMusicSession';

const router = express.Router();

router.post('/login', (req, res) => {
    void login(req, res);
});
router.post('/createMusicSession', (req, res) => {
    void createMusicSession(req, res);
});

export default router;