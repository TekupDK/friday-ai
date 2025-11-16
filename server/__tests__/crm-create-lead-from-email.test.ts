import { describe, it, expect } from "vitest";
import { CreateLeadFromEmailInputSchema } from "../../shared/schemas/lead";

describe("CreateLeadFromEmailInputSchema", () => {
  it("parses valid input", () => {
    const input = {
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "An inquiry",
      snippet: "Hello there",
      threadId: "1789ab",
    };
    const parsed = CreateLeadFromEmailInputSchema.parse(input);
    expect(parsed.email).toBe("jane@example.com");
    expect(parsed.threadId).toBe("1789ab");
  });

  it("fails on invalid email", () => {
    expect(() =>
      CreateLeadFromEmailInputSchema.parse({
        name: "X",
        email: "not-an-email",
        threadId: "t1",
      })
    ).toThrow();
  });
});
