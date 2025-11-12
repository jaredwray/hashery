import { describe, test, expect } from "vitest";
import { CRC } from "../../src/providers/crc.ts";
import type { HashProvider } from "../../src/types.ts";

describe("CRC Hash Provider", () => {
	describe("initialization", () => {
		test("should create instance without options", () => {
			const crc = new CRC();
			expect(crc).toBeInstanceOf(CRC);
		});

		test("should implement HashProvider interface", () => {
			const crc: HashProvider = new CRC();
			expect(crc).toHaveProperty("name");
			expect(crc).toHaveProperty("toHash");
			expect(typeof crc.toHash).toBe("function");
		});
	});

	describe("name property", () => {
		test("should return correct provider name", () => {
			const crc = new CRC();
			expect(crc.name).toBe("crc32");
		});
	});

	describe("toHash method", () => {
		test("should return a valid hex string", async () => {
			const crc = new CRC();
			const data = new TextEncoder().encode("test");
			const hash = await crc.toHash(data);

			// CRC-32 produces an 8-character hex string
			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should return consistent hash for same input", async () => {
			const crc = new CRC();
			const data = new TextEncoder().encode("hello world");
			const hash1 = await crc.toHash(data);
			const hash2 = await crc.toHash(data);

			expect(hash1).toBe(hash2);
		});

		test("should return different hashes for different inputs", async () => {
			const crc = new CRC();
			const data1 = new TextEncoder().encode("hello");
			const data2 = new TextEncoder().encode("world");
			const hash1 = await crc.toHash(data1);
			const hash2 = await crc.toHash(data2);

			expect(hash1).not.toBe(hash2);
		});

		test("should handle empty buffer", async () => {
			const crc = new CRC();
			const data = new Uint8Array(0);
			const hash = await crc.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash).toBe("00000000");
		});

		test("should handle Uint8Array", async () => {
			const crc = new CRC();
			const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
			const hash = await crc.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
		});

		test("should handle ArrayBuffer", async () => {
			const crc = new CRC();
			const buffer = new ArrayBuffer(5);
			const view = new Uint8Array(buffer);
			view.set([72, 101, 108, 108, 111]); // "Hello"
			const hash = await crc.toHash(buffer);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
		});

		test("should handle DataView", async () => {
			const crc = new CRC();
			const buffer = new ArrayBuffer(5);
			const view = new Uint8Array(buffer);
			view.set([72, 101, 108, 108, 111]); // "Hello"
			const dataView = new DataView(buffer);
			const hash = await crc.toHash(dataView);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
		});

		test("should handle Int8Array", async () => {
			const crc = new CRC();
			const data = new Int8Array([72, 101, 108, 108, 111]); // "Hello"
			const hash = await crc.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
		});

		test("should produce same hash for equivalent data in different formats", async () => {
			const crc = new CRC();
			const bytes = [72, 101, 108, 108, 111]; // "Hello"

			const uint8Array = new Uint8Array(bytes);
			const buffer = new ArrayBuffer(5);
			new Uint8Array(buffer).set(bytes);
			const dataView = new DataView(buffer);

			const hash1 = await crc.toHash(uint8Array);
			const hash2 = await crc.toHash(buffer);
			const hash3 = await crc.toHash(dataView);

			expect(hash1).toBe(hash2);
			expect(hash2).toBe(hash3);
		});
	});

	describe("known hash values", () => {
		test("should produce correct hash for empty string", async () => {
			const crc = new CRC();
			const data = new TextEncoder().encode("");
			const hash = await crc.toHash(data);
			// CRC-32 of empty string is 0
			expect(hash).toBe("00000000");
		});

		test("should produce correct hash for 'a'", async () => {
			const crc = new CRC();
			const data = new TextEncoder().encode("a");
			const hash = await crc.toHash(data);
			// CRC-32 of 'a' is 0xE8B7BE43
			expect(hash).toBe("e8b7be43");
		});

		test("should produce correct hash for '123456789'", async () => {
			const crc = new CRC();
			const data = new TextEncoder().encode("123456789");
			const hash = await crc.toHash(data);
			// CRC-32 of '123456789' is 0xCBF43926 (standard test vector)
			expect(hash).toBe("cbf43926");
		});

		test("should produce correct hash for 'The quick brown fox jumps over the lazy dog'", async () => {
			const crc = new CRC();
			const data = new TextEncoder().encode("The quick brown fox jumps over the lazy dog");
			const hash = await crc.toHash(data);
			// CRC-32 of this string is 0x414FA339
			expect(hash).toBe("414fa339");
		});
	});

	describe("collision resistance", () => {
		test("should have good distribution for sequential inputs", async () => {
			const crc = new CRC();
			const hashes = new Set<string>();

			// Test 100 sequential numbers
			for (let i = 0; i < 100; i++) {
				const data = new TextEncoder().encode(i.toString());
				const hash = await crc.toHash(data);
				hashes.add(hash);
			}

			// All hashes should be unique (no collisions in this small set)
			expect(hashes.size).toBe(100);
		});

		test("should produce different hashes for similar strings", async () => {
			const crc = new CRC();
			const data1 = new TextEncoder().encode("test");
			const data2 = new TextEncoder().encode("test1");
			const data3 = new TextEncoder().encode("test2");

			const hash1 = await crc.toHash(data1);
			const hash2 = await crc.toHash(data2);
			const hash3 = await crc.toHash(data3);

			expect(hash1).not.toBe(hash2);
			expect(hash2).not.toBe(hash3);
			expect(hash1).not.toBe(hash3);
		});
	});

	describe("edge cases", () => {
		test("should handle large data", async () => {
			const crc = new CRC();
			// Create a 1MB buffer
			const largeData = new Uint8Array(1024 * 1024);
			for (let i = 0; i < largeData.length; i++) {
				largeData[i] = i % 256;
			}

			const hash = await crc.toHash(largeData);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
			expect(hash.length).toBe(8);
		});

		test("should handle single byte", async () => {
			const crc = new CRC();
			const data = new Uint8Array([0]);
			const hash = await crc.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
		});

		test("should handle all zeros", async () => {
			const crc = new CRC();
			const data = new Uint8Array(100).fill(0);
			const hash = await crc.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
		});

		test("should handle all 0xFF", async () => {
			const crc = new CRC();
			const data = new Uint8Array(100).fill(0xFF);
			const hash = await crc.toHash(data);

			expect(hash).toMatch(/^[0-9a-f]{8}$/);
		});
	});
});
