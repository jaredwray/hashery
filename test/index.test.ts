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
});
