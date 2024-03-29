/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import express, { type Request, type Response } from 'express';
import { type CreateSessionRequest, type CreateSessionResponse, type User } from '../services/schema/socketEventSchema';
import { sessionManager } from '../services/sessionManager';
// If using Express < 4.16, you need to separately import body-parser

const router = express.Router();

router.post('/create-session', (req: Request, res: Response) => {
    const body: CreateSessionRequest = req.body;

    try {
        const hostId: string = body.hostId;
        const socketId: string = body.socketId;
        const sessionName: string = body.sessionName;

        console.log(hostId, socketId, sessionName);

        if ((!hostId) || (!socketId) || (!sessionName) === undefined) {
            return res.status(400).json({ success: false, message: 'Session name is required' });
        }

        const user: User = { socketId, userId: hostId }
        const sessionId: string = sessionManager.createSession(user, sessionName);

        const response: CreateSessionResponse = {
            sessionId,
        };

        res.status(201).json(response);
    } catch (error) {
        // Handle errors, possibly from session creation logic
        console.error('Error creating session:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;