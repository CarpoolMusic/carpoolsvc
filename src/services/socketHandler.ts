/**
 * SocketHandler class
 * Manages socket connections, disconnections, and message routing.
 * Entry point for all socket interactions and acts as a bridge between the socket server and the rest of the application.
 */
import { create } from 'domain';
import { Server, Socket } from 'socket.io';
import { EVENTS } from '../models/events';
import { AddSongRequest, RemoveSongRequest, CreateSessionRequest, CreateSessionResponse, ErrorResponse, JoinSessionRequest, JoinSessionResponse, User, VoteSongRequest, VoteSongEvent, SongAddedEvent, SongRemovedEvent, Song, Convert } from "../schema/socketEventSchema";
import SessionManager from './sessionManager';

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
            socket.on(EVENTS.CREATE_SESSION, (data: Buffer) => {
                console.log("createSessionRequest");
                const createSessionRequest: CreateSessionRequest = JSON.parse(data.toString());
                this.handleCreateSession(socket, createSessionRequest);
            });

            // Listen for join session event
            socket.on(EVENTS.JOIN_SESSION, (data: Buffer) => {
                console.log("joinSessionRequest");
                this.handleJoinSession(socket, JSON.parse(data.toString()));
            });

            // Listen for add song event.
            socket.on(EVENTS.ADD_SONG, (data: Buffer)=> {
                console.log("Add song request");
                try {
                    this.handleAddSong(socket, JSON.parse(data.toString()));
                } catch (e) {
                    console.log(e);
                }
            });

            // Listen for remove song event.
            socket.on(EVENTS.REMOVE_SONG, (data: Buffer)=> {
                console.log("Remove song request");
                try {
                    this.handleRemoveSong(socket, JSON.parse(data.toString()));
                } catch (e) {
                    console.log(e);
                }
            });

            socket.on(EVENTS.VOTE_SONG, (data: Buffer) => {
                console.log("voteSongRequest");

                const voteSongRequest: VoteSongRequest = JSON.parse(data.toString());
                this.handleVoteSong(socket, voteSongRequest);
            });

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

        // Join the user to the socket session room
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
            this.sessionManager.joinSession(sessionId, user);

            // Join the user to the socket session room
            socket.join(sessionId);

            // Notify the room that the user has joined
            socket.to(sessionId).emit(EVENTS.USER_JOINED, user);
            
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

    private handleAddSong(socket: Socket, addSongRequest: AddSongRequest): void {
        console.log("handleAddSong");

        const sessionId = addSongRequest.sessionId;
        const song: Song = addSongRequest.song;
        const session = this.sessionManager.getSession(sessionId);

        if (session) {
            // Build the broadcast event
            const songAddedEvent: SongAddedEvent = {
                song: song
            };
            session.addSong(song);
            this.io.in(sessionId).emit(EVENTS.SONG_ADDED, songAddedEvent);
        } else {
            // Build error response
            console.log("Could not find session to broadcast song added");
        }
    }

    private handleRemoveSong(socket: Socket, removeSongRequest: RemoveSongRequest): void {
        console.log("handleRemoveSong");

        const sessionId = removeSongRequest.sessionId;
        const songId: string = removeSongRequest.songId;
        const session = this.sessionManager.getSession(sessionId);

        if (session) {
            session.removeSong(songId);
            // Build the broadcast event
            const songRemovedEvent: SongRemovedEvent = {
                songId: songId
            };
            this.io.in(sessionId).emit(EVENTS.SONG_REMOVED, songRemovedEvent);
        } else {
            // Build error response
            console.log("Could not find session to broadcast song removed");
        }
    }

    private handleVoteSong(socket: Socket, voteSongRequest: VoteSongRequest): void {

        console.log("handleVoteSong");

        console.log(voteSongRequest);
        console.log(voteSongRequest.sessionId);

        const sessionId = voteSongRequest.sessionId;
        const songId = voteSongRequest.songId;
        const vote = voteSongRequest.vote;
        const session = this.sessionManager.getSession(sessionId);

        if (session) {
            session.voteOnSong(songId, vote);
            const voteSongEvent: VoteSongEvent = {
                songId: songId,
                vote: vote
            }
            this.io.in(sessionId).emit(EVENTS.SONG_VOTED, voteSongEvent);
        } else {
            console.log("Error voting on song");
        }
    }
}