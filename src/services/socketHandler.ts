/**
 * SocketHandler class
 * Manages socket connections, disconnections, and message routing.
 * Entry point for all socket interactions and acts as a bridge between the socket server and the rest of the application.
 */
import { SocketAddress } from 'net';
import { Server, Socket } from 'socket.io';
import { sessionManager } from './sessionManager';
import { Convert, CreateSessionRequest } from "../schema/socketEventSchema";

export class SocketHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        this.initializeSocketEvents();
    }

    private initializeSocketEvents(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('clientConnected:', socket.id);
            socket.emit('connected', { status: 'connected' });

            // Listen for create session event
            socket.on(EVENTS.CREATE_SESSION, (createSessionRequestJSON: string) => {
                const createSessionRequest = Convert.toSocketEventSchema(createSessionRequestJSON);
                this.handleCreateSession(createSessionRequest);

            });

            // Listen for join session event
            socket.on(EVENTS.JOIN_SESSION, (joinSessionReqestSchema: string) => {
                const joinSessionRequest = Convert.toSocketEventSchema(joinSessionReqestSchema);
                this.handleJoinSession(socket, joinSessionRequest);
            });


            socket.on('join session', (sessionId: string) => {
                const session = sessionManager.getSession(sessionId);

                if (session) {
                    socket.join(sessionId);
                    session.join(socket.id);
                    socket.emit('session joined', sessionId);
                } else {
                    socket.emit('error', 'Invalid session ID ( join session )');
                }
            });

            // ... Other socket.on handlers ...

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    private handleCreateSession(createSessionRequest: CreateSessionRequest): void {
        const sessionId = sessionManager.createSession(socket.id);

        // Join the user to the session room
        socket.join(sessionId);

        // Send the sesison ID back to the client
        socket.emit(EVENTS.SESSION_CREATED, sessionId)
    }

    private handleJoinSession(joinSessionRequest: JoinSessi): void {
        const session = sessionManager.getSession(sessionId);
    }

    // ... Other helper methods ...
}