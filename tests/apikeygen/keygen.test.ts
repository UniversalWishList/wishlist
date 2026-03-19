import { generateApiKey } from "./keygen";

//check if function is recognized
test("generateApiKey function is recognized", () => {
    expect(typeof generateApiKey).toBe("function");
});

//check if string was even made to begin with
test("generateApiKey returns a string", async () => {
    expect(typeof await generateApiKey()).toBe("string");
});
//check if 2 run throughs are different
test("generateApiKey generates unique keys", async () => {
    const key1 = await generateApiKey();
    const key2 = await generateApiKey();
    expect(key1).not.toBe(key2);
});

//check if string is correct length
test("generateApiKey generates a key of correct length", async () => {
    const key = await generateApiKey();
    expect(key.length).toBe(64);
});

//check if string is hex
test("generateApiKey generates a hex string", async () => {
    const key = await generateApiKey();
    expect(/^[0-9a-f]+$/.test(key)).toBe(true);
});
