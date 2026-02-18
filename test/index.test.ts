import { describe, expect, test } from "vitest";
import { Hashery, type HasheryOptions } from "../src/index.js";
import { HashProviders } from "../src/providers.js";

describe("Hashery", () => {
	test("initialization", () => {
		const hashery = new Hashery();
		expect(hashery).toBeDefined();
	});

	test("setting options", () => {
		const options: HasheryOptions = {
			throwOnEmitError: true,
		};
		const hashery = new Hashery(options);
		expect(hashery.throwOnEmitError).toBe(true);
	});

	test("should load providers from constructor options", () => {
		const customProvider1 = {
			name: "custom-provider-1",
			toHash: async (_data: BufferSource) => "hash-1",
		};
		const customProvider2 = {
			name: "custom-provider-2",
			toHash: async (_data: BufferSource) => "hash-2",
		};

		const hashery = new Hashery({
			providers: [customProvider1, customProvider2],
		});

		// Should have base providers (7) + custom providers (2) = 9 total
		expect(hashery.providers.providers.size).toBe(9);
		expect(hashery.providers.providers.has("custom-provider-1")).toBe(true);
		expect(hashery.providers.providers.has("custom-provider-2")).toBe(true);
		expect(hashery.providers.providers.has("SHA-256")).toBe(true);
		expect(hashery.providers.providers.has("SHA-384")).toBe(true);
		expect(hashery.providers.providers.has("SHA-512")).toBe(true);
		expect(hashery.providers.providers.has("djb2")).toBe(true);
		expect(hashery.providers.providers.has("murmur")).toBe(true);
	});

	test("should include base providers by default", () => {
		const hashery = new Hashery();

		// Should have 7 base providers by default
		expect(hashery.providers.providers.size).toBe(7);
		expect(hashery.providers.providers.has("SHA-256")).toBe(true);
		expect(hashery.providers.providers.has("SHA-384")).toBe(true);
		expect(hashery.providers.providers.has("SHA-512")).toBe(true);
		expect(hashery.providers.providers.has("djb2")).toBe(true);
		expect(hashery.providers.providers.has("murmur")).toBe(true);
	});

	test("should exclude base providers when includeBase is false", () => {
		const customProvider = {
			name: "custom-only",
			toHash: async (_data: BufferSource) => "custom-hash",
		};

		const hashery = new Hashery({
			includeBase: false,
			providers: [customProvider],
		});

		// Should only have the custom provider
		expect(hashery.providers.providers.size).toBe(1);
		expect(hashery.providers.providers.has("custom-only")).toBe(true);
		expect(hashery.providers.providers.has("SHA-256")).toBe(false);
		expect(hashery.providers.providers.has("SHA-384")).toBe(false);
		expect(hashery.providers.providers.has("SHA-512")).toBe(false);
		expect(hashery.providers.providers.has("djb2")).toBe(false);
	});

	test("should start with empty providers when includeBase is false and no providers given", () => {
		const hashery = new Hashery({
			includeBase: false,
		});

		// Should have no providers
		expect(hashery.providers.providers.size).toBe(0);
	});

	test("should include base providers when includeBase is explicitly true", () => {
		const customProvider = {
			name: "custom-with-base",
			toHash: async (_data: BufferSource) => "custom-hash",
		};

		const hashery = new Hashery({
			includeBase: true,
			providers: [customProvider],
		});

		// Should have base providers (7) + custom provider (1) = 8 total
		expect(hashery.providers.providers.size).toBe(8);
		expect(hashery.providers.providers.has("custom-with-base")).toBe(true);
		expect(hashery.providers.providers.has("SHA-256")).toBe(true);
		expect(hashery.providers.providers.has("SHA-384")).toBe(true);
		expect(hashery.providers.providers.has("SHA-512")).toBe(true);
		expect(hashery.providers.providers.has("djb2")).toBe(true);
		expect(hashery.providers.providers.has("murmur")).toBe(true);
	});

	describe("parse property", () => {
		test("should have default JSON.parse function", () => {
			const hashery = new Hashery();
			expect(hashery.parse).toBeDefined();
			expect(typeof hashery.parse).toBe("function");

			const testData = '{"key":"value"}';
			const result = hashery.parse(testData);
			expect(result).toEqual({ key: "value" });
		});

		test("should set custom parse function via constructor", () => {
			const customParse = (data: string) => {
				return { custom: true, data };
			};

			const hashery = new Hashery({ parse: customParse });
			const result = hashery.parse("test");
			expect(result).toEqual({ custom: true, data: "test" });
		});

		test("should get parse function", () => {
			const customParse = (data: string) => {
				return { parsed: data };
			};

			const hashery = new Hashery({ parse: customParse });
			const parseFn = hashery.parse;
			expect(parseFn).toBe(customParse);
			expect(parseFn("test")).toEqual({ parsed: "test" });
		});

		test("should set parse function using setter", () => {
			const hashery = new Hashery();

			const customParse = (data: string) => {
				return { custom: "parsed", original: data };
			};

			hashery.parse = customParse;
			const result = hashery.parse("test-data");
			expect(result).toEqual({ custom: "parsed", original: "test-data" });
		});

		test("should override parse function set in constructor", () => {
			const initialParse = (data: string) => {
				return { initial: data };
			};

			const newParse = (data: string) => {
				return { new: data };
			};

			const hashery = new Hashery({ parse: initialParse });
			expect(hashery.parse("test")).toEqual({ initial: "test" });

			hashery.parse = newParse;
			expect(hashery.parse("test")).toEqual({ new: "test" });
		});
	});

	describe("stringify property", () => {
		test("should have default JSON.stringify function", () => {
			const hashery = new Hashery();
			expect(hashery.stringify).toBeDefined();
			expect(typeof hashery.stringify).toBe("function");

			const testData = { key: "value" };
			const result = hashery.stringify(testData);
			expect(result).toBe('{"key":"value"}');
		});

		test("should set custom stringify function via constructor", () => {
			const customStringify = (data: unknown) => {
				return `custom:${JSON.stringify(data)}`;
			};

			const hashery = new Hashery({ stringify: customStringify });
			const result = hashery.stringify({ test: true });
			expect(result).toBe('custom:{"test":true}');
		});

		test("should get stringify function", () => {
			const customStringify = (data: unknown) => {
				return `stringified:${JSON.stringify(data)}`;
			};

			const hashery = new Hashery({ stringify: customStringify });
			const stringifyFn = hashery.stringify;
			expect(stringifyFn).toBe(customStringify);
			expect(stringifyFn({ test: "data" })).toBe('stringified:{"test":"data"}');
		});

		test("should set stringify function using setter", () => {
			const hashery = new Hashery();

			const customStringify = (data: unknown) => {
				return `CUSTOM::${JSON.stringify(data)}`;
			};

			hashery.stringify = customStringify;
			const result = hashery.stringify({ foo: "bar" });
			expect(result).toBe('CUSTOM::{"foo":"bar"}');
		});

		test("should override stringify function set in constructor", () => {
			const initialStringify = (data: unknown) => {
				return `initial:${JSON.stringify(data)}`;
			};

			const newStringify = (data: unknown) => {
				return `new:${JSON.stringify(data)}`;
			};

			const hashery = new Hashery({ stringify: initialStringify });
			expect(hashery.stringify({ test: 1 })).toBe('initial:{"test":1}');

			hashery.stringify = newStringify;
			expect(hashery.stringify({ test: 1 })).toBe('new:{"test":1}');
		});
	});

	describe("parse and stringify together", () => {
		test("should work together with custom implementations", () => {
			const customParse = (data: string) => {
				return JSON.parse(data.replace(/^PREFIX:/, ""));
			};

			const customStringify = (data: unknown) => {
				return `PREFIX:${JSON.stringify(data)}`;
			};

			const hashery = new Hashery({
				parse: customParse,
				stringify: customStringify,
			});

			const original = { test: "data", num: 42 };
			const stringified = hashery.stringify(original);
			expect(stringified).toBe('PREFIX:{"test":"data","num":42}');

			const parsed = hashery.parse(stringified);
			expect(parsed).toEqual(original);
		});

		test("should allow runtime modification of both functions", () => {
			const hashery = new Hashery();

			hashery.parse = (data: string) => ({ wrapped: JSON.parse(data) });
			hashery.stringify = (data: unknown) => JSON.stringify({ wrapped: data });

			const stringified = hashery.stringify({ key: "value" });
			expect(stringified).toBe('{"wrapped":{"key":"value"}}');

			const parsed = hashery.parse('{"inner":"data"}');
			expect(parsed).toEqual({ wrapped: { inner: "data" } });
		});
	});

	describe("defaultAlgorithm property", () => {
		test("should have SHA-256 as default algorithm", () => {
			const hashery = new Hashery();
			expect(hashery.defaultAlgorithm).toBe("SHA-256");
		});

		test("should set defaultAlgorithm via constructor", () => {
			const hashery = new Hashery({ defaultAlgorithm: "SHA-512" });
			expect(hashery.defaultAlgorithm).toBe("SHA-512");
		});

		test("should allow setting defaultAlgorithm via property setter", () => {
			const hashery = new Hashery();
			expect(hashery.defaultAlgorithm).toBe("SHA-256");

			hashery.defaultAlgorithm = "SHA-384";
			expect(hashery.defaultAlgorithm).toBe("SHA-384");
		});

		test("should use defaultAlgorithm when no algorithm specified in toHash", async () => {
			const hashery = new Hashery({ defaultAlgorithm: "SHA-512" });
			const data = { name: "test" };
			const hash = await hashery.toHash(data);

			// SHA-512 produces 128 hex characters
			expect(hash.length).toBe(128);
		});

		test("should use defaultAlgorithm when no algorithm specified in toNumber", async () => {
			const hashery = new Hashery({ defaultAlgorithm: "djb2" });
			const data = { name: "test" };

			// Should not throw error and should use djb2
			const num = await hashery.toNumber(data, { min: 0, max: 100 });
			expect(num).toBeGreaterThanOrEqual(0);
			expect(num).toBeLessThanOrEqual(100);
		});

		test("should allow runtime change of defaultAlgorithm", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			// First hash with SHA-256 (default)
			const hash256 = await hashery.toHash(data);
			expect(hash256.length).toBe(64);

			// Change default to SHA-512
			hashery.defaultAlgorithm = "SHA-512";
			const hash512 = await hashery.toHash(data);
			expect(hash512.length).toBe(128);

			// Hashes should be different
			expect(hash256).not.toBe(hash512);
		});

		test("should allow setting defaultAlgorithm to non-crypto algorithms", () => {
			const hashery = new Hashery();
			hashery.defaultAlgorithm = "djb2";
			expect(hashery.defaultAlgorithm).toBe("djb2");
		});

		test("should override defaultAlgorithm when algorithm option is provided", async () => {
			const hashery = new Hashery({ defaultAlgorithm: "SHA-512" });
			const data = { name: "test" };

			// Explicitly use SHA-256
			const hash = await hashery.toHash(data, { algorithm: "SHA-256" });

			// Should use SHA-256 (64 chars) not SHA-512 (128 chars)
			expect(hash.length).toBe(64);
		});
	});

	describe("defaultAlgorithmSync property", () => {
		test("should have djb2 as default synchronous algorithm", () => {
			const hashery = new Hashery();
			expect(hashery.defaultAlgorithmSync).toBe("djb2");
		});

		test("should set defaultAlgorithmSync via constructor", () => {
			const hashery = new Hashery({ defaultAlgorithmSync: "fnv1" });
			expect(hashery.defaultAlgorithmSync).toBe("fnv1");
		});

		test("should allow setting defaultAlgorithmSync via property setter", () => {
			const hashery = new Hashery();
			expect(hashery.defaultAlgorithmSync).toBe("djb2");

			hashery.defaultAlgorithmSync = "murmur";
			expect(hashery.defaultAlgorithmSync).toBe("murmur");
		});

		test("should allow runtime change of defaultAlgorithmSync", () => {
			const hashery = new Hashery();
			expect(hashery.defaultAlgorithmSync).toBe("djb2");

			// Change default to fnv1
			hashery.defaultAlgorithmSync = "fnv1";
			expect(hashery.defaultAlgorithmSync).toBe("fnv1");

			// Change to crc32
			hashery.defaultAlgorithmSync = "crc32";
			expect(hashery.defaultAlgorithmSync).toBe("crc32");
		});

		test("should allow setting defaultAlgorithmSync to any algorithm", () => {
			const hashery = new Hashery();
			hashery.defaultAlgorithmSync = "SHA-256";
			expect(hashery.defaultAlgorithmSync).toBe("SHA-256");
		});

		test("should be independent of defaultAlgorithm", () => {
			const hashery = new Hashery({
				defaultAlgorithm: "SHA-512",
				defaultAlgorithmSync: "fnv1",
			});
			expect(hashery.defaultAlgorithm).toBe("SHA-512");
			expect(hashery.defaultAlgorithmSync).toBe("fnv1");
		});
	});

	describe("toHash method", () => {
		test("should generate SHA-256 hash by default", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const hash = await hashery.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true); // Should be valid hex
		});

		test("should generate consistent hashes for same data", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };

			const hash1 = await hashery.toHash(data);
			const hash2 = await hashery.toHash(data);

			expect(hash1).toBe(hash2);
		});

		test("should generate different hashes for different data", async () => {
			const hashery = new Hashery();
			const data1 = { name: "test", value: 42 };
			const data2 = { name: "test", value: 43 };

			const hash1 = await hashery.toHash(data1);
			const hash2 = await hashery.toHash(data2);

			expect(hash1).not.toBe(hash2);
		});

		test("should support SHA-384 algorithm", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const hash = await hashery.toHash(data, { algorithm: "SHA-384" });

			expect(hash).toBeDefined();
			expect(hash.length).toBe(96); // SHA-384 produces 96 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should support SHA-512 algorithm", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const hash = await hashery.toHash(data, { algorithm: "SHA-512" });

			expect(hash).toBeDefined();
			expect(hash.length).toBe(128); // SHA-512 produces 128 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should use custom stringify function when hashing", async () => {
			const customStringify = (data: unknown) => {
				// Sort keys to ensure consistent hashing
				return JSON.stringify(data, Object.keys(data as object).sort());
			};

			const hashery = new Hashery({ stringify: customStringify });

			// These two objects have the same content but different key order
			const data1 = { b: 2, a: 1 };
			const data2 = { a: 1, b: 2 };

			const hash1 = await hashery.toHash(data1);
			const hash2 = await hashery.toHash(data2);

			expect(hash1).toBe(hash2);
		});

		test("should handle primitive types", async () => {
			const hashery = new Hashery();

			const stringHash = await hashery.toHash("test string");
			const numberHash = await hashery.toHash(42);
			const booleanHash = await hashery.toHash(true);
			const nullHash = await hashery.toHash(null);

			expect(stringHash).toBeDefined();
			expect(numberHash).toBeDefined();
			expect(booleanHash).toBeDefined();
			expect(nullHash).toBeDefined();

			// Each should be different
			const hashes = [stringHash, numberHash, booleanHash, nullHash];
			const uniqueHashes = new Set(hashes);
			expect(uniqueHashes.size).toBe(4);
		});

		test("should handle arrays", async () => {
			const hashery = new Hashery();
			const data = [1, 2, 3, { name: "test" }];

			const hash = await hashery.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should handle nested objects", async () => {
			const hashery = new Hashery();
			const data = {
				user: {
					name: "John",
					profile: {
						age: 30,
						email: "john@example.com",
					},
				},
				timestamp: 1234567890,
			};

			const hash = await hashery.toHash(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should generate different hashes for different algorithms", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const sha256Hash = await hashery.toHash(data, { algorithm: "SHA-256" });
			const sha512Hash = await hashery.toHash(data, { algorithm: "SHA-512" });

			expect(sha256Hash).not.toBe(sha512Hash);
			expect(sha256Hash.length).toBe(64);
			expect(sha512Hash.length).toBe(128);
		});

		test("should handle empty objects and arrays", async () => {
			const hashery = new Hashery();

			const emptyObjectHash = await hashery.toHash({});
			const emptyArrayHash = await hashery.toHash([]);

			expect(emptyObjectHash).toBeDefined();
			expect(emptyArrayHash).toBeDefined();
			expect(emptyObjectHash).not.toBe(emptyArrayHash);
		});

		test("should fallback to WebCrypto SHA-256 when provider not found and emit warning", async () => {
			// Create a Hashery instance with no base providers
			const hashery = new Hashery({ includeBase: false });
			const warnings: string[] = [];

			// Listen for warning events
			hashery.on("warn", (message: string) => {
				warnings.push(message);
			});

			// Verify no providers are loaded
			expect(hashery.providers.providers.size).toBe(0);

			// Call toHash with an algorithm that doesn't exist
			const data = { name: "test", value: 42 };
			const hash = await hashery.toHash(data, { algorithm: "SHA-256" });

			// Should still get a valid SHA-256 hash from the fallback
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true); // Should be valid hex

			// Verify the hash is consistent
			const hash2 = await hashery.toHash(data, { algorithm: "SHA-256" });
			expect(hash).toBe(hash2);

			// Verify warning was emitted (only once because second call is cached)
			expect(warnings.length).toBeGreaterThanOrEqual(1);
			expect(warnings[0]).toContain("SHA-256");
			expect(warnings[0]).toContain("not found");
			expect(warnings[0]).toContain("Falling back");
		});

		test("should fallback to SHA-256 for custom provider when not loaded", async () => {
			// Create a Hashery instance with only SHA-512 provider
			const hashery = new Hashery({ includeBase: false });

			// Add only SHA-512, not SHA-256
			const customProvider = {
				name: "custom-hash",
				toHash: async (_data: BufferSource) => "custom-hash-output",
			};
			hashery.providers.add(customProvider);

			// Try to use SHA-256 which isn't in the providers
			const data = { name: "test" };
			const hash = await hashery.toHash(data, { algorithm: "SHA-256" });

			// Should fallback to WebCrypto SHA-256
			expect(hash).toBeDefined();
			expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);

			// Should NOT be the custom provider's output
			expect(hash).not.toBe("custom-hash-output");
		});

		test("should emit warn event with correct message for invalid algorithm", async () => {
			const hashery = new Hashery();
			const warnings: string[] = [];

			hashery.on("warn", (message: string) => {
				warnings.push(message);
			});

			const data = { name: "test" };
			const hash = await hashery.toHash(data, { algorithm: "invalid-algo" });

			// Should still produce a hash (using fallback)
			expect(hash).toBeDefined();

			// Should have emitted exactly one warning
			expect(warnings.length).toBe(1);
			expect(warnings[0]).toContain("invalid-algo");
			expect(warnings[0]).toContain("SHA-256");
			expect(warnings[0]).toContain("Invalid algorithm");
		});

		test("should truncate hash when maxLength is specified", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const maxLength = 16;

			const hash = await hashery.toHash(data, {
				algorithm: "SHA-256",
				maxLength,
			});

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(maxLength);
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true); // Should still be valid hex
		});

		test("should not truncate hash when maxLength is greater than hash length", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const maxLength = 100; // SHA-256 produces 64 characters

			const hash = await hashery.toHash(data, {
				algorithm: "SHA-256",
				maxLength,
			});

			expect(hash).toBeDefined();
			expect(hash.length).toBe(64); // Should be full SHA-256 length
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should not truncate hash when maxLength equals hash length", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const maxLength = 64; // Exactly SHA-256 length

			const hash = await hashery.toHash(data, {
				algorithm: "SHA-256",
				maxLength,
			});

			expect(hash).toBeDefined();
			expect(hash.length).toBe(64);
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should handle maxLength of 1", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const hash = await hashery.toHash(data, {
				algorithm: "SHA-256",
				maxLength: 1,
			});

			expect(hash).toBeDefined();
			expect(hash.length).toBe(1);
			expect(/^[a-f0-9]$/.test(hash)).toBe(true);
		});

		test("should work with maxLength on different algorithms", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const maxLength = 32;

			const sha256Hash = await hashery.toHash(data, {
				algorithm: "SHA-256",
				maxLength,
			});
			const sha512Hash = await hashery.toHash(data, {
				algorithm: "SHA-512",
				maxLength,
			});

			expect(sha256Hash.length).toBe(maxLength);
			expect(sha512Hash.length).toBe(maxLength);

			// Both should be truncated from the start of their respective hashes
			const fullSha256 = await hashery.toHash(data, { algorithm: "SHA-256" });
			const fullSha512 = await hashery.toHash(data, { algorithm: "SHA-512" });

			expect(sha256Hash).toBe(fullSha256.substring(0, maxLength));
			expect(sha512Hash).toBe(fullSha512.substring(0, maxLength));
		});

		test("should maintain consistent truncation for same data", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const maxLength = 20;

			const hash1 = await hashery.toHash(data, {
				algorithm: "SHA-256",
				maxLength,
			});
			const hash2 = await hashery.toHash(data, {
				algorithm: "SHA-256",
				maxLength,
			});

			expect(hash1).toBe(hash2);
			expect(hash1.length).toBe(maxLength);
		});

		test("should work without maxLength option", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const hash = await hashery.toHash(data, { algorithm: "SHA-256" });

			expect(hash).toBeDefined();
			expect(hash.length).toBe(64); // Full SHA-256 length
		});

		test("should truncate hash before after hook is called", async () => {
			const hashery = new Hashery();
			const maxLength = 16;
			let hookHash = "";

			hashery.onHook("after:toHash", async (result) => {
				hookHash = result.hash;
			});

			const hash = await hashery.toHash(
				{ name: "test" },
				{ algorithm: "SHA-256", maxLength },
			);

			// The hook should receive the truncated hash
			expect(hookHash).toBe(hash);
			expect(hookHash.length).toBe(maxLength);
		});
	});

	describe("toNumber method", () => {
		test("should use default range of 0-100 when no options provided", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };

			const num = await hashery.toNumber(data);

			expect(num).toBeDefined();
			expect(typeof num).toBe("number");
			expect(num).toBeGreaterThanOrEqual(0);
			expect(num).toBeLessThanOrEqual(100);
			expect(Number.isInteger(num)).toBe(true);
		});

		test("should use default range of 0-100 when empty options provided", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };

			const num = await hashery.toNumber(data, {});

			expect(num).toBeDefined();
			expect(typeof num).toBe("number");
			expect(num).toBeGreaterThanOrEqual(0);
			expect(num).toBeLessThanOrEqual(100);
			expect(Number.isInteger(num)).toBe(true);
		});

		test("should generate a number within the specified range", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const min = 1;
			const max = 100;

			const num = await hashery.toNumber(data, { min, max });

			expect(num).toBeDefined();
			expect(typeof num).toBe("number");
			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
			expect(Number.isInteger(num)).toBe(true);
		});

		test("should generate consistent numbers for same data", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const min = 1;
			const max = 100;

			const num1 = await hashery.toNumber(data, { min, max });
			const num2 = await hashery.toNumber(data, { min, max });

			expect(num1).toBe(num2);
		});

		test("should generate different numbers for different data", async () => {
			const hashery = new Hashery();
			const data1 = { name: "test1" };
			const data2 = { name: "test2" };
			const min = 1;
			const max = 1000;

			const num1 = await hashery.toNumber(data1, { min, max });
			const num2 = await hashery.toNumber(data2, { min, max });

			// Very unlikely to be the same with a range of 1000
			expect(num1).not.toBe(num2);
		});

		test("should work with min and max being the same", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const value = 42;

			const num = await hashery.toNumber(data, { min: value, max: value });

			expect(num).toBe(value);
		});

		test("should work with range of 0 to 1", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const num = await hashery.toNumber(data, { min: 0, max: 1 });

			expect(num).toBeDefined();
			expect(num === 0 || num === 1).toBe(true);
		});

		test("should throw error when min is greater than max", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			await expect(
				hashery.toNumber(data, { min: 100, max: 1 }),
			).rejects.toThrow("min cannot be greater than max");
		});

		test("should work with negative ranges", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = -100;
			const max = -1;

			const num = await hashery.toNumber(data, { min, max });

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should work with ranges spanning negative and positive", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = -50;
			const max = 50;

			const num = await hashery.toNumber(data, { min, max });

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should support different hash algorithms", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 1;
			const max = 1000;

			const num256 = await hashery.toNumber(data, {
				min,
				max,
				algorithm: "SHA-256",
			});
			const num512 = await hashery.toNumber(data, {
				min,
				max,
				algorithm: "SHA-512",
			});

			// Different algorithms should produce different results
			expect(num256).not.toBe(num512);
			expect(num256).toBeGreaterThanOrEqual(min);
			expect(num256).toBeLessThanOrEqual(max);
			expect(num512).toBeGreaterThanOrEqual(min);
			expect(num512).toBeLessThanOrEqual(max);
		});

		test("should work with large ranges", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 1;
			const max = 1000000;

			const num = await hashery.toNumber(data, { min, max });

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
			expect(Number.isInteger(num)).toBe(true);
		});

		test("should use custom stringify function", async () => {
			const customStringify = (data: unknown) => {
				// Sort keys to ensure consistent hashing
				return JSON.stringify(data, Object.keys(data as object).sort());
			};

			const hashery = new Hashery({ stringify: customStringify });

			// These two objects have the same content but different key order
			const data1 = { b: 2, a: 1 };
			const data2 = { a: 1, b: 2 };
			const min = 1;
			const max = 100;

			const num1 = await hashery.toNumber(data1, { min, max });
			const num2 = await hashery.toNumber(data2, { min, max });

			expect(num1).toBe(num2);
		});

		test("should distribute numbers across the range", async () => {
			const hashery = new Hashery();
			const min = 1;
			const max = 10;
			const numbers: number[] = [];

			// Generate numbers for different inputs
			for (let i = 0; i < 100; i++) {
				const num = await hashery.toNumber({ value: i }, { min, max });
				numbers.push(num);
			}

			// Check that we have some distribution (not all the same number)
			const uniqueNumbers = new Set(numbers);
			expect(uniqueNumbers.size).toBeGreaterThan(1);

			// All numbers should be in range
			for (const num of numbers) {
				expect(num).toBeGreaterThanOrEqual(min);
				expect(num).toBeLessThanOrEqual(max);
			}
		});

		test("should work with zero in range", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 0;
			const max = 10;

			const num = await hashery.toNumber(data, { min, max });

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should handle primitive types", async () => {
			const hashery = new Hashery();
			const min = 1;
			const max = 100;

			const stringNum = await hashery.toNumber("test string", { min, max });
			const numberNum = await hashery.toNumber(42, { min, max });
			const booleanNum = await hashery.toNumber(true, { min, max });

			expect(stringNum).toBeGreaterThanOrEqual(min);
			expect(stringNum).toBeLessThanOrEqual(max);
			expect(numberNum).toBeGreaterThanOrEqual(min);
			expect(numberNum).toBeLessThanOrEqual(max);
			expect(booleanNum).toBeGreaterThanOrEqual(min);
			expect(booleanNum).toBeLessThanOrEqual(max);
		});
	});

	describe("providers property", () => {
		test("should have HashProviders instance by default", () => {
			const hashery = new Hashery();
			expect(hashery.providers).toBeDefined();
			expect(hashery.providers.constructor.name).toBe("HashProviders");
		});

		test("should get the providers instance", () => {
			const hashery = new Hashery();
			const providers = hashery.providers;

			expect(providers).toBeDefined();
			expect(typeof providers.add).toBe("function");
			expect(typeof providers.remove).toBe("function");
			expect(typeof providers.loadProviders).toBe("function");
		});

		test("should return same instance on multiple calls", () => {
			const hashery = new Hashery();
			const providers1 = hashery.providers;
			const providers2 = hashery.providers;

			expect(providers1).toBe(providers2);
		});

		test("should allow adding providers through getter", () => {
			const hashery = new Hashery();

			hashery.providers.add({
				name: "custom-provider",
				toHash: async (_data: BufferSource) => "custom-hash",
			});

			expect(hashery.providers.providers.size).toBe(8);
			expect(hashery.providers.providers.has("custom-provider")).toBe(true);
		});

		test("should set a new HashProviders instance", () => {
			const hashery = new Hashery();
			const originalProviders = hashery.providers;

			const newProviders = new HashProviders();
			newProviders.add({
				name: "new-provider",
				toHash: async (_data: BufferSource) => "new-hash",
			});

			hashery.providers = newProviders;

			expect(hashery.providers).toBe(newProviders);
			expect(hashery.providers).not.toBe(originalProviders);
			expect(hashery.providers.providers.has("new-provider")).toBe(true);
		});

		test("should replace providers when setting new instance", () => {
			const hashery = new Hashery();

			hashery.providers.add({
				name: "original-provider",
				toHash: async (_data: BufferSource) => "original-hash",
			});

			expect(hashery.providers.providers.size).toBe(8);

			const newProviders = new HashProviders();
			newProviders.add({
				name: "replacement-provider",
				toHash: async (_data: BufferSource) => "replacement-hash",
			});

			hashery.providers = newProviders;

			expect(hashery.providers.providers.size).toBe(1);
			expect(hashery.providers.providers.has("original-provider")).toBe(false);
			expect(hashery.providers.providers.has("replacement-provider")).toBe(
				true,
			);
		});

		test("should allow setting empty HashProviders instance", () => {
			const hashery = new Hashery();

			hashery.providers.add({
				name: "test-provider",
				toHash: async (_data: BufferSource) => "test-hash",
			});

			expect(hashery.providers.providers.size).toBe(8);

			const emptyProviders = new HashProviders();
			hashery.providers = emptyProviders;

			expect(hashery.providers.providers.size).toBe(0);
		});

		test("should maintain providers instance after modifications", () => {
			const hashery = new Hashery();

			hashery.providers.add({
				name: "provider1",
				toHash: async (_data: BufferSource) => "hash1",
			});
			hashery.providers.add({
				name: "provider2",
				toHash: async (_data: BufferSource) => "hash2",
			});

			expect(hashery.providers.providers.size).toBe(9);

			hashery.providers.remove("provider1");

			expect(hashery.providers.providers.size).toBe(8);
			expect(hashery.providers.providers.has("provider2")).toBe(true);
		});

		test("should access provider names through providers getter", () => {
			const hashery = new Hashery();

			hashery.providers.add({
				name: "sha256",
				toHash: async (_data: BufferSource) => "hash1",
			});
			hashery.providers.add({
				name: "md5",
				toHash: async (_data: BufferSource) => "hash2",
			});

			const names = hashery.providers.names;

			expect(names.length).toBe(9);
			expect(names).toContain("sha256");
			expect(names).toContain("md5");
		});
	});

	describe("names property", () => {
		test("should return default provider names", () => {
			const hashery = new Hashery();
			const names = hashery.names;

			expect(names).toBeDefined();
			expect(Array.isArray(names)).toBe(true);
			expect(names.length).toBe(7);
			expect(names).toContain("SHA-256");
			expect(names).toContain("SHA-384");
			expect(names).toContain("SHA-512");
			expect(names).toContain("djb2");
			expect(names).toContain("fnv1");
			expect(names).toContain("murmur");
		});

		test("should return empty array when no providers loaded", () => {
			const hashery = new Hashery({ includeBase: false });
			const names = hashery.names;

			expect(names).toBeDefined();
			expect(Array.isArray(names)).toBe(true);
			expect(names.length).toBe(0);
		});

		test("should include custom provider names", () => {
			const hashery = new Hashery();

			hashery.providers.add({
				name: "custom-hash",
				toHash: async (_data: BufferSource) => "custom-output",
			});

			const names = hashery.names;

			expect(names.length).toBe(8);
			expect(names).toContain("SHA-256");
			expect(names).toContain("SHA-384");
			expect(names).toContain("SHA-512");
			expect(names).toContain("crc32");
			expect(names).toContain("djb2");
			expect(names).toContain("fnv1");
			expect(names).toContain("custom-hash");
		});

		test("should reflect changes when providers are added", () => {
			const hashery = new Hashery();

			const namesBefore = hashery.names;
			expect(namesBefore.length).toBe(7);

			hashery.providers.add({
				name: "new-provider",
				toHash: async (_data: BufferSource) => "new-hash",
			});

			const namesAfter = hashery.names;
			expect(namesAfter.length).toBe(8);
			expect(namesAfter).toContain("new-provider");
		});

		test("should reflect changes when providers are removed", () => {
			const hashery = new Hashery();

			hashery.providers.add({
				name: "temp-provider",
				toHash: async (_data: BufferSource) => "temp-hash",
			});

			const namesBefore = hashery.names;
			expect(namesBefore.length).toBe(8);
			expect(namesBefore).toContain("temp-provider");

			hashery.providers.remove("temp-provider");

			const namesAfter = hashery.names;
			expect(namesAfter.length).toBe(7);
			expect(namesAfter).not.toContain("temp-provider");
		});

		test("should return names from custom HashProviders instance", () => {
			const hashery = new Hashery({ includeBase: false });

			const customProviders = new HashProviders();
			customProviders.add({
				name: "provider-1",
				toHash: async (_data: BufferSource) => "hash-1",
			});
			customProviders.add({
				name: "provider-2",
				toHash: async (_data: BufferSource) => "hash-2",
			});

			hashery.providers = customProviders;

			const names = hashery.names;

			expect(names.length).toBe(2);
			expect(names).toContain("provider-1");
			expect(names).toContain("provider-2");
		});
	});

	describe("toHash hooks", () => {
		test("should fire before:toHash hook before hashing", async () => {
			const hashery = new Hashery();
			const hookData: Array<{ data: unknown; algorithm: string }> = [];

			hashery.onHook("before:toHash", async (context) => {
				hookData.push({ ...context });
			});

			const data = { name: "test", value: 42 };
			await hashery.toHash(data, { algorithm: "SHA-256" });

			expect(hookData.length).toBe(1);
			expect(hookData[0].data).toEqual(data);
			expect(hookData[0].algorithm).toBe("SHA-256");
		});

		test("should fire after:toHash hook after hashing", async () => {
			const hashery = new Hashery();
			const hookData: Array<{
				hash: string;
				data: unknown;
				algorithm: string;
			}> = [];

			hashery.onHook("after:toHash", async (result) => {
				hookData.push({ ...result });
			});

			const data = { name: "test", value: 42 };
			const hash = await hashery.toHash(data, { algorithm: "SHA-256" });

			expect(hookData.length).toBe(1);
			expect(hookData[0].hash).toBe(hash);
			expect(hookData[0].data).toEqual(data);
			expect(hookData[0].algorithm).toBe("SHA-256");
		});

		test("should allow before:toHash hook to modify input data", async () => {
			const hashery = new Hashery();

			hashery.onHook("before:toHash", async (context) => {
				// Modify the data before hashing
				context.data = { modified: true, original: context.data };
			});

			const data = { name: "test" };
			const hash1 = await hashery.toHash(data, { algorithm: "SHA-256" });

			// Hash without the hook should be different
			const hashery2 = new Hashery();
			const hash2 = await hashery2.toHash(data, { algorithm: "SHA-256" });

			expect(hash1).not.toBe(hash2);
		});

		test("should allow before:toHash hook to modify algorithm", async () => {
			const hashery = new Hashery();

			hashery.onHook("before:toHash", async (context) => {
				// Force SHA-512 instead of SHA-256
				context.algorithm = "SHA-512";
			});

			const data = { name: "test" };
			const hash = await hashery.toHash(data, { algorithm: "SHA-256" });

			// SHA-512 produces 128 hex characters, SHA-256 produces 64
			expect(hash.length).toBe(128);
		});

		test("should allow after:toHash hook to modify result", async () => {
			const hashery = new Hashery();

			hashery.onHook("after:toHash", async (result) => {
				// Convert hash to uppercase
				result.hash = result.hash.toUpperCase();
			});

			const data = { name: "test" };
			const hash = await hashery.toHash(data, { algorithm: "SHA-256" });

			// Check that the hash is uppercase
			expect(hash).toBe(hash.toUpperCase());
			expect(hash).not.toBe(hash.toLowerCase());
		});

		test("should execute multiple before hooks in order", async () => {
			const hashery = new Hashery();
			const executionOrder: string[] = [];

			hashery.onHook("before:toHash", async (_context) => {
				executionOrder.push("hook1");
			});

			hashery.onHook("before:toHash", async (_context) => {
				executionOrder.push("hook2");
			});

			hashery.onHook("before:toHash", async (_context) => {
				executionOrder.push("hook3");
			});

			await hashery.toHash({ name: "test" }, { algorithm: "SHA-256" });

			expect(executionOrder).toEqual(["hook1", "hook2", "hook3"]);
		});

		test("should execute multiple after hooks in order", async () => {
			const hashery = new Hashery();
			const executionOrder: string[] = [];

			hashery.onHook("after:toHash", async (_result) => {
				executionOrder.push("hook1");
			});

			hashery.onHook("after:toHash", async (_result) => {
				executionOrder.push("hook2");
			});

			hashery.onHook("after:toHash", async (_result) => {
				executionOrder.push("hook3");
			});

			await hashery.toHash({ name: "test" }, { algorithm: "SHA-256" });

			expect(executionOrder).toEqual(["hook1", "hook2", "hook3"]);
		});

		test("should execute hooks in correct lifecycle order", async () => {
			const hashery = new Hashery();
			const executionOrder: string[] = [];

			hashery.onHook("before:toHash", async (_context) => {
				executionOrder.push("before1");
			});

			hashery.onHook("before:toHash", async (_context) => {
				executionOrder.push("before2");
			});

			hashery.onHook("after:toHash", async (_result) => {
				executionOrder.push("after1");
			});

			hashery.onHook("after:toHash", async (_result) => {
				executionOrder.push("after2");
			});

			await hashery.toHash({ name: "test" }, { algorithm: "SHA-256" });

			expect(executionOrder).toEqual([
				"before1",
				"before2",
				"after1",
				"after2",
			]);
		});

		test("should pass modified context through multiple before hooks", async () => {
			const hashery = new Hashery();

			hashery.onHook("before:toHash", async (context) => {
				context.data = { step: 1, original: context.data };
			});

			hashery.onHook("before:toHash", async (context) => {
				context.data = { step: 2, previous: context.data };
			});

			hashery.onHook("after:toHash", async (result) => {
				// Verify the data was modified through both hooks
				expect(result.data).toEqual({
					step: 2,
					previous: { step: 1, original: { name: "test" } },
				});
			});

			await hashery.toHash({ name: "test" }, { algorithm: "SHA-256" });
		});

		test("should work with default algorithm", async () => {
			const hashery = new Hashery();
			const hookData: Array<{ algorithm: string }> = [];

			hashery.onHook("before:toHash", async (context) => {
				hookData.push({ algorithm: context.algorithm });
			});

			await hashery.toHash({ name: "test" });

			expect(hookData.length).toBe(1);
			expect(hookData[0].algorithm).toBe("SHA-256");
		});

		test("should handle errors in hooks when throwOnEmitError is true", async () => {
			const hashery = new Hashery({ throwOnEmitError: true });

			hashery.onHook("before:toHash", async (_context) => {
				throw new Error("Hook error");
			});

			await expect(hashery.toHash({ name: "test" })).rejects.toThrow(
				"Hook error",
			);
		});

		test("should not throw errors in hooks when throwOnEmitError is false", async () => {
			const hashery = new Hashery({ throwOnEmitError: false });

			hashery.onHook("before:toHash", async (_context) => {
				throw new Error("Hook error");
			});

			// Should not throw, should continue and return hash
			const hash = await hashery.toHash({ name: "test" });
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should allow logging in hooks", async () => {
			const hashery = new Hashery();
			const logs: string[] = [];

			hashery.onHook("before:toHash", async (context) => {
				logs.push(
					`Hashing data: ${JSON.stringify(context.data)} with ${context.algorithm}`,
				);
			});

			hashery.onHook("after:toHash", async (result) => {
				logs.push(`Hash result: ${result.hash.substring(0, 8)}...`);
			});

			await hashery.toHash({ name: "test" }, { algorithm: "SHA-256" });

			expect(logs.length).toBe(2);
			expect(logs[0]).toContain("Hashing data:");
			expect(logs[0]).toContain("SHA-256");
			expect(logs[1]).toContain("Hash result:");
		});

		test("should support caching pattern with hooks", async () => {
			const hashery = new Hashery();
			const cache = new Map<string, string>();

			hashery.onHook("after:toHash", async (result) => {
				const cacheKey = `${result.algorithm}:${JSON.stringify(result.data)}`;
				// Store the hash in cache
				cache.set(cacheKey, result.hash);
			});

			const data = { name: "test" };
			const hash1 = await hashery.toHash(data, { algorithm: "SHA-256" });
			const hash2 = await hashery.toHash(data, { algorithm: "SHA-256" });
			const hash3 = await hashery.toHash(data, { algorithm: "SHA-256" });

			// All hashes should be the same
			expect(hash1).toBe(hash2);
			expect(hash2).toBe(hash3);

			// Verify all were cached
			const cacheKey = `SHA-256:${JSON.stringify(data)}`;
			expect(cache.has(cacheKey)).toBe(true);
			expect(cache.get(cacheKey)).toBe(hash1);
		});

		test("should work with all supported algorithms", async () => {
			const hashery = new Hashery();
			const algorithms = ["SHA-256", "SHA-384", "SHA-512"];
			const results: Array<{ algorithm: string; hashLength: number }> = [];

			hashery.onHook("after:toHash", async (result) => {
				results.push({
					algorithm: result.algorithm,
					hashLength: result.hash.length,
				});
			});

			for (const algorithm of algorithms) {
				await hashery.toHash({ name: "test" }, { algorithm });
			}

			expect(results.length).toBe(3);
			expect(results[0]).toEqual({ algorithm: "SHA-256", hashLength: 64 });
			expect(results[1]).toEqual({ algorithm: "SHA-384", hashLength: 96 });
			expect(results[2]).toEqual({ algorithm: "SHA-512", hashLength: 128 });
		});

		test("should run after:toHash hook on cache hits", async () => {
			const hashery = new Hashery({ cache: { enabled: true } });

			hashery.onHook("after:toHash", async (result: { hash: string }) => {
				result.hash = "modified-hash";
			});

			const data = { name: "test" };
			const hash1 = await hashery.toHash(data);
			const hash2 = await hashery.toHash(data); // cache hit

			expect(hash1).toBe("modified-hash");
			expect(hash2).toBe("modified-hash");
		});

		test("should allow removing hooks", async () => {
			const hashery = new Hashery();
			const hookCalls: string[] = [];

			const hookFn = async (_context: unknown) => {
				hookCalls.push("called");
			};

			hashery.onHook("before:toHash", hookFn);
			await hashery.toHash({ name: "test1" });

			expect(hookCalls.length).toBe(1);

			// Remove the hook
			hashery.removeHook("before:toHash", hookFn);
			await hashery.toHash({ name: "test2" });

			// Should still be 1, not 2
			expect(hookCalls.length).toBe(1);
		});
	});

	describe("cache property", () => {
		test("should have cache property", () => {
			const hashery = new Hashery();
			expect(hashery.cache).toBeDefined();
		});

		test("should have cache enabled by default", () => {
			const hashery = new Hashery();
			expect(hashery.cache.enabled).toBe(true);
		});

		test("should disable cache via constructor", () => {
			const hashery = new Hashery({ cache: { enabled: false } });
			expect(hashery.cache.enabled).toBe(false);
		});

		test("should set maxSize via constructor", () => {
			const hashery = new Hashery({ cache: { maxSize: 500 } });
			expect(hashery.cache.maxSize).toBe(500);
		});

		test("should toggle cache enabled at runtime", () => {
			const hashery = new Hashery();
			expect(hashery.cache.enabled).toBe(true);

			hashery.cache.enabled = false;
			expect(hashery.cache.enabled).toBe(false);

			hashery.cache.enabled = true;
			expect(hashery.cache.enabled).toBe(true);
		});

		test("should access cache store", () => {
			const hashery = new Hashery();
			expect(hashery.cache.store).toBeInstanceOf(Map);
		});

		test("should clear cache", async () => {
			const hashery = new Hashery();
			await hashery.toHash({ name: "test" });
			expect(hashery.cache.size).toBe(1);

			hashery.cache.clear();
			expect(hashery.cache.size).toBe(0);
		});
	});

	describe("cache with toHash", () => {
		test("should not cache when disabled", async () => {
			const hashery = new Hashery({ cache: { enabled: false } });
			await hashery.toHash({ name: "test" });
			expect(hashery.cache.size).toBe(0);
		});

		test("should cache by default", async () => {
			const hashery = new Hashery();
			await hashery.toHash({ name: "test" });
			expect(hashery.cache.size).toBe(1);
		});

		test("should return cached value on repeat call", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };

			const hash1 = await hashery.toHash(data);
			const hash2 = await hashery.toHash(data);

			expect(hash1).toBe(hash2);
			expect(hashery.cache.size).toBe(1);
		});

		test("should cache different data separately", async () => {
			const hashery = new Hashery();

			await hashery.toHash({ name: "test1" });
			await hashery.toHash({ name: "test2" });

			expect(hashery.cache.size).toBe(2);
		});

		test("should cache same data with different algorithms separately", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const sha256Hash = await hashery.toHash(data, { algorithm: "SHA-256" });
			const sha512Hash = await hashery.toHash(data, { algorithm: "SHA-512" });

			expect(hashery.cache.size).toBe(2);
			expect(sha256Hash).not.toBe(sha512Hash);
		});

		test("should apply maxLength to cached value", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			// First call caches full hash
			const fullHash = await hashery.toHash(data);
			expect(fullHash.length).toBe(64);

			// Second call with maxLength should return truncated cached value
			const truncatedHash = await hashery.toHash(data, { maxLength: 16 });
			expect(truncatedHash.length).toBe(16);
			expect(truncatedHash).toBe(fullHash.substring(0, 16));

			// Only one entry in cache (the full hash)
			expect(hashery.cache.size).toBe(1);
		});

		test("should respect maxSize limit", async () => {
			const hashery = new Hashery({ cache: { maxSize: 3 } });

			await hashery.toHash({ id: 1 });
			await hashery.toHash({ id: 2 });
			await hashery.toHash({ id: 3 });
			expect(hashery.cache.size).toBe(3);

			await hashery.toHash({ id: 4 });
			expect(hashery.cache.size).toBe(3);

			// First item should be evicted (FIFO)
			const key1 = `SHA-256:${JSON.stringify({ id: 1 })}`;
			expect(hashery.cache.has(key1)).toBe(false);
		});

		test("should use custom stringify function for cache key", async () => {
			const customStringify = (data: unknown) => {
				return JSON.stringify(data, Object.keys(data as object).sort());
			};

			const hashery = new Hashery({
				stringify: customStringify,
			});

			// These objects have same content but different key order
			const data1 = { b: 2, a: 1 };
			const data2 = { a: 1, b: 2 };

			const hash1 = await hashery.toHash(data1);
			const hash2 = await hashery.toHash(data2);

			// Should be same hash and only one cache entry
			expect(hash1).toBe(hash2);
			expect(hashery.cache.size).toBe(1);
		});
	});

	describe("cache with toHashSync", () => {
		test("should not cache when disabled", () => {
			const hashery = new Hashery({ cache: { enabled: false } });
			hashery.toHashSync({ name: "test" });
			expect(hashery.cache.size).toBe(0);
		});

		test("should cache by default", () => {
			const hashery = new Hashery();
			hashery.toHashSync({ name: "test" });
			expect(hashery.cache.size).toBe(1);
		});

		test("should return cached value on repeat call", () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };

			const hash1 = hashery.toHashSync(data);
			const hash2 = hashery.toHashSync(data);

			expect(hash1).toBe(hash2);
			expect(hashery.cache.size).toBe(1);
		});

		test("should cache same data with different algorithms separately", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const djb2Hash = hashery.toHashSync(data, { algorithm: "djb2" });
			const fnv1Hash = hashery.toHashSync(data, { algorithm: "fnv1" });

			expect(hashery.cache.size).toBe(2);
			expect(djb2Hash).not.toBe(fnv1Hash);
		});

		test("should apply maxLength to cached value", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			// First call caches full hash
			const fullHash = hashery.toHashSync(data);

			// Second call with maxLength should return truncated cached value
			const truncatedHash = hashery.toHashSync(data, { maxLength: 4 });
			expect(truncatedHash.length).toBe(4);
			expect(truncatedHash).toBe(fullHash.substring(0, 4));

			// Only one entry in cache
			expect(hashery.cache.size).toBe(1);
		});

		test("should share cache between toHash and toHashSync", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			// Use async toHash first
			const asyncHash = await hashery.toHash(data, { algorithm: "djb2" });
			expect(hashery.cache.size).toBe(1);

			// Use sync toHashSync with same data and algorithm
			const syncHash = hashery.toHashSync(data, { algorithm: "djb2" });

			// Should return cached value, same hash
			expect(syncHash).toBe(asyncHash);
			expect(hashery.cache.size).toBe(1);
		});
	});
});
