import { CreateSessionRequest, CreateSessionResponse, JoinSessionRequest, JoinSessionResponse, AddSongRequest, SongAddedEvent, VoteSongEvent, User, Song, VoteSongRequest} from '../../src/schema/socketEventSchema';
import { EVENTS } from '../../src/models/events';
import { SERVICE } from '../../src/models/services';

import {
    setupServerAndSockets,
    setupGlobalListeners,
    resetPromises,
    closeConnections,
    createTestSession,
    testUserId,
    testSessionName,
    otherUserId,
    testSongId,
    sessionCreatedPromise,
    joinSessionPromise,
    userJoinedPromise,
    songAddedPromise,
    voteSongPromise,
    clientSocket,
    otherClientSocket,
    sessionManager,
    addTestSongToTestSession
} from '../setup';
import { serialize } from 'v8';

let testSessionId: string;

beforeAll((done) => {
    setupServerAndSockets()
        .then(() => createTestSession(testUserId, testSessionName)
        .then((sessionId) => testSessionId = sessionId))
        .then(() => addTestSongToTestSession(testSessionId))
        .then(() => done());

    setupGlobalListeners();
});

beforeEach(() => {
    resetPromises();
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
        clientSocket.emit(EVENTS.CREATE_SESSION, JSON.stringify(createSessionRequest));
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
        otherClientSocket.emit(EVENTS.JOIN_SESSION, JSON.stringify(joinSessionRequest))
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

describe('adding a song to session', () => {

    const testSong: Song = {
        service: "Test service",
        id: "Test ID",
        uri: "Test URI",
        title: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
        artworkUrl: "Test artwork url", 
        votes: 0,
    };

    it("Should make the initial add song request", () => {
        // Build the add song request
        const addSongRequest: AddSongRequest = {
            sessionId: testSessionId,
            song: testSong
        };
        // Make the add song request
        clientSocket.emit(EVENTS.ADD_SONG, JSON.stringify(addSongRequest));
    });

    it("Should add song to queue for all users in session", async () => {
        const songAddedEvent: SongAddedEvent = await songAddedPromise;
        const song: Song = songAddedEvent.song;

        expect(songAddedEvent).toBeDefined();
        expect(song.id).toBe(testSong.id);
        expect(song.uri).toBe(testSong.uri);
        expect(song.title).toBe(testSong.title);
        expect(song.artist).toBe(testSong.artist);
        expect(song.album).toBe(testSong.album);
        expect(song.artworkUrl).toBe(testSong.artworkUrl);
        expect(song.votes).toBe(testSong.votes);

        const session = sessionManager.getSession(testSessionId);
        // assert that the song was added to the session
        expect(session?.viewLastSongAdded().id).toBe(testSong.id);
    });
});

describe('voting on a song', () => {

    it("Should make the initial vote request to upvote", () => {
        // Build the vote request
        const voteRequest: VoteSongRequest = {
            sessionId: testSessionId,
            songId: testSongId,
            vote: 1
        };
        // Make the vote request
        clientSocket.emit(EVENTS.VOTE_SONG, JSON.stringify(voteRequest));
    });

    it("Should notify all users in session that a song has been voted on", async () => {
        const voteSongEvent: VoteSongEvent = await voteSongPromise;
        const songId = voteSongEvent.songId;
        const vote = voteSongEvent.vote;

        expect(songId).toBeDefined();
        expect(songId).toBe(testSongId);
        expect(vote).toBeDefined();
        expect(sessionManager.getSession(testSessionId)?.getNumVotes(testSongId)).toBe(1);
    }); 

    it("Should make the initial vote request to downvote", () => {
        // Build the vote request
        const voteRequest: VoteSongRequest = {
            sessionId: testSessionId,
            songId: testSongId,
            vote: -1
        };
        // Make the vote request
        clientSocket.emit(EVENTS.VOTE_SONG, JSON.stringify(voteRequest));
    });

    it("Should notify all users in session that a song has been voted on", async () => {
        const voteSongEvent: VoteSongEvent = await voteSongPromise;
        const songId = voteSongEvent.songId;
        const vote = voteSongEvent.vote;

        expect(songId).toBeDefined();
        expect(songId).toBe(testSongId);
        expect(vote).toBeDefined();
        expect(sessionManager.getSession(testSessionId)?.getNumVotes(testSongId)).toBe(0);
    }); 
});