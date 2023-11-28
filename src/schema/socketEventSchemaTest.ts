// To parse this data:
//
//   import { Convert, SocketEventSchemaTest } from "./file";
//
//   const socketEventSchemaTest = Convert.toSocketEventSchemaTest(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface SocketEventSchemaTest {
    CreateSessionRequest:  CreateSessionRequest;
    CreateSessionResponse: CreateSessionResponse;
    JoinSessionRequest:    JoinSessionRequest;
    JoinSessionResponse:   JoinSessionResponse;
    Song:                  Song;
    AddSongRequest:        AddSongRequest;
    AddSongResponse:       AddSongResponse;
    VoteSongRequest:       VoteSongRequest;
    VoteSongEvent:         VoteSongEvent;
    ErrorResponse:         ErrorResponse;
}

export interface AddSongRequest {
    sessionId: string;
    song:      Song;
}

export interface Song {
    id:         string;
    title:      string;
    artist:     string;
    album:      string;
    duration:   number;
    uri:        string;
    artworkURL: string;
    artwork:    string;
    votes:      number;
}

export interface AddSongResponse {
    song: Song;
}

export interface CreateSessionRequest {
    hostId:      string;
    sessionName: string;
}

export interface CreateSessionResponse {
    sessionId: string;
}

export interface ErrorResponse {
    type:        string;
    message:     string;
    stack_trace: string;
}

export interface JoinSessionRequest {
    sessionId: string;
    userId:    string;
}

export interface JoinSessionResponse {
    users: User[];
}

export interface User {
    socketId: string;
    userId:   string;
}

export interface VoteSongEvent {
    songId: string;
    vote:   number;
}

export interface VoteSongRequest {
    sessionId: string;
    songId:    string;
    vote:      number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toSocketEventSchemaTest(json: string): SocketEventSchemaTest {
        return cast(JSON.parse(json), r("SocketEventSchemaTest"));
    }

    public static socketEventSchemaTestToJson(value: SocketEventSchemaTest): string {
        return JSON.stringify(uncast(value, r("SocketEventSchemaTest")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "SocketEventSchemaTest": o([
        { json: "CreateSessionRequest", js: "CreateSessionRequest", typ: r("CreateSessionRequest") },
        { json: "CreateSessionResponse", js: "CreateSessionResponse", typ: r("CreateSessionResponse") },
        { json: "JoinSessionRequest", js: "JoinSessionRequest", typ: r("JoinSessionRequest") },
        { json: "JoinSessionResponse", js: "JoinSessionResponse", typ: r("JoinSessionResponse") },
        { json: "Song", js: "Song", typ: r("Song") },
        { json: "AddSongRequest", js: "AddSongRequest", typ: r("AddSongRequest") },
        { json: "AddSongResponse", js: "AddSongResponse", typ: r("AddSongResponse") },
        { json: "VoteSongRequest", js: "VoteSongRequest", typ: r("VoteSongRequest") },
        { json: "VoteSongEvent", js: "VoteSongEvent", typ: r("VoteSongEvent") },
        { json: "ErrorResponse", js: "ErrorResponse", typ: r("ErrorResponse") },
    ], false),
    "AddSongRequest": o([
        { json: "sessionId", js: "sessionId", typ: "" },
        { json: "song", js: "song", typ: r("Song") },
    ], false),
    "Song": o([
        { json: "id", js: "id", typ: "" },
        { json: "title", js: "title", typ: "" },
        { json: "artist", js: "artist", typ: "" },
        { json: "album", js: "album", typ: "" },
        { json: "duration", js: "duration", typ: 0 },
        { json: "uri", js: "uri", typ: "" },
        { json: "artworkURL", js: "artworkURL", typ: "" },
        { json: "artwork", js: "artwork", typ: "" },
        { json: "votes", js: "votes", typ: 0 },
    ], false),
    "AddSongResponse": o([
        { json: "song", js: "song", typ: r("Song") },
    ], false),
    "CreateSessionRequest": o([
        { json: "hostId", js: "hostId", typ: "" },
        { json: "sessionName", js: "sessionName", typ: "" },
    ], false),
    "CreateSessionResponse": o([
        { json: "sessionId", js: "sessionId", typ: "" },
    ], false),
    "ErrorResponse": o([
        { json: "type", js: "type", typ: "" },
        { json: "message", js: "message", typ: "" },
        { json: "stack_trace", js: "stack_trace", typ: "" },
    ], false),
    "JoinSessionRequest": o([
        { json: "sessionId", js: "sessionId", typ: "" },
        { json: "userId", js: "userId", typ: "" },
    ], false),
    "JoinSessionResponse": o([
        { json: "users", js: "users", typ: a(r("User")) },
    ], false),
    "User": o([
        { json: "socketId", js: "socketId", typ: "" },
        { json: "userId", js: "userId", typ: "" },
    ], false),
    "VoteSongEvent": o([
        { json: "songId", js: "songId", typ: "" },
        { json: "vote", js: "vote", typ: 0 },
    ], false),
    "VoteSongRequest": o([
        { json: "sessionId", js: "sessionId", typ: "" },
        { json: "songId", js: "songId", typ: "" },
        { json: "vote", js: "vote", typ: 0 },
    ], false),
};
