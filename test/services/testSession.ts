import { CreateSessionRequest, CreateSessionResponse, JoinSessionRequest, JoinSessionResponse, User } from '../../src/schema/socketEventSchema';
import { EVENTS } from '../../src/models/events';

import {
    setupServerAndSockets,
    setupGlobalListeners,
    closeConnections,
    createTestSession,
    testUserId,
    testSessionName,
    otherUserId,
    sessionCreatedPromise,
    joinSessionPromise,
    userJoinedPromise,
    clientSocket,
    otherClientSocket,
    sessionManager
} from './setup';

let testSessionId: string;

beforeAll((done) => {
    setupServerAndSockets()
        .then(() => createTestSession(testUserId, testSessionName)
        .then((sessionId) => testSessionId = sessionId))
        .then(() => done());

    setupGlobalListeners();
});

afterAll(() => {
    closeConnections();
});

// Test create session
describe('create session event', () => {

    let createdSessionId: string;

    it("should emit the initial make session request", () => {
        // Build the create session request
        const createSessionRequest: CreateSessionRequest = {
            hostId: testUserId,
            sessionName: testSessionName
        };

        // Emit the create session event from the client socket.
        clientSocket.emit(EVENTS.CREATE_SESSION, createSessionRequest);
    });

    it("should emit a session created event", async () => {

        const createSessionResponse: CreateSessionResponse = await sessionCreatedPromise;
        expect(createSessionResponse.sessionId).toBeDefined();
        createdSessionId = createSessionResponse.sessionId;
        expect(sessionManager.getSession(createSessionResponse.sessionId)).toBeDefined();
    });
});

describe('join session event', () => {

    it("Should emit the intitial join session event", () => {

        // Build the join session request
        const joinSessionRequest: JoinSessionRequest = {
            sessionId: testSessionId,
            userId: otherUserId,
        };
        otherClientSocket.emit(EVENTS.JOIN_SESSION, (joinSessionRequest))
    });

    it("Host should be notified that new user has joined", async () => {
        const user: User = await userJoinedPromise;
        // expect(user).toBeDefined();
        // expect(user.userId).toBe(otherUserId);
    });

    it("Should emit a session joined event", async () => {

        // Client socket recieves the session joined repsonse event from server.
        const joinSessionResponse: JoinSessionResponse = await joinSessionPromise;
        expect(joinSessionResponse).toBeDefined();
        expect(joinSessionResponse.users).toBeDefined();

        const users: User[] = joinSessionResponse.users;
        expect(users.length).toBe(2);
        expect(users[0].userId).toBe(testUserId);
        expect(users[1].userId).toBe(otherUserId);
    });
});

describe('song management in session', () => {
    let testSong = {
        title: "Test Song",
        artist: "Test Artist"
    }

    it("Should add a song to the session and update queue for all users", () => {
        // Trigger the action to add a song
        clientSocket.emit(EVENTS.ADD_SONG, { sessionId: testSessionId, song: testSong });
    });

    it("should add a song to the session and update queue for all users", (done) => {
        const songToAdd = { title: "Test Song", artist: "Test Artist" };


        // Add listener on otherClientSocket for QUEUE_UPDATED event
        otherClientSocket.on(EVENTS.QUEUE_UPDATED, (queue) => {
            expect(queue).toContain(songToAdd);
            // Additional assertions as needed
        });

    });
});