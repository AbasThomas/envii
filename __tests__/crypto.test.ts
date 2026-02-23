import { decryptJson, encryptJson } from "@/lib/crypto";

describe("crypto utilities", () => {
  it("encrypts and decrypts JSON payload", () => {
    const payload = { TOKEN: "abc123", URL: "https://example.com" };
    const encrypted = encryptJson(payload, "test-secret");
    const decrypted = decryptJson(encrypted, "test-secret");

    expect(decrypted).toEqual(payload);
  });
});
