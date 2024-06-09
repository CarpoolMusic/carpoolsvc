/**
 * SocketHandler class
 * Manages socket connections, disconnections, and message routing.
 * Entry point for all socket interactions and acts as a bridge between the socket server and the rest of the application.
 */
import { type Server, type Socket } from 'socket.io';
import { EVENTS } from '../models/events';
import { type AddSongRequest, type RemoveSongRequest, type CreateSessionRequest, type CreateSessionResponse, type ErrorResponse, type JoinSessionRequest, type JoinSessionResponse, type User, type VoteSongRequest, type VoteSongEvent, type SongAddedEvent, type SongRemovedEvent, type Song } from "../schema/socketEventSchema";
import { sessionManager } from './musicSessionManager';

export class SocketHandler {
    private readonly io: Server;

    constructor(io: Server) {
        this.io = io;
        this.initializeSocketEvents();
    }

    private initializeSocketEvents(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.emit(EVENTS.CONNECTED);

            // Listen for create session event
            socket.on(EVENTS.CREATE_SESSION, async (data: Buffer) => {
                const createSessionRequest: CreateSessionRequest = JSON.parse(data.toString());
                await this.handleCreateSession(socket, createSessionRequest);
            });

            // Listen for join session event
            socket.on(EVENTS.JOIN_SESSION, async (data: JoinSessionRequest, ack: (arg0: { status: string; message?: string; }) => void) => {
                const joinSessionRequest: JoinSessionRequest = data;
                await this.handleJoinSession(socket, joinSessionRequest).then(() => {
                    ack({ status: 'success' });
                }).catch((error) => {
                    ack({ status: 'error', message: `Failed to join session with error ${error.message}` });
                });
            });

            // Listen for add song event.
            socket.on(EVENTS.ADD_SONG, async (data: AddSongRequest, ack: (arg0: { status: string; message?: string; }) => void) => {
                const addSongRequest: AddSongRequest = data;

                await this.handleAddSong(socket, addSongRequest).then(() => {
                    ack({ status: 'success' });
                }).catch((error) => {
                    ack({ status: 'error', message: `Failed to add song to session with error ${error.message}` });
                });
            });

            // Listen for remove song event.
            socket.on(EVENTS.REMOVE_SONG, (data: Buffer) => {
                try {
                    const removeSongRequest: RemoveSongRequest = JSON.parse(data.toString());
                    this.handleRemoveSong(socket, removeSongRequest);
                } catch (e) {
                    console.log(e);
                }
            });

            socket.on(EVENTS.VOTE_SONG, (data: Buffer) => {

                const voteSongRequest: VoteSongRequest = JSON.parse(data.toString());
                this.handleVoteSong(socket, voteSongRequest);
            });

            socket.on('disconnect', () => {
                socket.emit(EVENTS.DISCONNECTED);
            });
        });
    }

    private async handleCreateSession(socket: Socket, createSessionRequest: CreateSessionRequest): Promise<void> {
        const socketID: string = socket.id;
        const hostId = createSessionRequest.hostId;
        const sessionName = createSessionRequest.sessionName;
        const user: User = { socketId: socketID, userId: hostId };
        const sessionId: string = sessionManager.createSession(user, sessionName);

        // Join the user to the socket session room
        await socket.join(sessionId);

        // Build createSessionResponse
        const createSessionResponse: CreateSessionResponse = {
            sessionId
        };

        // Send the session ID back to the client
        socket.emit(EVENTS.SESSION_CREATED, createSessionResponse);
    }

    private async handleJoinSession(socket: Socket, joinSessionRequest: JoinSessionRequest): Promise<void> {
        // Join the user to the session room
        const socketID: string = socket.id;
        try {
            const user: User = { socketId: socketID, userId: joinSessionRequest.userId }
            const sessionId = joinSessionRequest.sessionId;
            sessionManager.joinSession(sessionId, user);

            // Join the user to the socket session room
            await socket.join(sessionId);

            // Notify the room that the user has joined
            socket.to(sessionId).emit(EVENTS.USER_JOINED, user);

            // Build the response
            const joinSessionResponse: JoinSessionResponse = {
                users: ((sessionManager.getSession(sessionId)?.getUsers() ?? []))
            }

            // send the response
            socket.emit(EVENTS.SESSION_JOINED, joinSessionResponse)
        } catch (error: unknown) {
            // Build error response
            const errorResponse: ErrorResponse = {
                type: 'error',
                message: 'Error joining session',
                stack_trace: '',
            };
            socket.emit(EVENTS.ERROR, errorResponse);
        }
    }

    private async handleAddSong(socket: Socket, addSongRequest: AddSongRequest): Promise<void> {
        const sessionId = addSongRequest.sessionId;
        const song: Song = addSongRequest.song;
        const session = sessionManager.getSession(sessionId);

        const songAddedEvent: SongAddedEvent = {
            song: song
        }

        // attempt to resolve song by using some sort of DB lookup.

        if (session) {
            session.addSong(song);
            this.io.in(sessionId).emit(EVENTS.SONG_ADDED, songAddedEvent);
        } else {
            console.log("Could not find session to broadcast song added");
        }
    }

    private handleRemoveSong(socket: Socket, removeSongRequest: RemoveSongRequest): void {
        const sessionId = removeSongRequest.sessionId;
        const songId: string = removeSongRequest.id;
        const session = sessionManager.getSession(sessionId);

        if (session) {
            session.removeSong(songId);
            // Build the broadcast event
            const songRemovedEvent: SongRemovedEvent = {
                id: songId
            };
            this.io.in(sessionId).emit(EVENTS.SONG_REMOVED, songRemovedEvent);
        } else {
            // Build error response
            console.log("Could not find session to broadcast song removed");
        }
    }

    private handleVoteSong(socket: Socket, voteSongRequest: VoteSongRequest): void {
        const sessionId = voteSongRequest.sessionId;
        const songId = voteSongRequest.id;
        const vote = voteSongRequest.vote;
        const session = sessionManager.getSession(sessionId);

        if (session) {
            session.voteOnSong(songId, vote);
            const voteSongEvent: VoteSongEvent = {
                id: songId,
                vote
            }
            this.io.in(sessionId).emit(EVENTS.SONG_VOTED, voteSongEvent);
        } else {
            console.log("Error voting on song");
        }
    }
}