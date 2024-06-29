import express from 'express';
import { login } from './login';
import { createMusicSession } from './createMusicSession';
import { createUser } from './createUser';

const router = express.Router();

router.post('/login', (req, res) => {
    void login(req, res);
});

router.post('/createMusicSession', (req, res) => {
    void createMusicSession(req, res);
});

router.post('/createUser', (req, res) => {
    void createUser(req, res);
});

export default router;