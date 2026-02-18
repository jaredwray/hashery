import { describe, expect, test } from "vitest";
import { Hashery } from "../src/index.js";

describe("Hashery Sync Methods", () => {
	describe("toHashSync method", () => {
		test("should generate djb2 hash by default", () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const hash = hashery.toHashSync(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(8); // djb2 produces 8 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true); // Should be valid hex
		});

		test("should generate consistent hashes for same data", () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };

			const hash1 = hashery.toHashSync(data);
			const hash2 = hashery.toHashSync(data);

			expect(hash1).toBe(hash2);
		});

		test("should generate different hashes for different data", () => {
			const hashery = new Hashery();
			const data1 = { name: "test", value: 42 };
			const data2 = { name: "test", value: 43 };

			const hash1 = hashery.toHashSync(data1);
			const hash2 = hashery.toHashSync(data2);

			expect(hash1).not.toBe(hash2);
		});

		test("should support fnv1 algorithm", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const hash = hashery.toHashSync(data, { algorithm: "fnv1" });

			expect(hash).toBeDefined();
			expect(hash.length).toBe(8); // fnv1 produces 8 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should support murmer algorithm", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const hash = hashery.toHashSync(data, { algorithm: "murmer" });

			expect(hash).toBeDefined();
			expect(hash.length).toBe(8); // murmer produces 8 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should support crc32 algorithm", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const hash = hashery.toHashSync(data, { algorithm: "crc32" });

			expect(hash).toBeDefined();
			expect(hash.length).toBe(8); // crc32 produces 8 hex characters
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should use custom stringify function when hashing", () => {
			const customStringify = (data: unknown) => {
				// Sort keys to ensure consistent hashing
				return JSON.stringify(data, Object.keys(data as object).sort());
			};

			const hashery = new Hashery({ stringify: customStringify });

			// These two objects have the same content but different key order
			const data1 = { b: 2, a: 1 };
			const data2 = { a: 1, b: 2 };

			const hash1 = hashery.toHashSync(data1);
			const hash2 = hashery.toHashSync(data2);

			expect(hash1).toBe(hash2);
		});

		test("should handle primitive types", () => {
			const hashery = new Hashery();

			const stringHash = hashery.toHashSync("test string");
			const numberHash = hashery.toHashSync(42);
			const booleanHash = hashery.toHashSync(true);
			const nullHash = hashery.toHashSync(null);

			expect(stringHash).toBeDefined();
			expect(numberHash).toBeDefined();
			expect(booleanHash).toBeDefined();
			expect(nullHash).toBeDefined();

			// Each should be different
			const hashes = [stringHash, numberHash, booleanHash, nullHash];
			const uniqueHashes = new Set(hashes);
			expect(uniqueHashes.size).toBe(4);
		});

		test("should handle arrays", () => {
			const hashery = new Hashery();
			const data = [1, 2, 3, { name: "test" }];

			const hash = hashery.toHashSync(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(8);
		});

		test("should handle nested objects", () => {
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

			const hash = hashery.toHashSync(data);

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(8);
		});

		test("should generate different hashes for different algorithms", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const djb2Hash = hashery.toHashSync(data, { algorithm: "djb2" });
			const fnv1Hash = hashery.toHashSync(data, { algorithm: "fnv1" });
			const murmerHash = hashery.toHashSync(data, { algorithm: "murmer" });
			const crc32Hash = hashery.toHashSync(data, { algorithm: "crc32" });

			// All should be different
			expect(djb2Hash).not.toBe(fnv1Hash);
			expect(djb2Hash).not.toBe(murmerHash);
			expect(djb2Hash).not.toBe(crc32Hash);
			expect(fnv1Hash).not.toBe(murmerHash);
			expect(fnv1Hash).not.toBe(crc32Hash);
			expect(murmerHash).not.toBe(crc32Hash);
		});

		test("should handle empty objects and arrays", () => {
			const hashery = new Hashery();

			const emptyObjectHash = hashery.toHashSync({});
			const emptyArrayHash = hashery.toHashSync([]);

			expect(emptyObjectHash).toBeDefined();
			expect(emptyArrayHash).toBeDefined();
			expect(emptyObjectHash).not.toBe(emptyArrayHash);
		});

		test("should fallback to default sync algorithm and emit warning when provider not found", () => {
			const hashery = new Hashery();
			const warnings: string[] = [];

			hashery.on("warn", (message: string) => {
				warnings.push(message);
			});

			const data = { name: "test" };
			const hash = hashery.toHashSync(data, { algorithm: "invalid-algo" });

			// Should still produce a hash (using fallback djb2)
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");

			// Should have emitted exactly one warning
			expect(warnings.length).toBe(1);
			expect(warnings[0]).toContain("invalid-algo");
			expect(warnings[0]).toContain("djb2");
			expect(warnings[0]).toContain("Invalid algorithm");
		});

		test("should throw error when provider does not support sync", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			expect(() => {
				hashery.toHashSync(data, { algorithm: "SHA-256" });
			}).toThrow(
				"Hash provider 'SHA-256' does not support synchronous hashing",
			);
		});

		test("should throw error when default sync algorithm is not found", () => {
			const hashery = new Hashery({ includeBase: false });
			const data = { name: "test" };

			expect(() => {
				hashery.toHashSync(data, { algorithm: "invalid-algo" });
			}).toThrow("Hash provider 'djb2' (default) not found");
		});

		test("should still throw error if fallback algorithm doesn't support sync", () => {
			const hashery = new Hashery();
			// Set default sync algorithm to an async-only algorithm
			hashery.defaultAlgorithmSync = "SHA-256";

			const data = { name: "test" };

			expect(() => {
				hashery.toHashSync(data, { algorithm: "invalid-algo" });
			}).toThrow(
				"Hash provider 'invalid-algo' does not support synchronous hashing",
			);
		});

		test("should truncate hash when maxLength is specified", () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const maxLength = 4;

			const hash = hashery.toHashSync(data, {
				algorithm: "djb2",
				maxLength,
			});

			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(maxLength);
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true); // Should still be valid hex
		});

		test("should not truncate hash when maxLength is greater than hash length", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const maxLength = 100; // djb2 produces 8 characters

			const hash = hashery.toHashSync(data, {
				algorithm: "djb2",
				maxLength,
			});

			expect(hash).toBeDefined();
			expect(hash.length).toBe(8); // Should be full djb2 length
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should not truncate hash when maxLength equals hash length", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const maxLength = 8; // Exactly djb2 length

			const hash = hashery.toHashSync(data, {
				algorithm: "djb2",
				maxLength,
			});

			expect(hash).toBeDefined();
			expect(hash.length).toBe(8);
			expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
		});

		test("should handle maxLength of 1", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const hash = hashery.toHashSync(data, {
				algorithm: "djb2",
				maxLength: 1,
			});

			expect(hash).toBeDefined();
			expect(hash.length).toBe(1);
			expect(/^[a-f0-9]$/.test(hash)).toBe(true);
		});

		test("should work with maxLength on different algorithms", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const maxLength = 4;

			const djb2Hash = hashery.toHashSync(data, {
				algorithm: "djb2",
				maxLength,
			});
			const fnv1Hash = hashery.toHashSync(data, {
				algorithm: "fnv1",
				maxLength,
			});

			expect(djb2Hash.length).toBe(maxLength);
			expect(fnv1Hash.length).toBe(maxLength);

			// Both should be truncated from the start of their respective hashes
			const fullDjb2 = hashery.toHashSync(data, { algorithm: "djb2" });
			const fullFnv1 = hashery.toHashSync(data, { algorithm: "fnv1" });

			expect(djb2Hash).toBe(fullDjb2.substring(0, maxLength));
			expect(fnv1Hash).toBe(fullFnv1.substring(0, maxLength));
		});

		test("should maintain consistent truncation for same data", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const maxLength = 6;

			const hash1 = hashery.toHashSync(data, {
				algorithm: "djb2",
				maxLength,
			});
			const hash2 = hashery.toHashSync(data, {
				algorithm: "djb2",
				maxLength,
			});

			expect(hash1).toBe(hash2);
			expect(hash1.length).toBe(maxLength);
		});

		test("should work without maxLength option", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const hash = hashery.toHashSync(data, { algorithm: "djb2" });

			expect(hash).toBeDefined();
			expect(hash.length).toBe(8); // Full djb2 length
		});

		test("should use defaultAlgorithmSync when no algorithm specified", () => {
			const hashery = new Hashery({ defaultAlgorithmSync: "fnv1" });
			const data = { name: "test" };

			const hash = hashery.toHashSync(data);

			// Verify it's using fnv1 by comparing with explicit fnv1 call
			const fnv1Hash = hashery.toHashSync(data, { algorithm: "fnv1" });
			expect(hash).toBe(fnv1Hash);
		});

		test("should override defaultAlgorithmSync when algorithm option is provided", () => {
			const hashery = new Hashery({ defaultAlgorithmSync: "fnv1" });
			const data = { name: "test" };

			// Explicitly use djb2
			const hash = hashery.toHashSync(data, { algorithm: "djb2" });

			// Should use djb2, not fnv1
			const djb2Hash = hashery.toHashSync(data, { algorithm: "djb2" });
			expect(hash).toBe(djb2Hash);

			// Should NOT be fnv1
			const fnv1Hash = hashery.toHashSync(data, { algorithm: "fnv1" });
			expect(hash).not.toBe(fnv1Hash);
		});

		test("should work with runtime changed defaultAlgorithmSync", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			// First hash with djb2 (default)
			const hashDjb2 = hashery.toHashSync(data);

			// Change default to fnv1
			hashery.defaultAlgorithmSync = "fnv1";
			const hashFnv1 = hashery.toHashSync(data);

			// Hashes should be different
			expect(hashDjb2).not.toBe(hashFnv1);

			// Verify fnv1 is now being used
			const explicitFnv1 = hashery.toHashSync(data, { algorithm: "fnv1" });
			expect(hashFnv1).toBe(explicitFnv1);
		});

		test("should throw descriptive error for async-only algorithms", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			expect(() => {
				hashery.toHashSync(data, { algorithm: "SHA-384" });
			}).toThrow("does not support synchronous hashing");

			expect(() => {
				hashery.toHashSync(data, { algorithm: "SHA-512" });
			}).toThrow("does not support synchronous hashing");
		});
	});

	describe("toNumberSync method", () => {
		test("should use default range of 0-100 when no options provided", () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };

			const num = hashery.toNumberSync(data);

			expect(num).toBeDefined();
			expect(typeof num).toBe("number");
			expect(num).toBeGreaterThanOrEqual(0);
			expect(num).toBeLessThanOrEqual(100);
			expect(Number.isInteger(num)).toBe(true);
		});

		test("should use default range of 0-100 when empty options provided", () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };

			const num = hashery.toNumberSync(data, {});

			expect(num).toBeDefined();
			expect(typeof num).toBe("number");
			expect(num).toBeGreaterThanOrEqual(0);
			expect(num).toBeLessThanOrEqual(100);
			expect(Number.isInteger(num)).toBe(true);
		});

		test("should generate a number within the specified range", () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const min = 1;
			const max = 100;

			const num = hashery.toNumberSync(data, { min, max });

			expect(num).toBeDefined();
			expect(typeof num).toBe("number");
			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
			expect(Number.isInteger(num)).toBe(true);
		});

		test("should generate consistent numbers for same data", () => {
			const hashery = new Hashery();
			const data = { name: "test", value: 42 };
			const min = 1;
			const max = 100;

			const num1 = hashery.toNumberSync(data, { min, max });
			const num2 = hashery.toNumberSync(data, { min, max });

			expect(num1).toBe(num2);
		});

		test("should generate different numbers for different data", () => {
			const hashery = new Hashery();
			const data1 = { name: "test1" };
			const data2 = { name: "test2" };
			const min = 1;
			const max = 1000;

			const num1 = hashery.toNumberSync(data1, { min, max });
			const num2 = hashery.toNumberSync(data2, { min, max });

			// Very unlikely to be the same with a range of 1000
			expect(num1).not.toBe(num2);
		});

		test("should work with min and max being the same", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const value = 42;

			const num = hashery.toNumberSync(data, { min: value, max: value });

			expect(num).toBe(value);
		});

		test("should work with range of 0 to 1", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			const num = hashery.toNumberSync(data, { min: 0, max: 1 });

			expect(num).toBeDefined();
			expect(num === 0 || num === 1).toBe(true);
		});

		test("should throw error when min is greater than max", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			expect(() => {
				hashery.toNumberSync(data, { min: 100, max: 1 });
			}).toThrow("min cannot be greater than max");
		});

		test("should work with negative ranges", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = -100;
			const max = -1;

			const num = hashery.toNumberSync(data, { min, max });

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should work with ranges spanning negative and positive", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = -50;
			const max = 50;

			const num = hashery.toNumberSync(data, { min, max });

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should support different hash algorithms", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 1;
			const max = 1000;

			const numDjb2 = hashery.toNumberSync(data, {
				min,
				max,
				algorithm: "djb2",
			});
			const numFnv1 = hashery.toNumberSync(data, {
				min,
				max,
				algorithm: "fnv1",
			});
			const numMurmer = hashery.toNumberSync(data, {
				min,
				max,
				algorithm: "murmer",
			});
			const numCrc32 = hashery.toNumberSync(data, {
				min,
				max,
				algorithm: "crc32",
			});

			// Different algorithms should produce different results
			expect(numDjb2).not.toBe(numFnv1);
			expect(numDjb2).not.toBe(numMurmer);
			expect(numDjb2).not.toBe(numCrc32);

			// All should be in range
			for (const num of [numDjb2, numFnv1, numMurmer, numCrc32]) {
				expect(num).toBeGreaterThanOrEqual(min);
				expect(num).toBeLessThanOrEqual(max);
			}
		});

		test("should work with large ranges", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 1;
			const max = 1000000;

			const num = hashery.toNumberSync(data, { min, max });

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
			expect(Number.isInteger(num)).toBe(true);
		});

		test("should use custom stringify function", () => {
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

			const num1 = hashery.toNumberSync(data1, { min, max });
			const num2 = hashery.toNumberSync(data2, { min, max });

			expect(num1).toBe(num2);
		});

		test("should distribute numbers across the range", () => {
			const hashery = new Hashery();
			const min = 1;
			const max = 10;
			const numbers: number[] = [];

			// Generate numbers for different inputs
			for (let i = 0; i < 100; i++) {
				const num = hashery.toNumberSync({ value: i }, { min, max });
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

		test("should work with zero in range", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 0;
			const max = 10;

			const num = hashery.toNumberSync(data, { min, max });

			expect(num).toBeGreaterThanOrEqual(min);
			expect(num).toBeLessThanOrEqual(max);
		});

		test("should handle primitive types", () => {
			const hashery = new Hashery();
			const min = 1;
			const max = 100;

			const stringNum = hashery.toNumberSync("test string", { min, max });
			const numberNum = hashery.toNumberSync(42, { min, max });
			const booleanNum = hashery.toNumberSync(true, { min, max });

			expect(stringNum).toBeGreaterThanOrEqual(min);
			expect(stringNum).toBeLessThanOrEqual(max);
			expect(numberNum).toBeGreaterThanOrEqual(min);
			expect(numberNum).toBeLessThanOrEqual(max);
			expect(booleanNum).toBeGreaterThanOrEqual(min);
			expect(booleanNum).toBeLessThanOrEqual(max);
		});

		test("should use defaultAlgorithmSync when no algorithm specified", () => {
			const hashery = new Hashery({ defaultAlgorithmSync: "fnv1" });
			const data = { name: "test" };
			const min = 0;
			const max = 100;

			const num = hashery.toNumberSync(data, { min, max });

			// Verify it's using fnv1 by comparing with explicit fnv1 call
			const fnv1Num = hashery.toNumberSync(data, {
				min,
				max,
				algorithm: "fnv1",
			});
			expect(num).toBe(fnv1Num);
		});

		test("should override defaultAlgorithmSync when algorithm option is provided", () => {
			const hashery = new Hashery({ defaultAlgorithmSync: "fnv1" });
			const data = { name: "test" };
			const min = 0;
			const max = 1000;

			// Explicitly use djb2
			const num = hashery.toNumberSync(data, { min, max, algorithm: "djb2" });

			// Should use djb2, not fnv1
			const djb2Num = hashery.toNumberSync(data, {
				min,
				max,
				algorithm: "djb2",
			});
			expect(num).toBe(djb2Num);

			// Should NOT be fnv1
			const fnv1Num = hashery.toNumberSync(data, {
				min,
				max,
				algorithm: "fnv1",
			});
			expect(num).not.toBe(fnv1Num);
		});

		test("should work with runtime changed defaultAlgorithmSync", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 0;
			const max = 1000;

			// First number with djb2 (default)
			const numDjb2 = hashery.toNumberSync(data, { min, max });

			// Change default to fnv1
			hashery.defaultAlgorithmSync = "fnv1";
			const numFnv1 = hashery.toNumberSync(data, { min, max });

			// Numbers should be different
			expect(numDjb2).not.toBe(numFnv1);

			// Verify fnv1 is now being used
			const explicitFnv1 = hashery.toNumberSync(data, {
				min,
				max,
				algorithm: "fnv1",
			});
			expect(numFnv1).toBe(explicitFnv1);
		});

		test("should throw error when using async-only algorithm", () => {
			const hashery = new Hashery();
			const data = { name: "test" };

			expect(() => {
				hashery.toNumberSync(data, { algorithm: "SHA-256" });
			}).toThrow("does not support synchronous hashing");

			expect(() => {
				hashery.toNumberSync(data, { algorithm: "SHA-512" });
			}).toThrow("does not support synchronous hashing");
		});

		test("should respect hashLength option", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 0;
			const max = 1000;

			// Using different hashLength should produce valid results
			const num16 = hashery.toNumberSync(data, {
				min,
				max,
				hashLength: 16,
			});
			const num8 = hashery.toNumberSync(data, {
				min,
				max,
				hashLength: 8,
			});
			const num4 = hashery.toNumberSync(data, {
				min,
				max,
				hashLength: 4,
			});

			// All should be in range
			expect(num16).toBeGreaterThanOrEqual(min);
			expect(num16).toBeLessThanOrEqual(max);
			expect(num8).toBeGreaterThanOrEqual(min);
			expect(num8).toBeLessThanOrEqual(max);
			expect(num4).toBeGreaterThanOrEqual(min);
			expect(num4).toBeLessThanOrEqual(max);

			// Verify consistent results for same hashLength
			const num16Again = hashery.toNumberSync(data, {
				min,
				max,
				hashLength: 16,
			});
			expect(num16).toBe(num16Again);
		});

		test("should use default hashLength of 16", () => {
			const hashery = new Hashery();
			const data = { name: "test" };
			const min = 0;
			const max = 1000;

			const numDefault = hashery.toNumberSync(data, { min, max });
			const numExplicit16 = hashery.toNumberSync(data, {
				min,
				max,
				hashLength: 16,
			});

			expect(numDefault).toBe(numExplicit16);
		});
	});

	describe("toHashSync hooks", () => {
		test("should fire before:toHashSync hook and receive context", () => {
			const hashery = new Hashery();
			const hookData: Array<{ data: unknown; algorithm: string }> = [];

			hashery.onHook(
				"before:toHashSync",
				(context: { data: unknown; algorithm: string }) => {
					hookData.push({ data: context.data, algorithm: context.algorithm });
				},
			);

			const data = { name: "test", value: 42 };
			hashery.toHashSync(data, { algorithm: "djb2" });

			expect(hookData.length).toBe(1);
			expect(hookData[0].data).toEqual(data);
			expect(hookData[0].algorithm).toBe("djb2");
		});

		test("should fire after:toHashSync hook and receive result", () => {
			const hashery = new Hashery();
			const hookData: Array<{
				hash: string;
				data: unknown;
				algorithm: string;
			}> = [];

			hashery.onHook(
				"after:toHashSync",
				(result: { hash: string; data: unknown; algorithm: string }) => {
					hookData.push({
						hash: result.hash,
						data: result.data,
						algorithm: result.algorithm,
					});
				},
			);

			const data = { name: "test", value: 42 };
			const hash = hashery.toHashSync(data, { algorithm: "djb2" });

			expect(hookData.length).toBe(1);
			expect(hookData[0].hash).toBe(hash);
			expect(hookData[0].data).toEqual(data);
			expect(hookData[0].algorithm).toBe("djb2");
		});

		test("should allow before:toHashSync hook to modify input data (blocking)", () => {
			const hashery = new Hashery();

			hashery.onHook("before:toHashSync", (context: { data: unknown }) => {
				context.data = { modified: true, original: context.data };
			});

			const data = { name: "test" };
			const hash1 = hashery.toHashSync(data);

			// Hash without the hook should be different
			const hashery2 = new Hashery();
			const hash2 = hashery2.toHashSync(data);

			expect(hash1).not.toBe(hash2);
		});

		test("should allow before:toHashSync hook to modify algorithm (blocking)", () => {
			const hashery = new Hashery();

			hashery.onHook("before:toHashSync", (context: { algorithm: string }) => {
				context.algorithm = "fnv1";
			});

			const data = { name: "test" };
			const hash = hashery.toHashSync(data, { algorithm: "djb2" });

			// Should match fnv1 hash, not djb2
			const hashery2 = new Hashery();
			const fnv1Hash = hashery2.toHashSync(data, { algorithm: "fnv1" });
			const djb2Hash = hashery2.toHashSync(data, { algorithm: "djb2" });

			expect(hash).toBe(fnv1Hash);
			expect(hash).not.toBe(djb2Hash);
		});

		test("should allow after:toHashSync hook to modify result hash (blocking)", () => {
			const hashery = new Hashery();

			hashery.onHook("after:toHashSync", (result: { hash: string }) => {
				result.hash = "modified-hash";
			});

			const data = { name: "test" };
			const hash = hashery.toHashSync(data);

			expect(hash).toBe("modified-hash");
		});

		test("should execute multiple hooks in order", () => {
			const hashery = new Hashery();
			const executionOrder: string[] = [];

			hashery.onHook("before:toHashSync", (_context: unknown) => {
				executionOrder.push("before1");
			});

			hashery.onHook("before:toHashSync", (_context: unknown) => {
				executionOrder.push("before2");
			});

			hashery.onHook("after:toHashSync", (_result: unknown) => {
				executionOrder.push("after1");
			});

			hashery.onHook("after:toHashSync", (_result: unknown) => {
				executionOrder.push("after2");
			});

			hashery.toHashSync({ name: "test" });

			expect(executionOrder).toEqual([
				"before1",
				"before2",
				"after1",
				"after2",
			]);
		});

		test("should run after:toHashSync hook on cache hits", () => {
			const hashery = new Hashery({ cache: { enabled: true } });

			hashery.onHook("after:toHashSync", (result: { hash: string }) => {
				result.hash = "modified-hash";
			});

			const data = { name: "test" };
			const hash1 = hashery.toHashSync(data);
			const hash2 = hashery.toHashSync(data); // cache hit

			expect(hash1).toBe("modified-hash");
			expect(hash2).toBe("modified-hash");
		});
	});
});
