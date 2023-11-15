import { createServer } from 'http';
import ioClient from 'socket.io-client';
import { Server } from 'socket.io';
import { SocketHandler } from '../../src/services/socketHandler';
import SessionManager from '../../src/services/sessionManager';
import { CreateSessionRequest, CreateSessionResponse, JoinSessionRequest, JoinSessionResponse, User } from '../../src/schema/socketEventSchema';
import { EVENTS } from '../../src/models/events';

// Test configuration constants
const testUserId = 'testUserId';
const testSessionName = 'testSession';
const otherUserId = 'otherUserId';

// Server and client socket instances
let ioServer: Server;
let clientSocket: any;
let otherClientSocket: any;
let sessionManager: SessionManager;
let socketHandler: SocketHandler;

// Promises for global listeners
let sessionCreatedPromise: Promise<CreateSessionResponse>;
let sessionCreatedResolve: (value: CreateSessionResponse) => void;

let joinSessionPromise: Promise<JoinSessionResponse>
let joinSessionResolve: (value: JoinSessionResponse) => void;
let userJoinedPromise: Promise<User>
let userJoinedResolve: (value: User) => void;

let queueUpdatedPromise: Promise<void>;
let queueUpdatedResolve: () => void;

// Utility functions for setup and assertions
const setupServerAndSockets = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const httpServer = createServer().listen(3200);
        ioServer = new Server(httpServer);
        sessionManager = new SessionManager();
        socketHandler = new SocketHandler(ioServer, sessionManager);

        clientSocket = ioClient('http://localhost:3200');
        otherClientSocket = ioClient('http://localhost:3200');

        // Track number of connections
        let connectionsEstablished = 0;
        const checkConnectionsDone = () => {
            connectionsEstablished++;
            if (connectionsEstablished === 2) {
                resolve();
            }
        };

        clientSocket.on(EVENTS.CONNECTED, checkConnectionsDone);
        otherClientSocket.on(EVENTS.CONNECTED, checkConnectionsDone);

        clientSocket.on('error', reject);
        otherClientSocket.on('error', reject);
    });
};

const resetPromises = () => {
    // Initialize promise and their resolve functions
    sessionCreatedPromise = new Promise((resolve) => {
        sessionCreatedResolve = resolve;
    });

    joinSessionPromise = new Promise((resolve) => {
        joinSessionResolve = resolve;
    });

    userJoinedPromise = new Promise((resolve) => {
        userJoinedResolve = resolve; 
    });

    queueUpdatedPromise = new Promise((resolve) => {
        queueUpdatedResolve = resolve;
    });
};

const setupGlobalListeners = (): void => {
    // Session created listener
    clientSocket.on(EVENTS.SESSION_CREATED, (createSessionResponse: CreateSessionResponse) => {
        if (sessionCreatedResolve) {
            sessionCreatedResolve(createSessionResponse);
        }
    });

    clientSocket.on(EVENTS.SESSION_JOINED, (joinSessionResponse: JoinSessionResponse) => {
        if (joinSessionResponse) {
            joinSessionResolve(joinSessionResponse); 
        }
    });
    otherClientSocket.on(EVENTS.SESSION_JOINED, (joinSessionResponse: JoinSessionResponse) => {
        if (joinSessionResponse) {
            joinSessionResolve(joinSessionResponse); 
        }
    });

    clientSocket.on(EVENTS.USER_JOINED, (user: User) => {
        if (userJoinedResolve) {
            userJoinedResolve(user); 
        }
    });

    clientSocket.on(EVENTS.QUEUE_UPDATED, () => {
        if (queueUpdatedResolve) {
            queueUpdatedResolve();
        }
    });

    resetPromises();
};

const closeConnections = (): void => {
    ioServer.close();
    clientSocket.close();
    otherClientSocket.close(); 
}

const createTestSession = (userId: string, sessionName: string): Promise<string> => {
    let testSessionId: string;
    const createSessionRequest: CreateSessionRequest = { hostId: userId, sessionName: sessionName };
    clientSocket.emit(EVENTS.CREATE_SESSION, createSessionRequest);

    return sessionCreatedPromise.then((createSessionResponse: CreateSessionResponse) => {
        expect(createSessionResponse.sessionId).toBeDefined();
        return testSessionId = createSessionResponse.sessionId;
    });
};

export {
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
    sessionManager,
}