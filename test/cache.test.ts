import { describe, expect, test } from "vitest";
import { Cache } from "../src/cache.ts";

describe("Cache", () => {
	describe("initialization", () => {
		test("should create instance without options", () => {
			const cache = new Cache();
			expect(cache).toBeInstanceOf(Cache);
		});

		test("should have default values", () => {
			const cache = new Cache();
			expect(cache.enabled).toBe(true);
			expect(cache.maxSize).toBe(4000);
			expect(cache.size).toBe(0);
		});

		test("should accept enabled option", () => {
			const cache = new Cache({ enabled: true });
			expect(cache.enabled).toBe(true);
		});

		test("should accept maxSize option", () => {
			const cache = new Cache({ maxSize: 500 });
			expect(cache.maxSize).toBe(500);
		});

		test("should accept both options", () => {
			const cache = new Cache({ enabled: true, maxSize: 100 });
			expect(cache.enabled).toBe(true);
			expect(cache.maxSize).toBe(100);
		});
	});

	describe("enabled property", () => {
		test("should get enabled state", () => {
			const cache = new Cache({ enabled: false });
			expect(cache.enabled).toBe(false);
		});

		test("should set enabled state", () => {
			const cache = new Cache();
			expect(cache.enabled).toBe(true);
			cache.enabled = false;
			expect(cache.enabled).toBe(false);
		});
	});

	describe("maxSize property", () => {
		test("should get maxSize", () => {
			const cache = new Cache({ maxSize: 250 });
			expect(cache.maxSize).toBe(250);
		});

		test("should set maxSize", () => {
			const cache = new Cache();
			expect(cache.maxSize).toBe(4000);
			cache.maxSize = 50;
			expect(cache.maxSize).toBe(50);
		});
	});

	describe("store property", () => {
		test("should return the underlying Map", () => {
			const cache = new Cache({ enabled: true });
			expect(cache.store).toBeInstanceOf(Map);
		});

		test("should reflect cached items", () => {
			const cache = new Cache({ enabled: true });
			cache.set("key1", "value1");
			expect(cache.store.get("key1")).toBe("value1");
		});
	});

	describe("size property", () => {
		test("should return 0 for empty cache", () => {
			const cache = new Cache();
			expect(cache.size).toBe(0);
		});

		test("should return correct count after adding items", () => {
			const cache = new Cache({ enabled: true });
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			expect(cache.size).toBe(2);
		});
	});

	describe("get method", () => {
		test("should return undefined for non-existent key", () => {
			const cache = new Cache({ enabled: true });
			expect(cache.get("nonexistent")).toBeUndefined();
		});

		test("should return cached value for existing key", () => {
			const cache = new Cache({ enabled: true });
			cache.set("key1", "value1");
			expect(cache.get("key1")).toBe("value1");
		});
	});

	describe("set method", () => {
		test("should not cache when disabled", () => {
			const cache = new Cache({ enabled: false });
			cache.set("key1", "value1");
			expect(cache.size).toBe(0);
			expect(cache.get("key1")).toBeUndefined();
		});

		test("should cache when enabled", () => {
			const cache = new Cache({ enabled: true });
			cache.set("key1", "value1");
			expect(cache.size).toBe(1);
			expect(cache.get("key1")).toBe("value1");
		});

		test("should update existing key without increasing size", () => {
			const cache = new Cache({ enabled: true });
			cache.set("key1", "value1");
			cache.set("key1", "value2");
			expect(cache.size).toBe(1);
			expect(cache.get("key1")).toBe("value2");
		});

		test("should evict oldest entry when at capacity (FIFO)", () => {
			const cache = new Cache({ enabled: true, maxSize: 3 });
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");
			expect(cache.size).toBe(3);

			// Adding a 4th item should evict the first (FIFO)
			cache.set("key4", "value4");
			expect(cache.size).toBe(3);
			expect(cache.get("key1")).toBeUndefined(); // First item evicted
			expect(cache.get("key2")).toBe("value2");
			expect(cache.get("key3")).toBe("value3");
			expect(cache.get("key4")).toBe("value4");
		});

		test("should maintain FIFO order during multiple evictions", () => {
			const cache = new Cache({ enabled: true, maxSize: 2 });
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3"); // Evicts key1
			cache.set("key4", "value4"); // Evicts key2

			expect(cache.size).toBe(2);
			expect(cache.get("key1")).toBeUndefined();
			expect(cache.get("key2")).toBeUndefined();
			expect(cache.get("key3")).toBe("value3");
			expect(cache.get("key4")).toBe("value4");
		});

		test("updating existing key should not trigger eviction", () => {
			const cache = new Cache({ enabled: true, maxSize: 2 });
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			// Update key1 - should not evict anything
			cache.set("key1", "updated");

			expect(cache.size).toBe(2);
			expect(cache.get("key1")).toBe("updated");
			expect(cache.get("key2")).toBe("value2");
		});
	});

	describe("has method", () => {
		test("should return false for non-existent key", () => {
			const cache = new Cache({ enabled: true });
			expect(cache.has("nonexistent")).toBe(false);
		});

		test("should return true for existing key", () => {
			const cache = new Cache({ enabled: true });
			cache.set("key1", "value1");
			expect(cache.has("key1")).toBe(true);
		});
	});

	describe("clear method", () => {
		test("should clear all entries", () => {
			const cache = new Cache({ enabled: true });
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			expect(cache.size).toBe(2);

			cache.clear();

			expect(cache.size).toBe(0);
			expect(cache.get("key1")).toBeUndefined();
			expect(cache.get("key2")).toBeUndefined();
		});

		test("should work on empty cache", () => {
			const cache = new Cache({ enabled: true });
			cache.clear();
			expect(cache.size).toBe(0);
		});

		test("should allow new entries after clearing", () => {
			const cache = new Cache({ enabled: true, maxSize: 2 });
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.clear();

			cache.set("key3", "value3");
			expect(cache.size).toBe(1);
			expect(cache.get("key3")).toBe("value3");
		});
	});

	describe("edge cases", () => {
		test("should handle maxSize of 1", () => {
			const cache = new Cache({ enabled: true, maxSize: 1 });
			cache.set("key1", "value1");
			expect(cache.get("key1")).toBe("value1");

			cache.set("key2", "value2");
			expect(cache.size).toBe(1);
			expect(cache.get("key1")).toBeUndefined();
			expect(cache.get("key2")).toBe("value2");
		});

		test("should handle empty string keys and values", () => {
			const cache = new Cache({ enabled: true });
			cache.set("", "empty-key");
			cache.set("empty-value", "");

			expect(cache.get("")).toBe("empty-key");
			expect(cache.get("empty-value")).toBe("");
		});

		test("should handle long keys and values", () => {
			const cache = new Cache({ enabled: true });
			const longKey = "k".repeat(10000);
			const longValue = "v".repeat(10000);

			cache.set(longKey, longValue);
			expect(cache.get(longKey)).toBe(longValue);
		});

		test("should handle special characters in keys", () => {
			const cache = new Cache({ enabled: true });
			const specialKey = "key:with:colons:and\nnewlines\tand\ttabs";
			cache.set(specialKey, "value");
			expect(cache.get(specialKey)).toBe("value");
		});
	});
});
