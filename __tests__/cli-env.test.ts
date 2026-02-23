import { parseDotEnv } from "../cli/src/env";

describe("cli env parser", () => {
  it("parses dotenv lines", () => {
    const parsed = parseDotEnv("HELLO=world\nNUMBER=42");
    expect(parsed.HELLO).toBe("world");
    expect(parsed.NUMBER).toBe("42");
  });
});
