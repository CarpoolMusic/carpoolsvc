/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import express, { type Request, type Response } from 'express';
import { type CreateSessionRequest, type CreateSessionResponse, type User } from '../schema/socketEventSchema';
import { sessionManager } from '../services/sessionManager';

const router = express.Router();

// router.post('/login', async (req: Request, res: Response) => {
//     const body: LoginRequest = req.body;

//     try {
//         const username: string = body.username;
//         const password: string = body.password;

//         if ((username === "") || (password === "") === undefined) {
//             return res.status(400).json({ success: false, message: 'Username and password are required' });
//         }
//     }


//         // try {
//         //     const user = await userManager.getUserByEmail(username);

//         //     if (user && await userManager.comparePassword(user.password_hash, password)) {
//         //         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         //         res.status(200).json({ token });
//         //     } else {
//         //         res.status(401).json({ error: 'Invalid credentials' });
//         //     }
//         // } catch (err) {
//         //     res.status(500).json({ error: 'Error logging in' });
//         // }


//         //     if (!user) {
//         //         return res.status(401).json({ success: false, message: 'Invalid username or password' });
//         //     }

//         //     const response: LoginResponse = {
//         //         user,
//         //     };

//         //     res.status(200).json(response);
//         // } catch (error) {
//         //     // Handle errors, possibly from login logic
//         //     console.error('Error logging in:', error);
//         //     res.status(500).json({ success: false, message: 'Internal server error' });
// });

router.post('/create-session', (req: Request, res: Response) => {
    const body: CreateSessionRequest = req.body;


    try {
        const hostId: string = body.hostId;
        const socketId: string = body.socketId;
        const sessionName: string = body.sessionName;

        console.log(hostId, socketId, sessionName);

        if ((!hostId) || (!sessionName) === undefined) {
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