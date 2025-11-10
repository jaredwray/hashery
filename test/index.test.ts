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
});
