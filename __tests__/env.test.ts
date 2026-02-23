import { envDiff, parseDotEnv, stringifyDotEnv } from "@/lib/env";

describe("env parser utilities", () => {
  it("parses dotenv content", () => {
    const parsed = parseDotEnv("NODE_ENV=production\nAPI_URL=https://example.com");
    expect(parsed.NODE_ENV).toBe("production");
    expect(parsed.API_URL).toBe("https://example.com");
  });

  it("stringifies and diff env content", () => {
    const before = { A: "1", B: "2" };
    const after = { A: "1", B: "3", C: "4" };

    expect(stringifyDotEnv(before)).toContain("A=1");
    expect(envDiff(before, after)).toEqual({
      added: ["C"],
      removed: [],
      changed: ["B"],
    });
  });
});
