// This file was generated from JSON Schema using quicktype, do not modify it directly.
// To parse the JSON, add this file to your project and do:
//
//   let test = try Test(json)

import Foundation

// MARK: - Test
struct Test: Codable {
    let schema: String
    let definitions: Definitions

    enum CodingKeys: String, CodingKey {
        case schema = "$schema"
        case definitions
    }
}

// MARK: Test convenience initializers and mutators

extension Test {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(Test.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        schema: String? = nil,
        definitions: Definitions? = nil
    ) -> Test {
        return Test(
            schema: schema ?? self.schema,
            definitions: definitions ?? self.definitions
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - Definitions
struct Definitions: Codable {
    let userProfileRequest: UserProfileRequest
    let userProfileResponse: UserProfileResponse
    let apiRequest, apiResponse: APIRe

    enum CodingKeys: String, CodingKey {
        case userProfileRequest = "UserProfileRequest"
        case userProfileResponse = "UserProfileResponse"
        case apiRequest = "ApiRequest"
        case apiResponse = "ApiResponse"
    }
}

// MARK: Definitions convenience initializers and mutators

extension Definitions {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(Definitions.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        userProfileRequest: UserProfileRequest? = nil,
        userProfileResponse: UserProfileResponse? = nil,
        apiRequest: APIRe? = nil,
        apiResponse: APIRe? = nil
    ) -> Definitions {
        return Definitions(
            userProfileRequest: userProfileRequest ?? self.userProfileRequest,
            userProfileResponse: userProfileResponse ?? self.userProfileResponse,
            apiRequest: apiRequest ?? self.apiRequest,
            apiResponse: apiResponse ?? self.apiResponse
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - APIRe
struct APIRe: Codable {
    let oneOf: [OneOf]
}

// MARK: APIRe convenience initializers and mutators

extension APIRe {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(APIRe.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        oneOf: [OneOf]? = nil
    ) -> APIRe {
        return APIRe(
            oneOf: oneOf ?? self.oneOf
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - OneOf
struct OneOf: Codable {
    let ref: String

    enum CodingKeys: String, CodingKey {
        case ref = "$ref"
    }
}

// MARK: OneOf convenience initializers and mutators

extension OneOf {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(OneOf.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        ref: String? = nil
    ) -> OneOf {
        return OneOf(
            ref: ref ?? self.ref
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - UserProfileRequest
struct UserProfileRequest: Codable {
    let type: String
    let properties: UserProfileRequestProperties
    let userProfileRequestRequired: [String]

    enum CodingKeys: String, CodingKey {
        case type, properties
        case userProfileRequestRequired = "required"
    }
}

// MARK: UserProfileRequest convenience initializers and mutators

extension UserProfileRequest {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(UserProfileRequest.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        type: String? = nil,
        properties: UserProfileRequestProperties? = nil,
        userProfileRequestRequired: [String]? = nil
    ) -> UserProfileRequest {
        return UserProfileRequest(
            type: type ?? self.type,
            properties: properties ?? self.properties,
            userProfileRequestRequired: userProfileRequestRequired ?? self.userProfileRequestRequired
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - UserProfileRequestProperties
struct UserProfileRequestProperties: Codable {
    let userID: UserID

    enum CodingKeys: String, CodingKey {
        case userID = "userId"
    }
}

// MARK: UserProfileRequestProperties convenience initializers and mutators

extension UserProfileRequestProperties {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(UserProfileRequestProperties.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        userID: UserID? = nil
    ) -> UserProfileRequestProperties {
        return UserProfileRequestProperties(
            userID: userID ?? self.userID
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - UserID
struct UserID: Codable {
    let type: String
}

// MARK: UserID convenience initializers and mutators

extension UserID {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(UserID.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        type: String? = nil
    ) -> UserID {
        return UserID(
            type: type ?? self.type
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - UserProfileResponse
struct UserProfileResponse: Codable {
    let type: String
    let properties: UserProfileResponseProperties
    let userProfileResponseRequired: [String]

    enum CodingKeys: String, CodingKey {
        case type, properties
        case userProfileResponseRequired = "required"
    }
}

// MARK: UserProfileResponse convenience initializers and mutators

extension UserProfileResponse {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(UserProfileResponse.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        type: String? = nil,
        properties: UserProfileResponseProperties? = nil,
        userProfileResponseRequired: [String]? = nil
    ) -> UserProfileResponse {
        return UserProfileResponse(
            type: type ?? self.type,
            properties: properties ?? self.properties,
            userProfileResponseRequired: userProfileResponseRequired ?? self.userProfileResponseRequired
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - UserProfileResponseProperties
struct UserProfileResponseProperties: Codable {
    let name: UserID
    let email: Email
    let age: UserID
}

// MARK: UserProfileResponseProperties convenience initializers and mutators

extension UserProfileResponseProperties {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(UserProfileResponseProperties.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        name: UserID? = nil,
        email: Email? = nil,
        age: UserID? = nil
    ) -> UserProfileResponseProperties {
        return UserProfileResponseProperties(
            name: name ?? self.name,
            email: email ?? self.email,
            age: age ?? self.age
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - Email
struct Email: Codable {
    let type, format: String
}

// MARK: Email convenience initializers and mutators

extension Email {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(Email.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        type: String? = nil,
        format: String? = nil
    ) -> Email {
        return Email(
            type: type ?? self.type,
            format: format ?? self.format
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - Helper functions for creating encoders and decoders

func newJSONDecoder() -> JSONDecoder {
    let decoder = JSONDecoder()
    if #available(iOS 10.0, OSX 10.12, tvOS 10.0, watchOS 3.0, *) {
        decoder.dateDecodingStrategy = .iso8601
    }
    return decoder
}

func newJSONEncoder() -> JSONEncoder {
    let encoder = JSONEncoder()
    if #available(iOS 10.0, OSX 10.12, tvOS 10.0, watchOS 3.0, *) {
        encoder.dateEncodingStrategy = .iso8601
    }
    return encoder
}
