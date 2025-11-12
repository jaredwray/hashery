import { describe, expect, test } from "vitest";
import { WebCrypto, type WebCryptoOptions } from "../../src/providers/crypto.js";

describe("WebCrypto", () => {
	test("initialization", () => {
		const webCrypto = new WebCrypto();
		expect(webCrypto).toBeDefined();
	});

	test("should have default SHA-256 algorithm", () => {
		const webCrypto = new WebCrypto();
		expect(webCrypto.name).toBe("SHA-256");
	});

	describe("constructor with options", () => {
		test("should accept SHA-256 algorithm", () => {
			const options: WebCryptoOptions = {
				algorithm: "SHA-256",
			};
			const webCrypto = new WebCrypto(options);
			expect(webCrypto.name).toBe("SHA-256");
		});

		test("should accept SHA-384 algorithm", () => {
			const options: WebCryptoOptions = {
				algorithm: "SHA-384",
			};
			const webCrypto = new WebCrypto(options);
			expect(webCrypto.name).toBe("SHA-384");
		});

		test("should accept SHA-512 algorithm", () => {
			const options: WebCryptoOptions = {
				algorithm: "SHA-512",
			};
			const webCrypto = new WebCrypto(options);
			expect(webCrypto.name).toBe("SHA-512");
		});

		test("should handle undefined options", () => {
			const webCrypto = new WebCrypto(undefined);
			expect(webCrypto.name).toBe("SHA-256");
		});

		test("should handle empty options object", () => {
			const webCrypto = new WebCrypto({});
			expect(webCrypto.name).toBe("SHA-256");
		});
	});

	describe("name property", () => {
		test("should return algorithm as name", () => {
			const webCrypto = new WebCrypto({ algorithm: "SHA-512" });
			expect(webCrypto.name).toBe("SHA-512");
		});

		test("should return default algorithm when no options", () => {
			const webCrypto = new WebCrypto();
			expect(webCrypto.name).toBe("SHA-256");
		});
	});

	describe("toHash method", () => {
		test("should generate SHA-256 hash by default", async () => {
			const webCrypto = new WebCrypto();
			const data = new TextEncoder().encode("test data");
			const hash = await webCrypto.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true); // Should be valid hex
		});

		test("should generate SHA-384 hash", async () => {
			const webCrypto = new WebCrypto({ algorithm: "SHA-384" });
			const data = new TextEncoder().encode("test data");
			const hash = await webCrypto.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(96); // SHA-384 produces 96 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should generate SHA-512 hash", async () => {
			const webCrypto = new WebCrypto({ algorithm: "SHA-512" });
			const data = new TextEncoder().encode("test data");
			const hash = await webCrypto.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(128); // SHA-512 produces 128 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should generate consistent hashes for same data", async () => {
			const webCrypto = new WebCrypto();
			const data = new TextEncoder().encode("test data");

			const hash1 = await webCrypto.toHash(data);
			const hash2 = await webCrypto.toHash(data);

			expect(hash1).toBe(hash2);
		});

		test("should generate different hashes for different data", async () => {
			const webCrypto = new WebCrypto();
			const data1 = new TextEncoder().encode("test data 1");
			const data2 = new TextEncoder().encode("test data 2");

			const hash1 = await webCrypto.toHash(data1);
			const hash2 = await webCrypto.toHash(data2);

			expect(hash1).not.toBe(hash2);
		});

		test("should handle empty buffer", async () => {
			const webCrypto = new WebCrypto();
			const data = new Uint8Array(0);

			const hash = await webCrypto.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should handle ArrayBuffer input", async () => {
			const webCrypto = new WebCrypto();
			const encoder = new TextEncoder();
			const arrayBuffer = encoder.encode("test").buffer;

			const hash = await webCrypto.toHash(arrayBuffer);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should handle Uint8Array input", async () => {
			const webCrypto = new WebCrypto();
			const data = new Uint8Array([1, 2, 3, 4, 5]);

			const hash = await webCrypto.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should handle DataView input", async () => {
			const webCrypto = new WebCrypto();
			const buffer = new ArrayBuffer(8);
			const view = new DataView(buffer);
			view.setUint8(0, 255);

			const hash = await webCrypto.toHash(view);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should generate different hashes for different algorithms", async () => {
			const data = new TextEncoder().encode("test data");

			const sha256 = new WebCrypto({ algorithm: "SHA-256" });
			const sha384 = new WebCrypto({ algorithm: "SHA-384" });
			const sha512 = new WebCrypto({ algorithm: "SHA-512" });

			const hash256 = await sha256.toHash(data);
			const hash384 = await sha384.toHash(data);
			const hash512 = await sha512.toHash(data);

			expect(hash256).not.toBe(hash384);
			expect(hash256).not.toBe(hash512);
			expect(hash384).not.toBe(hash512);
			expect(hash256.length).toBe(64);
			expect(hash384.length).toBe(96);
			expect(hash512.length).toBe(128);
		});

		test("should handle long data", async () => {
			const webCrypto = new WebCrypto();
			const longString = "a".repeat(10000);
			const data = new TextEncoder().encode(longString);

			const hash = await webCrypto.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should handle unicode characters", async () => {
			const webCrypto = new WebCrypto();
			const unicodeString = "Hello 世界 🌍";
			const data = new TextEncoder().encode(unicodeString);

			const hash = await webCrypto.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should generate valid hex output with all lowercase", async () => {
			const webCrypto = new WebCrypto();
			const data = new TextEncoder().encode("test");

			const hash = await webCrypto.toHash(data);

			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
			expect(hash).toBe(hash.toLowerCase());
		});

		test("should pad hex values correctly", async () => {
			const webCrypto = new WebCrypto();
			const data = new Uint8Array([0, 1, 15, 16, 255]);

			const hash = await webCrypto.toHash(data);

			// Hash should not have any single-digit hex values (all should be padded)
			expect(hash.length).toBe(64);
			expect(hash.length % 2).toBe(0);
		});
	});

	describe("HashProvider interface compliance", () => {
		test("should implement HashProvider interface", async () => {
			const webCrypto = new WebCrypto();

			// Check that it has the required properties
			expect(typeof webCrypto.name).toBe("string");
			expect(typeof webCrypto.toHash).toBe("function");

			// Verify toHash returns a Promise<string>
			const data = new TextEncoder().encode("test");
			const result = webCrypto.toHash(data);
			expect(result).toBeInstanceOf(Promise);

			const hash = await result;
			expect(typeof hash).toBe("string");
		});
	});

	describe("integration with HashProviders", () => {
		test("should work as a provider in HashProviders", async () => {
			const webCrypto = new WebCrypto({ algorithm: "SHA-256" });

			expect(webCrypto.name).toBe("SHA-256");

			const data = new TextEncoder().encode("test data");
			const hash = await webCrypto.toHash(data);

			expect(hash).toBeDefined();
			expect(hash.length).toBe(64);
		});

		test("should allow multiple instances with different algorithms", async () => {
			const sha256 = new WebCrypto({ algorithm: "SHA-256" });
			const sha512 = new WebCrypto({ algorithm: "SHA-512" });

			expect(sha256.name).toBe("SHA-256");
			expect(sha512.name).toBe("SHA-512");

			const data = new TextEncoder().encode("test");

			const hash256 = await sha256.toHash(data);
			const hash512 = await sha512.toHash(data);

			expect(hash256.length).toBe(64);
			expect(hash512.length).toBe(128);
			expect(hash256).not.toBe(hash512);
		});
	});

	describe("real-world hash values", () => {
		test("should generate correct SHA-256 hash for known input", async () => {
			const webCrypto = new WebCrypto({ algorithm: "SHA-256" });
			const data = new TextEncoder().encode("hello");
			const hash = await webCrypto.toHash(data);

			// Known SHA-256 hash for "hello"
			expect(hash).toBe(
				"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
			);
		});

		test("should generate correct SHA-384 hash for known input", async () => {
			const webCrypto = new WebCrypto({ algorithm: "SHA-384" });
			const data = new TextEncoder().encode("hello");
			const hash = await webCrypto.toHash(data);

			// Known SHA-384 hash for "hello"
			expect(hash).toBe(
				"59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f",
			);
		});

		test("should generate correct SHA-512 hash for known input", async () => {
			const webCrypto = new WebCrypto({ algorithm: "SHA-512" });
			const data = new TextEncoder().encode("hello");
			const hash = await webCrypto.toHash(data);

			// Known SHA-512 hash for "hello"
			expect(hash).toBe(
				"9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
			);
		});
	});
});
