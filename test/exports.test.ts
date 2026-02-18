import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);

describe("Package Exports", () => {
	describe("Main Export (ESM)", () => {
		test("should export Hashery class", async () => {
			const { Hashery } = await import("hashery");
			expect(Hashery).toBeDefined();
			expect(typeof Hashery).toBe("function");
		});

		test("should create Hashery instance and hash data", async () => {
			const { Hashery } = await import("hashery");
			const hashery = new Hashery();
			const hash = await hashery.toHash({ test: "data" });
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBeGreaterThan(0);
		});

		test("should support toNumber method", async () => {
			const { Hashery } = await import("hashery");
			const hashery = new Hashery();
			const number = await hashery.toNumber({ test: "data" });
			expect(number).toBeDefined();
			expect(typeof number).toBe("number");
		});

		test("should support toHashSync method", async () => {
			const { Hashery } = await import("hashery");
			const hashery = new Hashery();
			const hash = hashery.toHashSync({ test: "data" });
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBeGreaterThan(0);
		});

		test("should support toNumberSync method", async () => {
			const { Hashery } = await import("hashery");
			const hashery = new Hashery();
			const number = hashery.toNumberSync({ test: "data" });
			expect(number).toBeDefined();
			expect(typeof number).toBe("number");
		});
	});

	describe("Main Export (CommonJS)", () => {
		test("should require Hashery class", () => {
			const { Hashery } = require("hashery");
			expect(Hashery).toBeDefined();
			expect(typeof Hashery).toBe("function");
		});

		test("should create Hashery instance and hash data via require", async () => {
			const { Hashery } = require("hashery");
			const hashery = new Hashery();
			const hash = await hashery.toHash({ test: "data" });
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBeGreaterThan(0);
		});

		test("should support toNumber method via require", async () => {
			const { Hashery } = require("hashery");
			const hashery = new Hashery();
			const number = await hashery.toNumber({ test: "data" });
			expect(number).toBeDefined();
			expect(typeof number).toBe("number");
		});

		test("should support toHashSync method via require", () => {
			const { Hashery } = require("hashery");
			const hashery = new Hashery();
			const hash = hashery.toHashSync({ test: "data" });
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBeGreaterThan(0);
		});

		test("should support toNumberSync method via require", () => {
			const { Hashery } = require("hashery");
			const hashery = new Hashery();
			const number = hashery.toNumberSync({ test: "data" });
			expect(number).toBeDefined();
			expect(typeof number).toBe("number");
		});
	});

	describe("Browser Export", () => {
		test("should export Hashery class from browser path", async () => {
			const { Hashery } = await import("hashery/browser");
			expect(Hashery).toBeDefined();
			expect(typeof Hashery).toBe("function");
		});

		test("should create Hashery instance and hash data from browser export", async () => {
			const { Hashery } = await import("hashery/browser");
			const hashery = new Hashery();
			const hash = await hashery.toHash({ test: "data", browser: true });
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBeGreaterThan(0);
		});

		test("should support toNumber method from browser export", async () => {
			const { Hashery } = await import("hashery/browser");
			const hashery = new Hashery();
			const number = await hashery.toNumber({ test: "data" });
			expect(number).toBeDefined();
			expect(typeof number).toBe("number");
		});

		test("should support toHashSync method from browser export", async () => {
			const { Hashery } = await import("hashery/browser");
			const hashery = new Hashery();
			const hash = hashery.toHashSync({ test: "data" });
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBeGreaterThan(0);
		});

		test("should support toNumberSync method from browser export", async () => {
			const { Hashery } = await import("hashery/browser");
			const hashery = new Hashery();
			const number = hashery.toNumberSync({ test: "data" });
			expect(number).toBeDefined();
			expect(typeof number).toBe("number");
		});
	});

	describe("Provider Exports (ESM)", () => {
		test("should export DJB2 provider class", async () => {
			const { DJB2 } = await import("hashery");
			expect(DJB2).toBeDefined();
			const djb2 = new DJB2();
			expect(djb2.name).toBe("djb2");
			const data = new TextEncoder().encode("hello");
			const hash = djb2.toHashSync(data);
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(8);
		});

		test("should export FNV1 provider class", async () => {
			const { FNV1 } = await import("hashery");
			expect(FNV1).toBeDefined();
			const fnv1 = new FNV1();
			expect(fnv1.name).toBe("fnv1");
			const data = new TextEncoder().encode("hello");
			const hash = fnv1.toHashSync(data);
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(8);
		});

		test("should export Murmur provider class", async () => {
			const { Murmur } = await import("hashery");
			expect(Murmur).toBeDefined();
			const murmur = new Murmur();
			expect(murmur.name).toBe("murmur");
			const data = new TextEncoder().encode("hello");
			const hash = murmur.toHashSync(data);
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(8);
		});

		test("should export CRC provider class", async () => {
			const { CRC } = await import("hashery");
			expect(CRC).toBeDefined();
			const crc = new CRC();
			expect(crc.name).toBe("crc32");
			const data = new TextEncoder().encode("hello");
			const hash = crc.toHashSync(data);
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(8);
		});

		test("should export WebCrypto provider class", async () => {
			const { WebCrypto } = await import("hashery");
			expect(WebCrypto).toBeDefined();
			const webCrypto = new WebCrypto({ algorithm: "SHA-256" });
			expect(webCrypto.name).toBe("SHA-256");
			const data = new TextEncoder().encode("hello");
			const hash = await webCrypto.toHash(data);
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(64);
		});

		test("should export HashProviders class", async () => {
			const { HashProviders, DJB2, FNV1 } = await import("hashery");
			expect(HashProviders).toBeDefined();
			const providers = new HashProviders();
			providers.add(new DJB2());
			providers.add(new FNV1());
			expect(providers.names).toEqual(["djb2", "fnv1"]);
			expect(providers.get("djb2")).toBeDefined();
		});
	});

	describe("Provider Exports (CommonJS)", () => {
		test("should require provider classes", () => {
			const {
				DJB2,
				FNV1,
				Murmur,
				CRC,
				WebCrypto,
				HashProviders,
			} = require("hashery");
			expect(DJB2).toBeDefined();
			expect(FNV1).toBeDefined();
			expect(Murmur).toBeDefined();
			expect(CRC).toBeDefined();
			expect(WebCrypto).toBeDefined();
			expect(HashProviders).toBeDefined();
		});

		test("should create provider instances and hash data via require", () => {
			const { DJB2 } = require("hashery");
			const djb2 = new DJB2();
			const data = new TextEncoder().encode("hello");
			const hash = djb2.toHashSync(data);
			expect(typeof hash).toBe("string");
			expect(hash.length).toBe(8);
		});
	});

	describe("Export Consistency", () => {
		test("main and browser exports should produce same hash", async () => {
			const { Hashery: MainHashery } = await import("hashery");
			const { Hashery: BrowserHashery } = await import("hashery/browser");

			const testData = { test: "consistency", number: 42 };

			const mainHashery = new MainHashery();
			const browserHashery = new BrowserHashery();

			const mainHash = await mainHashery.toHash(testData);
			const browserHash = await browserHashery.toHash(testData);

			expect(mainHash).toBe(browserHash);
		});

		test("ESM and CommonJS exports should produce same hash", async () => {
			const { Hashery: EsmHashery } = await import("hashery");
			const { Hashery: CjsHashery } = require("hashery");

			const testData = { test: "consistency", number: 42 };

			const esmHashery = new EsmHashery();
			const cjsHashery = new CjsHashery();

			const esmHash = await esmHashery.toHash(testData);
			const cjsHash = await cjsHashery.toHash(testData);

			expect(esmHash).toBe(cjsHash);
		});

		test("sync and async methods should both produce valid results", async () => {
			const { Hashery } = await import("hashery");
			const hashery = new Hashery();

			const testData = { test: "consistency", number: 42 };

			const asyncHash = await hashery.toHash(testData);
			const syncHash = hashery.toHashSync(testData);

			const asyncNumber = await hashery.toNumber(testData);
			const syncNumber = hashery.toNumberSync(testData);

			// Both should produce valid results
			expect(asyncHash).toBeDefined();
			expect(syncHash).toBeDefined();
			expect(typeof asyncHash).toBe("string");
			expect(typeof syncHash).toBe("string");
			expect(asyncHash.length).toBeGreaterThan(0);
			expect(syncHash.length).toBeGreaterThan(0);

			expect(asyncNumber).toBeDefined();
			expect(syncNumber).toBeDefined();
			expect(typeof asyncNumber).toBe("number");
			expect(typeof syncNumber).toBe("number");
		});
	});

	describe("TypeScript Types", () => {
		test("should have proper type definitions for ESM import", async () => {
			const { Hashery } = await import("hashery");
			const hashery = new Hashery();

			// This will fail at compile time if types are wrong
			expect(hashery.toHash).toBeDefined();
			expect(hashery.toNumber).toBeDefined();
			expect(hashery.toHashSync).toBeDefined();
			expect(hashery.toNumberSync).toBeDefined();
		});

		test("should have proper type definitions for browser import", async () => {
			const { Hashery } = await import("hashery/browser");
			const hashery = new Hashery();

			// This will fail at compile time if types are wrong
			expect(hashery.toHash).toBeDefined();
			expect(hashery.toNumber).toBeDefined();
			expect(hashery.toHashSync).toBeDefined();
			expect(hashery.toNumberSync).toBeDefined();
		});

		test("should have proper type definitions for CommonJS require", () => {
			const { Hashery } = require("hashery");
			const hashery = new Hashery();

			// This will fail at compile time if types are wrong
			expect(hashery.toHash).toBeDefined();
			expect(hashery.toNumber).toBeDefined();
			expect(hashery.toHashSync).toBeDefined();
			expect(hashery.toNumberSync).toBeDefined();
		});
	});
});
