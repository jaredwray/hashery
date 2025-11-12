import { describe, test, expect } from "vitest";
import { FNV1 } from "../../src/providers/fnv1.ts";
import type { HashProvider } from "../../src/types.ts";

describe("FNV1 Hash Provider", () => {
    describe("initialization", () => {
        test("should create instance without options", () => {
            const fnv1 = new FNV1();
            expect(fnv1).toBeInstanceOf(FNV1);
        });

        test("should implement HashProvider interface", () => {
            const fnv1: HashProvider = new FNV1();
            expect(fnv1).toHaveProperty("name");
            expect(fnv1).toHaveProperty("toHash");
            expect(typeof fnv1.toHash).toBe("function");
        });
    });

    describe("name property", () => {
        test("should return correct provider name", () => {
            const fnv1 = new FNV1();
            expect(fnv1.name).toBe("fnv1");
        });
    });

    describe("toHash method", () => {
        test("should return a valid hex string", async () => {
            const fnv1 = new FNV1();
            const data = new TextEncoder().encode("test");
            const hash = await fnv1.toHash(data);

            expect(hash).toMatch(/^[0-9a-f]{8}$/);
            expect(hash.length).toBe(8);
        });

        test("should return consistent hash for same input", async () => {
            const fnv1 = new FNV1();
            const data = new TextEncoder().encode("hello world");

            const hash1 = await fnv1.toHash(data);
            const hash2 = await fnv1.toHash(data);

            expect(hash1).toBe(hash2);
        });

        test("should return different hashes for different inputs", async () => {
            const fnv1 = new FNV1();
            const data1 = new TextEncoder().encode("hello");
            const data2 = new TextEncoder().encode("world");

            const hash1 = await fnv1.toHash(data1);
            const hash2 = await fnv1.toHash(data2);

            expect(hash1).not.toBe(hash2);
        });

        test("should handle empty buffer", async () => {
            const fnv1 = new FNV1();
            const data = new Uint8Array(0);
            const hash = await fnv1.toHash(data);

            expect(hash).toMatch(/^[0-9a-f]{8}$/);
            expect(hash).toBe("811c9dc5"); // FNV offset basis
        });

        test("should handle Uint8Array input", async () => {
            const fnv1 = new FNV1();
            const data = new TextEncoder().encode("test");
            const hash = await fnv1.toHash(data);

            expect(hash).toMatch(/^[0-9a-f]{8}$/);
        });

        test("should handle ArrayBuffer input", async () => {
            const fnv1 = new FNV1();
            const text = new TextEncoder().encode("test");
            const buffer = text.buffer;
            const hash = await fnv1.toHash(buffer);

            expect(hash).toMatch(/^[0-9a-f]{8}$/);
        });

        test("should handle DataView input", async () => {
            const fnv1 = new FNV1();
            const text = new TextEncoder().encode("test");
            const dataView = new DataView(text.buffer);
            const hash = await fnv1.toHash(dataView);

            expect(hash).toMatch(/^[0-9a-f]{8}$/);
        });

        test("should handle Int8Array input", async () => {
            const fnv1 = new FNV1();
            const data = new Int8Array([1, 2, 3, 4, 5]);
            const hash = await fnv1.toHash(data);

            expect(hash).toMatch(/^[0-9a-f]{8}$/);
        });

        test("should produce same hash for equivalent data in different formats", async () => {
            const fnv1 = new FNV1();
            const text = new TextEncoder().encode("hello");

            const hash1 = await fnv1.toHash(text);
            const hash2 = await fnv1.toHash(text.buffer);
            const hash3 = await fnv1.toHash(new DataView(text.buffer));

            expect(hash1).toBe(hash2);
            expect(hash2).toBe(hash3);
        });
    });

    describe("known hash values", () => {
        test("should produce correct hash for empty string", async () => {
            const fnv1 = new FNV1();
            const data = new TextEncoder().encode("");
            const hash = await fnv1.toHash(data);

            // FNV-1 32-bit offset basis
            expect(hash).toBe("811c9dc5");
        });

        test("should produce correct hash for 'a'", async () => {
            const fnv1 = new FNV1();
            const data = new TextEncoder().encode("a");
            const hash = await fnv1.toHash(data);

            // Known FNV-1 32-bit hash for "a"
            expect(hash).toBe("050c5d41");
        });

        test("should produce correct hash for 'hello'", async () => {
            const fnv1 = new FNV1();
            const data = new TextEncoder().encode("hello");
            const hash = await fnv1.toHash(data);

            // Known FNV-1 32-bit hash for "hello"
            expect(hash).toBe("a9b7cf6f");
        });

        test("should produce correct hash for 'hello world'", async () => {
            const fnv1 = new FNV1();
            const data = new TextEncoder().encode("hello world");
            const hash = await fnv1.toHash(data);

            // Known FNV-1 32-bit hash for "hello world"
            expect(hash).toBe("bb249d98");
        });

        test("should produce correct hash for 'The quick brown fox jumps over the lazy dog'", async () => {
            const fnv1 = new FNV1();
            const data = new TextEncoder().encode("The quick brown fox jumps over the lazy dog");
            const hash = await fnv1.toHash(data);

            // Known FNV-1 32-bit hash
            expect(hash).toBe("70ce9897");
        });
    });

    describe("collision resistance", () => {
        test("should produce different hashes for similar strings", async () => {
            const fnv1 = new FNV1();
            const data1 = new TextEncoder().encode("test");
            const data2 = new TextEncoder().encode("tests");
            const data3 = new TextEncoder().encode("Test");

            const hash1 = await fnv1.toHash(data1);
            const hash2 = await fnv1.toHash(data2);
            const hash3 = await fnv1.toHash(data3);

            expect(hash1).not.toBe(hash2);
            expect(hash1).not.toBe(hash3);
            expect(hash2).not.toBe(hash3);
        });

        test("should have good distribution for sequential inputs", async () => {
            const fnv1 = new FNV1();
            const hashes = new Set<string>();

            for (let i = 0; i < 100; i++) {
                const data = new TextEncoder().encode(`test${i}`);
                const hash = await fnv1.toHash(data);
                hashes.add(hash);
            }

            // All hashes should be unique (no collisions in this small set)
            expect(hashes.size).toBe(100);
        });
    });

    describe("edge cases", () => {
        test("should handle large data", async () => {
            const fnv1 = new FNV1();
            const largeData = new Uint8Array(10000);
            for (let i = 0; i < largeData.length; i++) {
                largeData[i] = i % 256;
            }

            const hash = await fnv1.toHash(largeData);
            expect(hash).toMatch(/^[0-9a-f]{8}$/);
        });

        test("should handle all byte values 0-255", async () => {
            const fnv1 = new FNV1();
            const allBytes = new Uint8Array(256);
            for (let i = 0; i < 256; i++) {
                allBytes[i] = i;
            }

            const hash = await fnv1.toHash(allBytes);
            expect(hash).toMatch(/^[0-9a-f]{8}$/);
        });

        test("should handle single byte", async () => {
            const fnv1 = new FNV1();
            const data = new Uint8Array([42]);
            const hash = await fnv1.toHash(data);

            expect(hash).toMatch(/^[0-9a-f]{8}$/);
        });
    });
});
