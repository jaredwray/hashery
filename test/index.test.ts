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

		// Should have base providers (3) + custom providers (2) = 5 total
		expect(hashery.providers.providers.size).toBe(5);
		expect(hashery.providers.providers.has("custom-provider-1")).toBe(true);
		expect(hashery.providers.providers.has("custom-provider-2")).toBe(true);
		expect(hashery.providers.providers.has("SHA-256")).toBe(true);
		expect(hashery.providers.providers.has("SHA-384")).toBe(true);
		expect(hashery.providers.providers.has("SHA-512")).toBe(true);
	});

	test("should include base providers by default", () => {
		const hashery = new Hashery();

		// Should have 3 base providers by default
		expect(hashery.providers.providers.size).toBe(3);
		expect(hashery.providers.providers.has("SHA-256")).toBe(true);
		expect(hashery.providers.providers.has("SHA-384")).toBe(true);
		expect(hashery.providers.providers.has("SHA-512")).toBe(true);
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

		// Should have base providers (3) + custom provider (1) = 4 total
		expect(hashery.providers.providers.size).toBe(4);
		expect(hashery.providers.providers.has("custom-with-base")).toBe(true);
		expect(hashery.providers.providers.has("SHA-256")).toBe(true);
		expect(hashery.providers.providers.has("SHA-384")).toBe(true);
		expect(hashery.providers.providers.has("SHA-512")).toBe(true);
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
			const hash = await hashery.toHash(data, "SHA-384");

			expect(hash).toBeDefined();
			expect(hash.length).toBe(96); // SHA-384 produces 96 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should support SHA-512 algorithm", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const hash = await hashery.toHash(data, "SHA-512");

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

			const sha256Hash = await hashery.toHash(data, "SHA-256");
			const sha512Hash = await hashery.toHash(data, "SHA-512");

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

		test("should fallback to WebCrypto SHA-256 when provider not found", async () => {
			// Create a Hashery instance with no base providers
			const hashery = new Hashery({ includeBase: false });

			// Verify no providers are loaded
			expect(hashery.providers.providers.size).toBe(0);

			// Call toHash with an algorithm that doesn't exist
			const data = { name: "test", value: 42 };
			const hash = await hashery.toHash(data, "SHA-256");

			// Should still get a valid SHA-256 hash from the fallback
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true); // Should be valid hex

			// Verify the hash is consistent
			const hash2 = await hashery.toHash(data, "SHA-256");
			expect(hash).toBe(hash2);
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
			const hash = await hashery.toHash(data, "SHA-256");

			// Should fallback to WebCrypto SHA-256
			expect(hash).toBeDefined();
			expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);

			// Should NOT be the custom provider's output
			expect(hash).not.toBe("custom-hash-output");
		});
	});

	describe("toNumber method", () => {
		test("should generate a number within the specified range", async () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const min = 1;
			const max = 100;

			const num = await hashery.toNumber(data, min, max);

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

			const num1 = await hashery.toNumber(data, min, max);
			const num2 = await hashery.toNumber(data, min, max);

			expect(num1).toBe(num2);
		});

		test("should generate different numbers for different data", async () => {
			const hashery = new Hashery();
			const data1 = { name: "test1" };
			const data2 = { name: "test2" };
			const min = 1;
			const max = 1000;

			const num1 = await hashery.toNumber(data1, min, max);
			const num2 = await hashery.toNumber(data2, min, max);

			// Very unlikely to be the same with a range of 1000
			expect(num1).not.toBe(num2);
		});

		test("should work with min and max being the same", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const value = 42;

			const num = await hashery.toNumber(data, value, value);

			expect(num).toBe(value);
		});

		test("should work with range of 0 to 1", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const num = await hashery.toNumber(data, 0, 1);

			expect(num).toBeDefined();
			expect(num === 0 || num === 1).toBe(true);
		});

		test("should throw error when min is greater than max", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			await expect(hashery.toNumber(data, 100, 1)).rejects.toThrow(
				"min cannot be greater than max",
			);
		});

		test("should work with negative ranges", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = -100;
			const max = -1;

			const num = await hashery.toNumber(data, min, max);

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should work with ranges spanning negative and positive", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = -50;
			const max = 50;

			const num = await hashery.toNumber(data, min, max);

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should support different hash algorithms", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 1;
			const max = 1000;

			const num256 = await hashery.toNumber(data, min, max, "SHA-256");
			const num512 = await hashery.toNumber(data, min, max, "SHA-512");

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

			const num = await hashery.toNumber(data, min, max);

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

			const num1 = await hashery.toNumber(data1, min, max);
			const num2 = await hashery.toNumber(data2, min, max);

			expect(num1).toBe(num2);
		});

		test("should distribute numbers across the range", async () => {
			const hashery = new Hashery();
			const min = 1;
			const max = 10;
			const numbers: number[] = [];

			// Generate numbers for different inputs
			for (let i = 0; i < 100; i++) {
				const num = await hashery.toNumber({ value: i }, min, max);
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

			const num = await hashery.toNumber(data, min, max);

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should handle primitive types", async () => {
			const hashery = new Hashery();
			const min = 1;
			const max = 100;

			const stringNum = await hashery.toNumber("test string", min, max);
			const numberNum = await hashery.toNumber(42, min, max);
			const booleanNum = await hashery.toNumber(true, min, max);

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

			expect(hashery.providers.providers.size).toBe(4);
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

			expect(hashery.providers.providers.size).toBe(4);

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

			expect(hashery.providers.providers.size).toBe(4);

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

			expect(hashery.providers.providers.size).toBe(5);

			hashery.providers.remove("provider1");

			expect(hashery.providers.providers.size).toBe(4);
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

			expect(names.length).toBe(5);
			expect(names).toContain("sha256");
			expect(names).toContain("md5");
		});
	});
});
