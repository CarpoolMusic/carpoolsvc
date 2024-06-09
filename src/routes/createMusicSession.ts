import { type Request, type Response } from 'express';
import { type CreateSessionRequest, type CreateSessionResponse, type User } from '../schema/socketEventSchema';
import { sessionManager } from '../services/musicSessionManager';

export const createMusicSession = async (req: Request, res: Response): Promise<Response> => {
    const body: CreateSessionRequest = req.body;


    try {
        const hostId: string = body.hostId;
        const socketId: string = body.socketId;
        const sessionName: string = body.sessionName;

        if (!hostId || !sessionName) {
            return res.status(400).json({ success: false, message: 'Session name is required' });
        }

        const user: User = { socketId, userId: hostId }
        const sessionId: string = sessionManager.createSession(user, sessionName);

        const response: CreateSessionResponse = {
            sessionId,
        };

        return res.status(201).json(response);
    } catch (error) {
        // Handle errors, possibly from session creation logic
        console.error('Error creating session:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
