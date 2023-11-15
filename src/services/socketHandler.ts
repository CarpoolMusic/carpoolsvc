/**
 * SocketHandler class
 * Manages socket connections, disconnections, and message routing.
 * Entry point for all socket interactions and acts as a bridge between the socket server and the rest of the application.
 */
import { Server, Socket } from 'socket.io';
import SessionManager from './sessionManager';
import Session  from '../models/session';
import { CreateSessionRequest, CreateSessionResponse, JoinSessionRequest, JoinSessionResponse, ErrorResponse, User } from "../schema/socketEventSchema";
import { EVENTS } from '../models/events';

export class SocketHandler {
    private io: Server;
    private sessionManager: SessionManager;    

    constructor(io: Server, sessionManager: SessionManager) {
        this.io = io;
        this.sessionManager = sessionManager;
        this.initializeSocketEvents();
    }

    private initializeSocketEvents(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('clientConnected:', socket.id);
            socket.emit(EVENTS.CONNECTED);

            // Listen for create session event
            socket.on(EVENTS.CREATE_SESSION, (createSessionRequest: CreateSessionRequest) => {
                console.log("createSessionRequest");
                console.log("THIS IS CREATE SESSION ", createSessionRequest.hostId);
                this.handleCreateSession(socket, createSessionRequest);
            });

            // Listen for join session event
            socket.on(EVENTS.JOIN_SESSION, (joinSessionRequest: JoinSessionRequest) => {
                console.log("joinSessionRequest");
                this.handleJoinSession(socket, joinSessionRequest);
            });

            // Listen for add song event.
            // socket.on(EVENTS.SONG_ADDED, (addSongRequest: AddSongRequest)=> {

            // });

            socket.on('disconnect', () => {
                socket.emit(EVENTS.DISCONNECTED);
                console.log('Client disconnected');
            });
        });
    }

    private handleCreateSession(socket: Socket, createSessionRequest: CreateSessionRequest): void {

        const socketID: string = socket.id;
        const hostId = createSessionRequest.hostId;
        const sessionName = createSessionRequest.sessionName;
        const user: User = { socketId: socketID, userId: hostId };
        const sessionId: string = this.sessionManager.createSession(user, sessionName);

        console.log("HANDLING CREATE SESSION");

        // Join the user to the socket session room
        socket.join(sessionId);

        // Build createSessionResponse
        const createSessionResponse: CreateSessionResponse = {
            sessionId: sessionId
        };
        console.log("resp", createSessionResponse);
        
        
        // Send the session ID back to the client
        socket.emit(EVENTS.SESSION_CREATED, createSessionResponse);
    }

    private handleJoinSession(socket: Socket, joinSessionRequest: JoinSessionRequest) {
        // Join the user to the session room
        const socketID: string = socket.id;
        try {
            const user: User = { socketId: socketID, userId: joinSessionRequest.userId}
            const sessionId = joinSessionRequest.sessionId;
            this.sessionManager.joinSession(sessionId, user);

            // Join the user to the socket session room
            socket.join(sessionId);

            // Notify the room that the user has joined
            socket.to(sessionId).emit(EVENTS.USER_JOINED);
            
            // Build the response
            const joinSessionResponse: JoinSessionResponse = {
                users: this.sessionManager.getSession(sessionId)?.getUsers() || []
            }

            // send the response
            socket.emit(EVENTS.SESSION_JOINED, joinSessionResponse)
        } catch (error: any) {
            // Build error response
            const errorResponse: ErrorResponse = {
                type: 'error',
                message: error.message,
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