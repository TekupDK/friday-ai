import { describe, expect, it } from "vitest";

import {
  redact,
  redactEnv,
  redactObject,
  redactString,
} from "../server/_core/redact";

describe("Log Redaction", () => {
  describe("redactString", () => {
    it("should redact email addresses", () => {
      const input = "User email is john.doe@example.com and jane@test.org";
      const result = redactString(input);
      expect(result).toBe("User email is [EMAIL] and [EMAIL]");
      expect(result).not.toContain("john.doe@example.com");
      expect(result).not.toContain("jane@test.org");
    });

    it("should redact JWT tokens", () => {
      const input =
        "Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
      const result = redactString(input);
      expect(result).toBe("Token: [JWT_TOKEN]");
      expect(result).not.toContain("eyJhbGci");
    });

    it("should redact Bearer tokens", () => {
      const input = "Authorization: Bearer sk-abc123def456ghi789";
      const result = redactString(input);
      expect(result).toBe("Authorization: Bearer [TOKEN]");
      expect(result).not.toContain("sk-abc123");
    });

    it("should redact password fields in JSON", () => {
      const input = '{"username":"admin","password":"secret123"}';
      const result = redactString(input);
      expect(result).toContain('"password":"[REDACTED]"');
      expect(result).not.toContain("secret123");
    });

    it("should redact credit card numbers", () => {
      const input = "Card: 4532-1234-5678-9010";
      const result = redactString(input);
      expect(result).toBe("Card: [CREDIT_CARD]");
      expect(result).not.toContain("4532");
    });

    it("should redact Danish CPR numbers", () => {
      const input = "CPR: 010190-1234";
      const result = redactString(input);
      expect(result).toBe("CPR: [CPR]");
      expect(result).not.toContain("010190");
    });

    it("should redact auth codes in URLs", () => {
      const input =
        "Redirect: https://example.com/callback?code=abc123&state=xyz";
      const result = redactString(input);
      expect(result).toContain("code=[REDACTED]");
      expect(result).not.toContain("code=abc123");
    });

    it("should redact database connection strings", () => {
      const input = "postgres://user:password123@db.example.com:5432/mydb";
      const result = redactString(input);
      expect(result).toBe("[DB_CONNECTION_STRING]");
      expect(result).not.toContain("password123");
    });

    it("should handle strings without sensitive data", () => {
      const input = "This is a normal log message";
      const result = redactString(input);
      expect(result).toBe(input);
    });
  });

  describe("redactObject", () => {
    it("should redact sensitive field names", () => {
      const input = {
        username: "admin",
        password: "secret123",
        apiKey: "sk-abc123",
        token: "bearer-xyz",
        normalField: "visible",
      };
      const result = redactObject(input);
      expect(result.username).toBe("admin");
      expect(result.password).toBe("[REDACTED]");
      expect(result.apiKey).toBe("[REDACTED]");
      expect(result.token).toBe("[REDACTED]");
      expect(result.normalField).toBe("visible");
    });

    it("should redact nested objects", () => {
      const input = {
        user: {
          name: "John",
          email: "john@example.com",
          credentials: {
            password: "secret",
            apiKey: "key123",
          },
        },
      };
      const result = redactObject(input);
      expect(result.user.name).toBe("John");
      expect(result.user.email).toBe("[EMAIL]");
      expect(result.user.credentials.password).toBe("[REDACTED]");
      expect(result.user.credentials.apiKey).toBe("[REDACTED]");
    });

    it("should redact arrays", () => {
      const input = {
        users: [
          { name: "Alice", email: "alice@example.com" },
          { name: "Bob", email: "bob@test.org" },
        ],
      };
      const result = redactObject(input);
      expect(result.users[0].name).toBe("Alice");
      expect(result.users[0].email).toBe("[EMAIL]");
      expect(result.users[1].email).toBe("[EMAIL]");
    });

    it("should handle null and undefined values", () => {
      const input = {
        nullValue: null,
        undefinedValue: undefined,
        normalValue: "test",
      };
      const result = redactObject(input);
      expect(result.nullValue).toBeNull();
      expect(result.undefinedValue).toBeUndefined();
      expect(result.normalValue).toBe("test");
    });

    it("should redact case-insensitive sensitive fields", () => {
      const input = {
        Password: "secret1",
        API_KEY: "key123",
        jwt_secret: "secret2",
        database_url: "postgres://...",
      };
      const result = redactObject(input);
      expect(result.Password).toBe("[REDACTED]");
      expect(result.API_KEY).toBe("[REDACTED]");
      expect(result.jwt_secret).toBe("[REDACTED]");
      expect(result.database_url).toBe("[REDACTED]");
    });
  });

  describe("redact", () => {
    it("should handle string inputs", () => {
      const input = "email: test@example.com";
      const result = redact(input);
      expect(result).toBe("email: [EMAIL]");
    });

    it("should handle object inputs", () => {
      const input = { password: "secret" };
      const result = redact(input);
      expect(result.password).toBe("[REDACTED]");
    });

    it("should handle primitive inputs", () => {
      expect(redact(123)).toBe(123);
      expect(redact(true)).toBe(true);
      expect(redact(null)).toBeNull();
    });
  });

  describe("redactEnv", () => {
    it("should redact sensitive environment variables", () => {
      const input = {
        NODE_ENV: "production",
        DATABASE_URL: "postgres://user:pass@localhost/db",
        JWT_SECRET: "secret123",
        OPENAI_API_KEY: "sk-abc123",
        PORT: "3000",
      };
      const result = redactEnv(input);
      expect(result.NODE_ENV).toBe("production");
      expect(result.DATABASE_URL).toBe("[REDACTED]");
      expect(result.JWT_SECRET).toBe("[REDACTED]");
      expect(result.OPENAI_API_KEY).toBe("[REDACTED]");
      expect(result.PORT).toBe("3000");
    });

    it("should handle undefined values", () => {
      const input = {
        DEFINED: "value",
        UNDEFINED: undefined,
      };
      const result = redactEnv(input);
      expect(result.DEFINED).toBe("value");
      expect(result.UNDEFINED).toBeUndefined();
    });
  });

  describe("Integration: Error logging", () => {
    it("should redact sensitive data in error messages", () => {
      const error = new Error(
        "Failed to connect: postgres://user:password@db.example.com/mydb"
      );
      const redactedMessage = redactString(error.message);
      expect(redactedMessage).toBe("Failed to connect: [DB_CONNECTION_STRING]");
      expect(redactedMessage).not.toContain("password");
    });

    it("should redact sensitive data in error stack traces", () => {
      const stack = `Error: Invalid token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
    at authenticate (auth.ts:45:12)
    at login (user@example.com)`;
      const redactedStack = redactString(stack);
      expect(redactedStack).toContain("[JWT_TOKEN]");
      expect(redactedStack).toContain("[EMAIL]");
      expect(redactedStack).not.toContain("eyJhbGci");
      expect(redactedStack).not.toContain("user@example.com");
    });
  });

  describe("Real-world scenarios", () => {
    it("should redact OAuth callback URLs", () => {
      const log =
        "OAuth callback: https://app.example.com/auth/callback?code=abc123xyz&state=random";
      const result = redactString(log);
      expect(result).toContain("code=[REDACTED]");
      expect(result).not.toContain("abc123xyz");
    });

    it("should redact API key headers", () => {
      const headers = {
        "content-type": "application/json",
        authorization: "Bearer sk-1234567890abcdefghij",
        "x-api-key": "key_live_1234567890",
      };
      const result = redactObject(headers);
      expect(result["content-type"]).toBe("application/json");
      expect(result.authorization).toBe("Bearer [TOKEN]");
      expect(result["x-api-key"]).toBe("[REDACTED]");
    });

    it("should redact user credentials in request bodies", () => {
      const body = {
        email: "user@example.com",
        password: "myPassword123!",
        rememberMe: true,
      };
      const result = redactObject(body);
      expect(result.email).toBe("[EMAIL]");
      expect(result.password).toBe("[REDACTED]");
      expect(result.rememberMe).toBe(true);
    });

    it("should handle complex nested structures", () => {
      const complexObject = {
        request: {
          headers: {
            authorization: "Bearer token123",
            cookie: "session=abc123; token=xyz789",
          },
          body: {
            user: {
              email: "test@example.com",
              password: "secret",
              profile: {
                name: "John Doe",
                phone: "+45 12345678",
              },
            },
          },
        },
        response: {
          error: "Database connection failed: postgres://user:pass@localhost/db",
        },
      };
      const result = redactObject(complexObject);
      expect(result.request.headers.authorization).toBe("Bearer [TOKEN]");
      expect(result.request.body.user.email).toBe("[EMAIL]");
      expect(result.request.body.user.password).toBe("[REDACTED]");
      expect(result.request.body.user.profile.name).toBe("John Doe");
      expect(result.response.error).toBe(
        "Database connection failed: [DB_CONNECTION_STRING]"
      );
    });
  });
});
