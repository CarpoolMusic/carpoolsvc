import { createServer } from 'http';
import ioClient from 'socket.io-client';
import { Server } from 'socket.io'

import { SocketHandler } from '../../src/services/socketHandler';
import { sessionManager } from '../../src/services/sessionManager';
import { CreateSessionRequest, CreateSessionResponse, JoinSessionRequest, JoinSessionResponse, User } from '../../src/schema/socketEventSchema';
import { EVENTS } from '../../src/models/events';

const testUserId: string = 'testUserId';
const otherUserId: string = 'otherUserId';

let ioServer: Server;
let clientSocket: any;
let otherClientSocket: any;
let socketHandler: SocketHandler;

beforeAll((done) => {
    const httpServer = createServer().listen(3200);
    ioServer = new Server(httpServer);
    socketHandler = new SocketHandler(ioServer);
    clientSocket = ioClient('http://localhost:3200');
    otherClientSocket = ioClient('http://localhost:3200');
    // set up error handler
    clientSocket.on('error', (err: Error) => {
        if (err.message.indexOf('ECONNREFUSED') > -1) {
            // server not running
            fail('Server not running');
        }
        fail(err);
    });
    clientSocket.on(EVENTS.CONNECTED, done);
});

afterAll(() => {
    ioServer.close();
    clientSocket.close();
    otherClientSocket.close();
});

// Test create session
describe('create session event', () => {

    it("should emit the initial make session request", () => {
    // Build the create session request
    const createSessionRequest: CreateSessionRequest = {
        hostId: testUserId,
    };

    // Emit the create session event from the client socket.
    clientSocket.emit(EVENTS.CREATE_SESSION, createSessionRequest);
    });

    it("should emit a session created event", (done) => {
        // client socket recieves the session created repsonse event from server.
        clientSocket.on(EVENTS.SESSION_CREATED, (createSessionResponse: CreateSessionResponse) => {
            expect(createSessionResponse.sessionId).toBeDefined();
            expect(sessionManager.getSession(createSessionResponse.sessionId)).toBeDefined();

            done(); // Call done() after the assertions
        });
    });
});

describe('join session event', () => {
    // Create a new user to join the session
    it("should emit the initial join session request", () => {
        // Create the intial test session to join
        // Note: Create the session directly in the session manager rather than using sockets to reduce test dependencies.
        const testUser: User = { socketId: clientSocket.id, userId: testUserId };
        const testSessionId = sessionManager.createSession(testUser);

        // Build the join session request
        const joinSessionRequest: JoinSessionRequest = {
            sessionId: testSessionId,
            userId: otherUserId,
        };

        // Emit the join session event from the client socket.
        otherClientSocket.emit(EVENTS.JOIN_SESSION, joinSessionRequest);
    });

    it("should emit a session joined event", (done) => {
        // client socket recieves the session joined repsonse event from server.
        otherClientSocket.on(EVENTS.SESSION_JOINED, (joinSessionResponse: JoinSessionResponse) => {
            expect(joinSessionResponse).toBeDefined();
            // ensure joinSessionResponse has correct values
            expect(joinSessionResponse.users).toBeDefined();
            const users: User[] = joinSessionResponse.users;
            // Ensure members has the correct userIds
            // Should contain the host and the new user
            expect(users.length).toBe(2);
            expect(users[0].userId).toBe(testUserId);
            expect(users[1].userId).toBe(otherUserId);
            done(); // Call done() after the assertions
        });
    });
});