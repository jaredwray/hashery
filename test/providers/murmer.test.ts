import { describe, test, expect } from "vitest";
import { Murmer } from "../../src/providers/murmer.ts";
import type { HashProvider } from "../../src/types.ts";

describe("Murmer Hash Provider", () => {
	describe("initialization", () => {
		test("should create instance without options", () => {
			const murmer = new Murmer();
			expect(murmer).toBeInstanceOf(Murmer);
		});

		test("should create instance with custom seed", () => {
			const murmer = new Murmer(12345);
			expect(murmer).toBeInstanceOf(Murmer);
			expect(murmer.seed).toBe(12345);
		});

		test("should implement HashProvider interface", () => {
			const murmer: HashProvider = new Murmer();
			expect(murmer).toHaveProperty("name");
			expect(murmer).toHaveProperty("toHash");
			expect(typeof murmer.toHash).toBe("function");
		});
	});

	describe("name property", () => {
		test("should return 'murmer' as the provider name", () => {
			const murmer = new Murmer();
			expect(murmer.name).toBe("murmer");
		});
	});

	describe("seed property", () => {
		test("should return default seed of 0", () => {
			const murmer = new Murmer();
			expect(murmer.seed).toBe(0);
		});

		test("should return custom seed", () => {
			const murmer = new Murmer(42);
			expect(murmer.seed).toBe(42);
		});
	});

	describe("toHash method", () => {
		test("should return a valid hex string", async () => {
			const murmer = new Murmer();
			const data = new TextEncoder().encode("test");
			const hash = await murmer.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should generate consistent hashes for same data", async () => {
			const murmer = new Murmer();
			const data = new TextEncoder().encode("test data");

			const hash1 = await murmer.toHash(data);
			const hash2 = await murmer.toHash(data);

			expect(hash1).toBe(hash2);
		});

		test("should generate different hashes for different data", async () => {
			const murmer = new Murmer();
			const data1 = new TextEncoder().encode("hello");
			const data2 = new TextEncoder().encode("world");

			const hash1 = await murmer.toHash(data1);
			const hash2 = await murmer.toHash(data2);

			expect(hash1).not.toBe(hash2);
		});

		test("should generate different hashes with different seeds", async () => {
			const murmer_seed0 = new Murmer(0);
			const murmer_seed1 = new Murmer(1);
			const data = new TextEncoder().encode("test");

			const hash1 = await murmer_seed0.toHash(data);
			const hash2 = await murmer_seed1.toHash(data);

			expect(hash1).not.toBe(hash2);
		});

		test("should handle empty buffer", async () => {
			const murmer = new Murmer();
			const data = new Uint8Array(0);
			const hash = await murmer.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Uint8Array input", async () => {
			const murmer = new Murmer();
			const data = new TextEncoder().encode("hello");
			const hash = await murmer.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with ArrayBuffer input", async () => {
			const murmer = new Murmer();
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode("hello");
			const arrayBuffer = uint8Array.buffer;

			const hash = await murmer.toHash(arrayBuffer);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with DataView input", async () => {
			const murmer = new Murmer();
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode("hello");
			const dataView = new DataView(uint8Array.buffer);

			const hash = await murmer.toHash(dataView);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Int8Array input", async () => {
			const murmer = new Murmer();
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode("hello");
			const int8Array = new Int8Array(uint8Array.buffer);

			const hash = await murmer.toHash(int8Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Uint16Array input", async () => {
			const murmer = new Murmer();
			const uint16Array = new Uint16Array([104, 101, 108, 108, 111]); // "hello" as uint16 values

			const hash = await murmer.toHash(uint16Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Int16Array input", async () => {
			const murmer = new Murmer();
			const int16Array = new Int16Array([104, 101, 108, 108, 111]);

			const hash = await murmer.toHash(int16Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Uint32Array input", async () => {
			const murmer = new Murmer();
			const uint32Array = new Uint32Array([0x6c6c6568, 0x0000006f]); // "hello" as uint32 values (little-endian)

			const hash = await murmer.toHash(uint32Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should work with Float32Array input", async () => {
			const murmer = new Murmer();
			const float32Array = new Float32Array([1.5, 2.5, 3.5]);

			const hash = await murmer.toHash(float32Array);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should produce same hash for equivalent data in different formats", async () => {
			const murmer = new Murmer();
			const text = "hello world";
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode(text);
			const arrayBuffer = uint8Array.buffer;
			const dataView = new DataView(arrayBuffer);

			const hash1 = await murmer.toHash(uint8Array);
			const hash2 = await murmer.toHash(arrayBuffer);
			const hash3 = await murmer.toHash(dataView);

			expect(hash1).toBe(hash2);
			expect(hash2).toBe(hash3);
		});

		test("should produce same hash for Uint8Array and Int8Array with same underlying buffer", async () => {
			const murmer = new Murmer();
			const encoder = new TextEncoder();
			const uint8Array = encoder.encode("test");
			const int8Array = new Int8Array(uint8Array.buffer);

			const hash1 = await murmer.toHash(uint8Array);
			const hash2 = await murmer.toHash(int8Array);

			expect(hash1).toBe(hash2);
		});

		describe("known hash values", () => {
			test("should produce correct hash for 'hello' with seed 0", async () => {
				const murmer = new Murmer(0);
				const data = new TextEncoder().encode("hello");
				const hash = await murmer.toHash(data);

				// Murmer hash for "hello" with seed 0
				expect(hash).toBe("248bfa47");
			});

			test("should produce correct hash for empty string with seed 0", async () => {
				const murmer = new Murmer(0);
				const data = new TextEncoder().encode("");
				const hash = await murmer.toHash(data);

				// Murmer hash for empty string with seed 0
				expect(hash).toBe("00000000");
			});

			test("should produce correct hash for 'test' with seed 0", async () => {
				const murmer = new Murmer(0);
				const data = new TextEncoder().encode("test");
				const hash = await murmer.toHash(data);

				// Murmer hash for "test" with seed 0
				expect(hash).toBe("ba6bd213");
			});

			test("should produce correct hash for 'The quick brown fox jumps over the lazy dog' with seed 0", async () => {
				const murmer = new Murmer(0);
				const data = new TextEncoder().encode("The quick brown fox jumps over the lazy dog");
				const hash = await murmer.toHash(data);

				// Murmer hash for this string with seed 0
				expect(hash).toBe("2e4ff723");
			});

			test("should produce correct hash for single character 'a' with seed 0", async () => {
				const murmer = new Murmer(0);
				const data = new TextEncoder().encode("a");
				const hash = await murmer.toHash(data);

				// Murmer hash for "a" with seed 0
				expect(hash).toBe("3c2569b2");
			});

			test("should produce correct hash for 'hello' with seed 1", async () => {
				const murmer = new Murmer(1);
				const data = new TextEncoder().encode("hello");
				const hash = await murmer.toHash(data);

				// Murmer hash for "hello" with seed 1 (different from seed 0)
				expect(hash).not.toBe("248bfa47");
			});
		});

		describe("collision resistance", () => {
			test("should generate different hashes for similar strings", async () => {
				const murmer = new Murmer();
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
					const hash = await murmer.toHash(data);
					hashes.add(hash);
				}

				// All permutations should produce different hashes
				expect(hashes.size).toBe(testStrings.length);
			});

			test("should handle sequential strings differently", async () => {
				const murmer = new Murmer();
				const hashes = new Set<string>();

				for (let i = 0; i < 100; i++) {
					const data = new TextEncoder().encode(`string${i}`);
					const hash = await murmer.toHash(data);
					hashes.add(hash);
				}

				// Should have unique hashes (or very few collisions)
				expect(hashes.size).toBeGreaterThan(95);
			});
		});

		describe("edge cases", () => {
			test("should handle large data", async () => {
				const murmer = new Murmer();
				const largeData = new Uint8Array(1000000);
				for (let i = 0; i < largeData.length; i++) {
					largeData[i] = i % 256;
				}

				const hash = await murmer.toHash(largeData);

				expect(hash).toMatch(/^[0-9a-f]{8}$/);
				expect(hash.length).toBe(8);
			});

			test("should handle all byte values (0-255)", async () => {
				const murmer = new Murmer();
				const data = new Uint8Array(256);
				for (let i = 0; i < 256; i++) {
					data[i] = i;
				}

				const hash = await murmer.toHash(data);

				expect(hash).toMatch(/^[0-9a-f]{8}$/);
				expect(hash.length).toBe(8);
			});

			test("should handle single byte", async () => {
				const murmer = new Murmer();
				const data = new Uint8Array([42]);
				const hash = await murmer.toHash(data);

				expect(hash).toMatch(/^[0-9a-f]{8}$/);
				expect(hash.length).toBe(8);
			});

			test("should handle data lengths that are not multiples of 4", async () => {
				const murmer = new Murmer();

				// Test various lengths: 1, 2, 3, 5, 6, 7 bytes
				for (const length of [1, 2, 3, 5, 6, 7]) {
					const data = new Uint8Array(length);
					for (let i = 0; i < length; i++) {
						data[i] = i;
					}

					const hash = await murmer.toHash(data);

					expect(hash).toMatch(/^[0-9a-f]{8}$/);
					expect(hash.length).toBe(8);
				}
			});
		});
	});
});
