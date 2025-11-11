import { Hookified } from "hookified";
import type {
	HashAlgorithm,
	HasheryOptions,
	ParseFn,
	StringifyFn,
} from "./types.js";

export class Hashery extends Hookified {
	private _parse: ParseFn = JSON.parse;
	private _stringify: StringifyFn = JSON.stringify;

	constructor(options?: HasheryOptions) {
		super(options);

		if (options?.parse) {
			this._parse = options.parse;
		}

		if (options?.stringify) {
			this._stringify = options.stringify;
		}
	}

	/**
	 * Gets the parse function used to deserialize stored values.
	 * @returns The current parse function (defaults to JSON.parse)
	 */
	public get parse(): ParseFn {
		return this._parse;
	}

	/**
	 * Sets the parse function used to deserialize stored values.
	 * @param value - The parse function to use for deserialization
	 */
	public set parse(value: ParseFn) {
		this._parse = value;
	}

	/**
	 * Gets the stringify function used to serialize values for storage.
	 * @returns The current stringify function (defaults to JSON.stringify)
	 */
	public get stringify(): StringifyFn {
		return this._stringify;
	}

	/**
	 * Sets the stringify function used to serialize values for storage.
	 * @param value - The stringify function to use for serialization
	 */
	public set stringify(value: StringifyFn) {
		this._stringify = value;
	}

	/**
	 * Generates a cryptographic hash of the provided data using the Web Crypto API.
	 * The data is first stringified using the configured stringify function, then hashed.
	 *
	 * @param data - The data to hash (will be stringified before hashing)
	 * @param algorithm - The hash algorithm to use (defaults to 'SHA-256')
	 * @returns A Promise that resolves to the hexadecimal string representation of the hash
	 *
	 * @example
	 * ```ts
	 * const hashery = new Hashery();
	 * const hash = await hashery.toHash({ name: 'John', age: 30 });
	 * console.log(hash); // "a1b2c3d4..."
	 *
	 * // Using a different algorithm
	 * const hash512 = await hashery.toHash({ name: 'John' }, 'SHA-512');
	 * ```
	 */
	public async toHash(
		data: unknown,
		algorithm: HashAlgorithm = "SHA-256",
	): Promise<string> {
		// Stringify the data using the configured stringify function
		const stringified = this._stringify(data);

		// Convert the string to a Uint8Array
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(stringified);

		// Hash the data using Web Crypto API
		const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);

		// Convert the hash to a hexadecimal string
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join("");

		return hashHex;
	}
}

export type { HashAlgorithm, HasheryOptions, ParseFn, StringifyFn };
