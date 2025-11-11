import { describe, expect, test } from "vitest";
import { Hashery, type HasheryOptions } from "../src/index.js";

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
		expect(hashery.throwOnEmitError).toBe(false);
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

		test("should support SHA-1 algorithm", async () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const hash = await hashery.toHash(data, "SHA-1");

			expect(hash).toBeDefined();
			expect(hash.length).toBe(40); // SHA-1 produces 40 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
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
	});
});
