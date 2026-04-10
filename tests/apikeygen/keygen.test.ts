import { generateApiKey } from "../../src/lib/server/keygen";
import { hashApiKey } from "../../src/lib/server/keygen";

//check is function is recognized
test("generateApiKey function is recognized", () => {
    expect(typeof generateApiKey).toBe("function");
});

//check if string was even made to begin with
test("generateApiKey returns a string", async () => {
    expect(typeof await generateApiKey()).toBe("string");
});
//check if 2 run thoughs are different
test("generateApiKey generates unique keys", async () => {
    const key1 = await generateApiKey();
    const key2 = await generateApiKey();
    expect(key1).not.toBe(key2);
});

//check if string is correct length
test("generateApiKey generates a key of correct length", async () => {
    const key = await generateApiKey();
    expect(key.length).toBe(68);
});

//check if string is hex
test("generateApiKey generates a hex string", async () => {
    const key = await generateApiKey();
    const keyNoPrefix = key.slice(4);
    expect(/^[0-9a-f]+$/.test(keyNoPrefix)).toBe(true);
});

//check if string has correct prefix
test("generateApiKey generates a key with correct prefix", async () => {
    const key = await generateApiKey();
    expect(key.startsWith("uwl_")).toBe(true);
});

//check if hash function is recognized
test("hashApiKey function is recognized", () => {
    expect(typeof hashApiKey).toBe("function");
});

//check if hash function returns a string
test("hashApiKey returns a string", async () => {
    const apiKey = await generateApiKey();
    const hashedKey = await hashApiKey(apiKey);
    expect(typeof hashedKey).toBe("string");
});

//check if hash function returns different value for same input
test("hashApiKey generates unique hashes for same input", async () => {
    const apiKey = await generateApiKey();
    const hashedKey1 = await hashApiKey(apiKey);
    const hashedKey2 = await hashApiKey(apiKey);
    expect(hashedKey1).not.toBe(hashedKey2);
});

//check if hash function returns a string of correct length
test("hashApiKey generates a hash of correct length", async () => {
    const apiKey = await generateApiKey();
    const hashedKey = await hashApiKey(apiKey);
    expect(hashedKey.length).toBe(60);
});

//check if hashed key matches original key
test("hashApiKey generates a hash that matches the original key", async () => {
    const apiKey = await generateApiKey();
    const hashedKey = await hashApiKey(apiKey);
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(apiKey, hashedKey);
    expect(isMatch).toBe(true);
});

//check if hashed key does not match different key
test("hashApiKey generates a hash that does not match a different key", async () => {
    const apiKey1 = await generateApiKey();
    const apiKey2 = await generateApiKey();
    const hashedKey1 = await hashApiKey(apiKey1);
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(apiKey2, hashedKey1);
    expect(isMatch).toBe(false);
});

//check if hash returns false when compared to a different key
test("hashApiKey generates a hash that does not match a different key", async () => {
    const apiKey1 = await generateApiKey();
    const apiKey2 = await generateApiKey();
    const hashedKey1 = await hashApiKey(apiKey1);
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(apiKey2, hashedKey1);
    expect(isMatch).toBe(false);
});
