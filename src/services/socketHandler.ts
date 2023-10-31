/**
 * SocketHandler class
 * Manages socket connections, disconnections, and message routing.
 * Entry point for all socket interactions and acts as a bridge between the socket server and the rest of the application.
 */
import { Server, Socket } from 'socket.io';
import { sessionManager } from './sessionManager';
import Session  from '../models/session';
import { CreateSessionRequest, CreateSessionResponse, JoinSessionRequest, JoinSessionResponse, ErrorResponse, User } from "../schema/socketEventSchema";
import { EVENTS } from '../models/events';

export class SocketHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        this.initializeSocketEvents();
    }

    private initializeSocketEvents(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('clientConnected:', socket.id);
            socket.emit(EVENTS.CONNECTED);

            // Listen for create session event
            socket.on(EVENTS.CREATE_SESSION, (createSessionRequest: CreateSessionRequest) => {
                console.log('createSessionRequest');
                this.handleCreateSession(socket, createSessionRequest);
            });

            // Listen for join session event
            socket.on(EVENTS.JOIN_SESSION, (joinSessionRequest: JoinSessionRequest) => {
                console.log("joinSessionRequest");
                this.handleJoinSession(socket, joinSessionRequest);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    private handleCreateSession(socket: Socket, createSessionRequest: CreateSessionRequest): void {

        const socketID: string = socket.id;
        const hostId = createSessionRequest.hostId;
        const user: User = { socketId: socketID, userId: hostId };
        const sessionId: string = sessionManager.createSession(user);

        // Join the user to the session room
        socket.join(sessionId);

        // Build createSessionResponse
        const createSessionResponse: CreateSessionResponse = {
            sessionId: sessionId
        };

        // Send the session ID back to the client
        socket.emit(EVENTS.SESSION_CREATED, createSessionResponse);
    }

    private handleJoinSession(socket: Socket, joinSessionRequest: JoinSessionRequest) {
        // Join the user to the session room
        const socketID: string = socket.id;
        try {
            const user: User = { socketId: socketID, userId: joinSessionRequest.userId}
            const sessionId = joinSessionRequest.sessionId;
            sessionManager.joinSession(sessionId, user);
        } catch (error: any) {
            // Build error response
            const errorResponse: ErrorResponse = {
                type: 'error',
                message: error.message,
                stack_trace: '',
            };
            socket.emit(EVENTS.ERROR, errorResponse);
            return;
        }

        // Build joinSessionResponse
        const session: Session | undefined = sessionManager.getSession(joinSessionRequest.sessionId);
        if (session) {
            const users: User[] = session.getUsers();
            const joinSessionResponse: JoinSessionResponse = {
                users: users,
            };
            socket.emit(EVENTS.SESSION_JOINED, joinSessionResponse);
        } else {
            const errorResponse: ErrorResponse = {
                type: 'error',
                message: 'Session not found',
                stack_trace: '',
            };
            socket.emit(EVENTS.ERROR, errorResponse);
        }
    }

    // private handleJoinSession(joinSessionRequest: JoinSessi): void {
    //     const session = sessionManager.getSession(sessionId);
    // }

    // ... Other helper methods ...
}