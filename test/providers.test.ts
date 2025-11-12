import { describe, expect, test } from "vitest";
import { HashProviders } from "../src/providers.js";
import type { HashProvider } from "../src/types.js";

describe("HashProviders", () => {
	test("initialization", () => {
		const providers = new HashProviders();
		expect(providers).toBeDefined();
	});

	test("should initialize with empty providers map", () => {
		const providers = new HashProviders();
		expect(providers.providers).toBeDefined();
		expect(providers.providers instanceof Map).toBe(true);
		expect(providers.providers.size).toBe(0);
	});

	describe("constructor with options", () => {
		test("should load providers from options", () => {
			const mockProviders: HashProvider[] = [
				{
					name: "test-provider",
					toHash: async (_data: unknown) => "hash1",
				},
				{
					name: "another-provider",
					toHash: async (_data: unknown) => "hash2",
				},
			];

			const providers = new HashProviders({ providers: mockProviders });

			expect(providers.providers.size).toBe(2);
			expect(providers.providers.has("test-provider")).toBe(true);
			expect(providers.providers.has("another-provider")).toBe(true);
		});

		test("should handle empty providers array", () => {
			const providers = new HashProviders({ providers: [] });
			expect(providers.providers.size).toBe(0);
		});

		test("should handle undefined providers option", () => {
			const providers = new HashProviders({ providers: undefined });
			expect(providers.providers.size).toBe(0);
		});

		test("should handle no options", () => {
			const providers = new HashProviders();
			expect(providers.providers.size).toBe(0);
		});

		test("should enable getFuzzy by default", () => {
			const providers = new HashProviders();
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			// Should find with fuzzy matching (lowercase)
			const result = providers.get("SHA256");
			expect(result).toBeDefined();
		});

		test("should set getFuzzy to true when explicitly enabled", () => {
			const providers = new HashProviders({ getFuzzy: true });
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			const result = providers.get("SHA256");
			expect(result).toBeDefined();
		});

		test("should set getFuzzy to false when explicitly disabled", () => {
			const providers = new HashProviders({ getFuzzy: false });
			providers.add({
				name: "sha-256",
				toHash: async (_data: unknown) => "hash",
			});

			const result = providers.get("SHA256");
			expect(result).toBeUndefined();

			const exactMatch = providers.get("sha-256");
			expect(exactMatch).toBeDefined();
		});

		test("should handle getFuzzy as boolean conversion", () => {
			// Test with false value
			const providers1 = new HashProviders({ getFuzzy: false });
			providers1.add({
				name: "test",
				toHash: async (_data: unknown) => "hash",
			});
			expect(providers1.get("TEST")).toBeUndefined();
			expect(providers1.get("test")).toBeDefined();

			// Test with true value
			const providers2 = new HashProviders({ getFuzzy: true });
			providers2.add({
				name: "test",
				toHash: async (_data: unknown) => "hash",
			});
			expect(providers2.get("TEST")).toBeDefined();
		});
	});

	describe("loadProviders method", () => {
		test("should load multiple providers", () => {
			const providers = new HashProviders();
			const mockProviders: HashProvider[] = [
				{
					name: "provider1",
					toHash: async (_data: unknown) => "hash1",
				},
				{
					name: "provider2",
					toHash: async (_data: unknown) => "hash2",
				},
				{
					name: "provider3",
					toHash: async (_data: unknown) => "hash3",
				},
			];

			providers.loadProviders(mockProviders);

			expect(providers.providers.size).toBe(3);
			expect(providers.providers.has("provider1")).toBe(true);
			expect(providers.providers.has("provider2")).toBe(true);
			expect(providers.providers.has("provider3")).toBe(true);
		});

		test("should handle empty array", () => {
			const providers = new HashProviders();
			providers.loadProviders([]);
			expect(providers.providers.size).toBe(0);
		});

		test("should replace provider with same name", () => {
			const providers = new HashProviders();
			const firstProvider: HashProvider = {
				name: "test",
				toHash: async (_data: unknown) => "first",
			};
			const secondProvider: HashProvider = {
				name: "test",
				toHash: async (_data: unknown) => "second",
			};

			providers.loadProviders([firstProvider]);
			expect(providers.providers.size).toBe(1);
			expect(providers.providers.get("test")).toBe(firstProvider);

			providers.loadProviders([secondProvider]);
			expect(providers.providers.size).toBe(1);
			expect(providers.providers.get("test")).toBe(secondProvider);
		});

		test("should add to existing providers", () => {
			const providers = new HashProviders();
			const firstBatch: HashProvider[] = [
				{
					name: "provider1",
					toHash: async (_data: unknown) => "hash1",
				},
			];
			const secondBatch: HashProvider[] = [
				{
					name: "provider2",
					toHash: async (_data: unknown) => "hash2",
				},
			];

			providers.loadProviders(firstBatch);
			expect(providers.providers.size).toBe(1);

			providers.loadProviders(secondBatch);
			expect(providers.providers.size).toBe(2);
			expect(providers.providers.has("provider1")).toBe(true);
			expect(providers.providers.has("provider2")).toBe(true);
		});

		test("should store actual provider objects correctly", async () => {
			const providers = new HashProviders();
			const mockProvider: HashProvider = {
				name: "test-provider",
				toHash: async (data: unknown) => `hashed:${JSON.stringify(data)}`,
			};

			providers.loadProviders([mockProvider]);

			const storedProvider = providers.providers.get("test-provider");
			expect(storedProvider).toBeDefined();
			expect(storedProvider?.name).toBe("test-provider");
			expect(await storedProvider?.toHash({ test: "data" })).toBe(
				'hashed:{"test":"data"}',
			);
		});
	});

	describe("providers getter", () => {
		test("should return the providers map", () => {
			const providers = new HashProviders();
			const map = providers.providers;

			expect(map instanceof Map).toBe(true);
		});

		test("should return map with loaded providers", () => {
			const mockProviders: HashProvider[] = [
				{
					name: "provider1",
					toHash: async (_data: unknown) => "hash1",
				},
			];

			const providers = new HashProviders({ providers: mockProviders });
			const map = providers.providers;

			expect(map.size).toBe(1);
			expect(map.has("provider1")).toBe(true);
		});

		test("should return same reference on multiple calls", () => {
			const providers = new HashProviders();
			const map1 = providers.providers;
			const map2 = providers.providers;

			expect(map1).toBe(map2);
		});
	});

	describe("names getter", () => {
		test("should return empty array when no providers", () => {
			const providers = new HashProviders();
			const names = providers.names;

			expect(Array.isArray(names)).toBe(true);
			expect(names.length).toBe(0);
		});

		test("should return array of provider names", () => {
			const providers = new HashProviders();
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash1",
			});
			providers.add({
				name: "md5",
				toHash: async (_data: unknown) => "hash2",
			});
			providers.add({
				name: "sha512",
				toHash: async (_data: unknown) => "hash3",
			});

			const names = providers.names;

			expect(names.length).toBe(3);
			expect(names).toContain("sha256");
			expect(names).toContain("md5");
			expect(names).toContain("sha512");
		});

		test("should return updated names after adding providers", () => {
			const providers = new HashProviders();
			providers.add({
				name: "provider1",
				toHash: async (_data: unknown) => "hash1",
			});

			let names = providers.names;
			expect(names.length).toBe(1);
			expect(names).toContain("provider1");

			providers.add({
				name: "provider2",
				toHash: async (_data: unknown) => "hash2",
			});

			names = providers.names;
			expect(names.length).toBe(2);
			expect(names).toContain("provider1");
			expect(names).toContain("provider2");
		});

		test("should return updated names after removing providers", () => {
			const providers = new HashProviders();
			providers.add({
				name: "provider1",
				toHash: async (_data: unknown) => "hash1",
			});
			providers.add({
				name: "provider2",
				toHash: async (_data: unknown) => "hash2",
			});
			providers.add({
				name: "provider3",
				toHash: async (_data: unknown) => "hash3",
			});

			let names = providers.names;
			expect(names.length).toBe(3);

			providers.remove("provider2");

			names = providers.names;
			expect(names.length).toBe(2);
			expect(names).toContain("provider1");
			expect(names).not.toContain("provider2");
			expect(names).toContain("provider3");
		});

		test("should return names from constructor-loaded providers", () => {
			const mockProviders: HashProvider[] = [
				{
					name: "initial1",
					toHash: async (_data: unknown) => "hash1",
				},
				{
					name: "initial2",
					toHash: async (_data: unknown) => "hash2",
				},
			];

			const providers = new HashProviders({ providers: mockProviders });
			const names = providers.names;

			expect(names.length).toBe(2);
			expect(names).toContain("initial1");
			expect(names).toContain("initial2");
		});

		test("should return new array each time", () => {
			const providers = new HashProviders();
			providers.add({
				name: "test",
				toHash: async (_data: unknown) => "hash",
			});

			const names1 = providers.names;
			const names2 = providers.names;

			expect(names1).not.toBe(names2);
			expect(names1).toEqual(names2);
		});

		test("should handle providers with special characters in names", () => {
			const providers = new HashProviders();
			providers.add({
				name: "provider-with-dashes",
				toHash: async (_data: unknown) => "hash1",
			});
			providers.add({
				name: "provider_with_underscores",
				toHash: async (_data: unknown) => "hash2",
			});
			providers.add({
				name: "provider.with.dots",
				toHash: async (_data: unknown) => "hash3",
			});

			const names = providers.names;

			expect(names.length).toBe(3);
			expect(names).toContain("provider-with-dashes");
			expect(names).toContain("provider_with_underscores");
			expect(names).toContain("provider.with.dots");
		});
	});

	describe("providers setter", () => {
		test("should replace the entire providers map", () => {
			const providers = new HashProviders();
			const mockProvider: HashProvider = {
				name: "initial",
				toHash: async (_data: unknown) => "hash",
			};
			providers.add(mockProvider);

			const newMap = new Map<string, HashProvider>();
			const newProvider: HashProvider = {
				name: "new-provider",
				toHash: async (_data: unknown) => "new-hash",
			};
			newMap.set("new-provider", newProvider);

			providers.providers = newMap;

			expect(providers.providers.size).toBe(1);
			expect(providers.providers.has("initial")).toBe(false);
			expect(providers.providers.has("new-provider")).toBe(true);
		});

		test("should accept empty map", () => {
			const providers = new HashProviders();
			providers.add({
				name: "test",
				toHash: async (_data: unknown) => "hash",
			});

			providers.providers = new Map();

			expect(providers.providers.size).toBe(0);
		});

		test("should maintain reference to new map", () => {
			const providers = new HashProviders();
			const newMap = new Map<string, HashProvider>();

			providers.providers = newMap;

			expect(providers.providers).toBe(newMap);
		});
	});

	describe("get method", () => {
		test("should get an existing provider by name", () => {
			const providers = new HashProviders();
			const mockProvider: HashProvider = {
				name: "test-provider",
				toHash: async (_data: unknown) => "hash-result",
			};

			providers.add(mockProvider);

			const retrieved = providers.get("test-provider");

			expect(retrieved).toBeDefined();
			expect(retrieved).toBe(mockProvider);
			expect(retrieved?.name).toBe("test-provider");
		});

		test("should return undefined for non-existent provider", () => {
			const providers = new HashProviders();

			const retrieved = providers.get("non-existent");

			expect(retrieved).toBeUndefined();
		});

		test("should get provider after loading", () => {
			const mockProviders: HashProvider[] = [
				{
					name: "provider1",
					toHash: async (_data: unknown) => "hash1",
				},
				{
					name: "provider2",
					toHash: async (_data: unknown) => "hash2",
				},
			];

			const providers = new HashProviders({ providers: mockProviders });

			const provider1 = providers.get("provider1");
			const provider2 = providers.get("provider2");

			expect(provider1).toBeDefined();
			expect(provider2).toBeDefined();
			expect(provider1?.name).toBe("provider1");
			expect(provider2?.name).toBe("provider2");
		});

		test("should return undefined after removing provider", () => {
			const providers = new HashProviders();
			providers.add({
				name: "test",
				toHash: async (_data: unknown) => "hash",
			});

			expect(providers.get("test")).toBeDefined();

			providers.remove("test");

			expect(providers.get("test")).toBeUndefined();
		});

		test("should get the updated provider after replacement", () => {
			const providers = new HashProviders();
			const firstProvider: HashProvider = {
				name: "test",
				toHash: async (_data: unknown) => "first-hash",
			};
			const secondProvider: HashProvider = {
				name: "test",
				toHash: async (_data: unknown) => "second-hash",
			};

			providers.add(firstProvider);
			expect(providers.get("test")).toBe(firstProvider);

			providers.add(secondProvider);
			expect(providers.get("test")).toBe(secondProvider);
			expect(providers.get("test")).not.toBe(firstProvider);
		});

		test("should work with provider functionality", async () => {
			const providers = new HashProviders();
			const mockProvider: HashProvider = {
				name: "functional-provider",
				toHash: async (data: unknown) => `hashed:${JSON.stringify(data)}`,
			};

			providers.add(mockProvider);

			const retrieved = providers.get("functional-provider");

			expect(retrieved).toBeDefined();
			if (retrieved) {
				const result = await retrieved.toHash({ test: "data" });
				expect(result).toBe('hashed:{"test":"data"}');
			}
		});

		test("should handle providers with special characters in names", () => {
			const providers = new HashProviders();

			providers.add({
				name: "provider-with-dashes",
				toHash: async (_data: unknown) => "hash1",
			});
			providers.add({
				name: "provider_with_underscores",
				toHash: async (_data: unknown) => "hash2",
			});

			const provider1 = providers.get("provider-with-dashes");
			const provider2 = providers.get("provider_with_underscores");

			expect(provider1).toBeDefined();
			expect(provider2).toBeDefined();
			expect(provider1?.name).toBe("provider-with-dashes");
			expect(provider2?.name).toBe("provider_with_underscores");
		});

		test("should trim whitespace from provider names", () => {
			const providers = new HashProviders();
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			const result = providers.get("  sha256  ");
			expect(result).toBeDefined();
			expect(result?.name).toBe("sha256");
		});

		test("should use fuzzy matching with lowercase", () => {
			const providers = new HashProviders();
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			const result = providers.get("SHA256");
			expect(result).toBeDefined();
			expect(result?.name).toBe("sha256");
		});

		test("should use fuzzy matching with dash removal", () => {
			const providers = new HashProviders();
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			const result = providers.get("SHA-256");
			expect(result).toBeDefined();
			expect(result?.name).toBe("sha256");
		});

		test("should combine trim, lowercase, and dash removal", () => {
			const providers = new HashProviders();
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			const result = providers.get("  SHA-256  ");
			expect(result).toBeDefined();
			expect(result?.name).toBe("sha256");
		});

		test("should disable fuzzy matching with option", () => {
			const providers = new HashProviders();
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			const result = providers.get("SHA-256", { fuzzy: false });
			expect(result).toBeUndefined();

			const exactMatch = providers.get("sha256", { fuzzy: false });
			expect(exactMatch).toBeDefined();
		});

		test("should override constructor getFuzzy with option", () => {
			const providers = new HashProviders({ getFuzzy: false });
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			// Constructor disabled fuzzy, but option enables it
			const result = providers.get("SHA-256", { fuzzy: true });
			expect(result).toBeDefined();
		});

		test("should handle exact match even with fuzzy enabled", () => {
			const providers = new HashProviders();
			providers.add({
				name: "SHA-256",
				toHash: async (_data: unknown) => "hash",
			});

			// Exact match should be found first
			const result = providers.get("SHA-256");
			expect(result).toBeDefined();
			expect(result?.name).toBe("SHA-256");
		});

		test("should fallback to fuzzy when exact match not found", () => {
			const providers = new HashProviders();
			providers.add({
				name: "sha256",
				toHash: async (_data: unknown) => "hash",
			});

			// No exact match for "SHA-256", should use fuzzy
			const result = providers.get("SHA-256");
			expect(result).toBeDefined();
			expect(result?.name).toBe("sha256");
		});
	});

	describe("add method", () => {
		test("should add a single provider", () => {
			const providers = new HashProviders();
			const mockProvider: HashProvider = {
				name: "test-provider",
				toHash: async (_data: unknown) => "hash-result",
			};

			providers.add(mockProvider);

			expect(providers.providers.size).toBe(1);
			expect(providers.providers.has("test-provider")).toBe(true);
			expect(providers.providers.get("test-provider")).toBe(mockProvider);
		});

		test("should add multiple providers one by one", () => {
			const providers = new HashProviders();

			providers.add({
				name: "provider1",
				toHash: async (_data: unknown) => "hash1",
			});
			providers.add({
				name: "provider2",
				toHash: async (_data: unknown) => "hash2",
			});
			providers.add({
				name: "provider3",
				toHash: async (_data: unknown) => "hash3",
			});

			expect(providers.providers.size).toBe(3);
			expect(providers.providers.has("provider1")).toBe(true);
			expect(providers.providers.has("provider2")).toBe(true);
			expect(providers.providers.has("provider3")).toBe(true);
		});

		test("should replace existing provider with same name", () => {
			const providers = new HashProviders();
			const firstProvider: HashProvider = {
				name: "test",
				toHash: async (_data: unknown) => "first-hash",
			};
			const secondProvider: HashProvider = {
				name: "test",
				toHash: async (_data: unknown) => "second-hash",
			};

			providers.add(firstProvider);
			expect(providers.providers.get("test")).toBe(firstProvider);

			providers.add(secondProvider);
			expect(providers.providers.size).toBe(1);
			expect(providers.providers.get("test")).toBe(secondProvider);
		});

		test("should store provider correctly", async () => {
			const providers = new HashProviders();
			const mockProvider: HashProvider = {
				name: "custom-hash",
				toHash: async (data: unknown) => `result:${JSON.stringify(data)}`,
			};

			providers.add(mockProvider);

			const stored = providers.providers.get("custom-hash");
			expect(stored).toBeDefined();
			expect(await stored?.toHash({ value: 42 })).toBe('result:{"value":42}');
		});

		test("should return void", () => {
			const providers = new HashProviders();
			const result = providers.add({
				name: "test",
				toHash: async (_data: unknown) => "hash",
			});

			expect(result).toBeUndefined();
		});
	});

	describe("remove method", () => {
		test("should remove an existing provider", () => {
			const providers = new HashProviders();
			providers.add({
				name: "test-provider",
				toHash: async (_data: unknown) => "hash",
			});

			expect(providers.providers.has("test-provider")).toBe(true);

			const result = providers.remove("test-provider");

			expect(result).toBe(true);
			expect(providers.providers.has("test-provider")).toBe(false);
			expect(providers.providers.size).toBe(0);
		});

		test("should return false when removing non-existent provider", () => {
			const providers = new HashProviders();

			const result = providers.remove("non-existent");

			expect(result).toBe(false);
			expect(providers.providers.size).toBe(0);
		});

		test("should remove only specified provider", () => {
			const providers = new HashProviders();
			providers.add({
				name: "provider1",
				toHash: async (_data: unknown) => "hash1",
			});
			providers.add({
				name: "provider2",
				toHash: async (_data: unknown) => "hash2",
			});
			providers.add({
				name: "provider3",
				toHash: async (_data: unknown) => "hash3",
			});

			const result = providers.remove("provider2");

			expect(result).toBe(true);
			expect(providers.providers.size).toBe(2);
			expect(providers.providers.has("provider1")).toBe(true);
			expect(providers.providers.has("provider2")).toBe(false);
			expect(providers.providers.has("provider3")).toBe(true);
		});

		test("should handle removing the same provider twice", () => {
			const providers = new HashProviders();
			providers.add({
				name: "test",
				toHash: async (_data: unknown) => "hash",
			});

			const firstRemove = providers.remove("test");
			expect(firstRemove).toBe(true);

			const secondRemove = providers.remove("test");
			expect(secondRemove).toBe(false);
		});

		test("should remove all providers when called for each", () => {
			const providers = new HashProviders();
			providers.add({
				name: "provider1",
				toHash: async (_data: unknown) => "hash1",
			});
			providers.add({
				name: "provider2",
				toHash: async (_data: unknown) => "hash2",
			});

			providers.remove("provider1");
			providers.remove("provider2");

			expect(providers.providers.size).toBe(0);
		});
	});

	describe("integration tests", () => {
		test("should work with complex provider workflow", async () => {
			const providers = new HashProviders();

			// Add initial provider
			const sha256Provider: HashProvider = {
				name: "sha256",
				toHash: async (_data: unknown) => "sha256-hash",
			};
			providers.add(sha256Provider);

			// Load more providers
			providers.loadProviders([
				{
					name: "md5",
					toHash: async (_data: unknown) => "md5-hash",
				},
				{
					name: "sha512",
					toHash: async (_data: unknown) => "sha512-hash",
				},
			]);

			expect(providers.providers.size).toBe(3);

			// Remove one
			providers.remove("md5");
			expect(providers.providers.size).toBe(2);

			// Verify remaining providers work
			const sha256 = providers.providers.get("sha256");
			const sha512 = providers.providers.get("sha512");

			expect(await sha256?.toHash({ test: "data" })).toBe("sha256-hash");
			expect(await sha512?.toHash({ test: "data" })).toBe("sha512-hash");
		});

		test("should handle provider names with special characters", () => {
			const providers = new HashProviders();

			providers.add({
				name: "provider-with-dashes",
				toHash: async (_data: unknown) => "hash1",
			});
			providers.add({
				name: "provider_with_underscores",
				toHash: async (_data: unknown) => "hash2",
			});
			providers.add({
				name: "provider.with.dots",
				toHash: async (_data: unknown) => "hash3",
			});

			expect(providers.providers.size).toBe(3);
			expect(providers.providers.has("provider-with-dashes")).toBe(true);
			expect(providers.providers.has("provider_with_underscores")).toBe(true);
			expect(providers.providers.has("provider.with.dots")).toBe(true);
		});

		test("should maintain provider functionality after multiple operations", async () => {
			const providers = new HashProviders();
			const callCounts = new Map<string, number>();

			const createCountingProvider = (name: string): HashProvider => ({
				name,
				toHash: async (_data: unknown) => {
					callCounts.set(name, (callCounts.get(name) || 0) + 1);
					return `${name}-hash`;
				},
			});

			// Add providers
			providers.add(createCountingProvider("provider1"));
			providers.add(createCountingProvider("provider2"));

			// Call providers
			await providers.providers.get("provider1")?.toHash({});
			await providers.providers.get("provider1")?.toHash({});
			await providers.providers.get("provider2")?.toHash({});

			expect(callCounts.get("provider1")).toBe(2);
			expect(callCounts.get("provider2")).toBe(1);

			// Remove and verify it's gone
			providers.remove("provider1");
			expect(providers.providers.has("provider1")).toBe(false);

			// provider2 should still work
			await providers.providers.get("provider2")?.toHash({});
			expect(callCounts.get("provider2")).toBe(2);
		});

		test("should handle constructor initialization followed by add/remove", () => {
			const initialProviders: HashProvider[] = [
				{
					name: "initial1",
					toHash: async (_data: unknown) => "hash1",
				},
				{
					name: "initial2",
					toHash: async (_data: unknown) => "hash2",
				},
			];

			const providers = new HashProviders({ providers: initialProviders });
			expect(providers.providers.size).toBe(2);

			// Add new provider
			providers.add({
				name: "added",
				toHash: async (_data: unknown) => "hash3",
			});
			expect(providers.providers.size).toBe(3);

			// Remove initial provider
			providers.remove("initial1");
			expect(providers.providers.size).toBe(2);
			expect(providers.providers.has("initial2")).toBe(true);
			expect(providers.providers.has("added")).toBe(true);
		});
	});
});
