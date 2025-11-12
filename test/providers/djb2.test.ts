import { describe, test, expect } from "vitest";
import { DJB2 } from "../../src/providers/djb2.ts";
import type { HashProvider } from "../../src/types.ts";

describe("DJB2 Hash Provider", () => {
	describe("initialization", () => {
		test("should create instance without options", () => {
			const djb2 = new DJB2();
			expect(djb2).toBeInstanceOf(DJB2);
		});

		test("should implement HashProvider interface", () => {
			const djb2: HashProvider = new DJB2();
			expect(djb2).toHaveProperty("name");
			expect(djb2).toHaveProperty("toHash");
			expect(typeof djb2.toHash).toBe("function");
		});
	});

	describe("name property", () => {
		test("should return 'djb2' as the provider name", () => {
			const djb2 = new DJB2();
			expect(djb2.name).toBe("djb2");
		});
	});

	describe("toHash method", () => {
		test("should return a valid hex string", async () => {
			const djb2 = new DJB2();
			const data = new TextEncoder().encode("test");
			const hash = await djb2.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should generate consistent hashes for same data", async () => {
			const djb2 = new DJB2();
			const data = new TextEncoder().encode("test data");

			const hash1 = await djb2.toHash(data);
			const hash2 = await djb2.toHash(data);

			expect(hash1).toBe(hash2);
		});

		test("should generate different hashes for different data", async () => {
			const djb2 = new DJB2();
			const data1 = new TextEncoder().encode("hello");
			const data2 = new TextEncoder().encode("world");

			const hash1 = await djb2.toHash(data1);
			const hash2 = await djb2.toHash(data2);

			expect(hash1).not.toBe(hash2);
		});

		test("should handle empty buffer", async () => {
			const djb2 = new DJB2();
			const data = new Uint8Array(0);
			const hash = await djb2.toHash(data);

			// Empty data should produce the initial hash value (5381)
			expect(hash).toBe("00001505");
			expect(hash).toMatch(/^[0-9a-f]{8}$/);
		});

		test("should work with Uint8Array input", async () => {
			const djb2 = new DJB2();
			const data = new TextEncoder().encode("hello");
			const hash = await djb2.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with ArrayBuffer input", async () => {
			const djb2 = new DJB2();
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode("hello");
			const arrayBuffer = uint8Array.buffer;

			const hash = await djb2.toHash(arrayBuffer);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with DataView input", async () => {
			const djb2 = new DJB2();
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode("hello");
			const dataView = new DataView(uint8Array.buffer);

			const hash = await djb2.toHash(dataView);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Int8Array input", async () => {
			const djb2 = new DJB2();
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode("hello");
			const int8Array = new Int8Array(uint8Array.buffer);

			const hash = await djb2.toHash(int8Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Uint16Array input", async () => {
			const djb2 = new DJB2();
			const uint16Array = new Uint16Array([104, 101, 108, 108, 111]); // "hello" as uint16 values

			const hash = await djb2.toHash(uint16Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Int16Array input", async () => {
			const djb2 = new DJB2();
			const int16Array = new Int16Array([104, 101, 108, 108, 111]);

			const hash = await djb2.toHash(int16Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Uint32Array input", async () => {
			const djb2 = new DJB2();
			const uint32Array = new Uint32Array([0x6c6c6568, 0x0000006f]); // "hello" as uint32 values (little-endian)

			const hash = await djb2.toHash(uint32Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Float32Array input", async () => {
			const djb2 = new DJB2();
			const float32Array = new Float32Array([1.5, 2.5, 3.5]);

			const hash = await djb2.toHash(float32Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should produce same hash for equivalent data in different formats", async () => {
			const djb2 = new DJB2();
			const text = "hello world";
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode(text);
			const arrayBuffer = uint8Array.buffer;
			const dataView = new DataView(arrayBuffer);

			const hash1 = await djb2.toHash(uint8Array);
			const hash2 = await djb2.toHash(arrayBuffer);
			const hash3 = await djb2.toHash(dataView);

			expect(hash1).toBe(hash2);
			expect(hash2).toBe(hash3);
		});

		test("should produce same hash for Uint8Array and Int8Array with same underlying buffer", async () => {
			const djb2 = new DJB2();
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode("test");
			const int8Array = new Int8Array(uint8Array.buffer);

			const hash1 = await djb2.toHash(uint8Array);
			const hash2 = await djb2.toHash(int8Array);

			expect(hash1).toBe(hash2);
		});

		describe("known hash values", () => {
			test("should produce correct hash for 'hello'", async () => {
				const djb2 = new DJB2();
				const data = new TextEncoder().encode("hello");
				const hash = await djb2.toHash(data);

				// DJB2 hash for "hello"
				expect(hash).toBe("0f923099");
			});

			test("should produce correct hash for empty string", async () => {
				const djb2 = new DJB2();
				const data = new TextEncoder().encode("");
				const hash = await djb2.toHash(data);

				// DJB2 hash for empty string is the initial value 5381 (0x1505)
				expect(hash).toBe("00001505");
			});

			test("should produce correct hash for 'test'", async () => {
				const djb2 = new DJB2();
				const data = new TextEncoder().encode("test");
				const hash = await djb2.toHash(data);

				// DJB2 hash for "test"
				expect(hash).toBe("7c9e6865");
			});

			test("should produce correct hash for 'The quick brown fox jumps over the lazy dog'", async () => {
				const djb2 = new DJB2();
				const data = new TextEncoder().encode("The quick brown fox jumps over the lazy dog");
				const hash = await djb2.toHash(data);

				// DJB2 hash for this string
				expect(hash).toBe("34cc38de");
			});

			test("should produce correct hash for single character 'a'", async () => {
				const djb2 = new DJB2();
				const data = new TextEncoder().encode("a");
				const hash = await djb2.toHash(data);

				// DJB2 hash for "a": (5381 * 33 + 97) = 177674 = 0x2b606
				expect(hash).toBe("0002b606");
			});
		});

		describe("collision resistance", () => {
			test("should generate different hashes for similar strings", async () => {
				const djb2 = new DJB2();
				const hashes = new Set<string>();

				const testStrings = [
					"abc",
					"acb",
					"bac",
					"bca",
					"cab",
					"cba",
				];

				for (const str of testStrings) {
					const data = new TextEncoder().encode(str);
					const hash = await djb2.toHash(data);
					hashes.add(hash);
				}

				// All permutations should produce different hashes
				expect(hashes.size).toBe(testStrings.length);
			});

			test("should handle sequential strings differently", async () => {
				const djb2 = new DJB2();
				const hashes = new Set<string>();

				for (let i = 0; i < 100; i++) {
					const data = new TextEncoder().encode(`string${i}`);
					const hash = await djb2.toHash(data);
					hashes.add(hash);
				}

				// Should have unique hashes (or very few collisions)
				expect(hashes.size).toBeGreaterThan(95);
			});
		});

		describe("edge cases", () => {
			test("should handle large data", async () => {
				const djb2 = new DJB2();
				const largeData = new Uint8Array(1000000);
				for (let i = 0; i < largeData.length; i++) {
					largeData[i] = i % 256;
				}

				const hash = await djb2.toHash(largeData);

				expect(hash).toMatch(/^[0-9a-f]{8}$/);
				expect(hash.length).toBe(8);
			});

			test("should handle all byte values (0-255)", async () => {
				const djb2 = new DJB2();
				const data = new Uint8Array(256);
				for (let i = 0; i < 256; i++) {
					data[i] = i;
				}

				const hash = await djb2.toHash(data);

				expect(hash).toMatch(/^[0-9a-f]{8}$/);
				expect(hash.length).toBe(8);
			});

			test("should handle single byte", async () => {
				const djb2 = new DJB2();
				const data = new Uint8Array([42]);
				const hash = await djb2.toHash(data);

				expect(hash).toMatch(/^[0-9a-f]{8}$/);
				expect(hash.length).toBe(8);
			});
		});
	});
});
