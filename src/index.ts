import { Hookified } from "hookified";
import { CRC } from "./providers/crc.js";
import { WebCrypto } from "./providers/crypto.js";
import { DJB2 } from "./providers/djb2.js";
import { FNV1 } from "./providers/fnv1.js";
import { Murmer } from "./providers/murmer.js";
import { HashProviders } from "./providers.js";
import type {
	HasheryLoadProviderOptions,
	HasheryOptions,
	HashProvider,
	ParseFn,
	StringifyFn,
	WebCryptoHashAlgorithm,
} from "./types.js";

export class Hashery extends Hookified {
	private _parse: ParseFn = JSON.parse;
	private _stringify: StringifyFn = JSON.stringify;
	private _providers = new HashProviders();

	constructor(options?: HasheryOptions) {
		super(options);

		if (options?.parse) {
			this._parse = options.parse;
		}

		if (options?.stringify) {
			this._stringify = options.stringify;
		}

		this.loadProviders(options?.providers, {
			includeBase: options?.includeBase ?? true,
		});
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
	 * Gets the HashProviders instance used to manage hash providers.
	 * @returns The current HashProviders instance
	 */
	public get providers(): HashProviders {
		return this._providers;
	}

	/**
	 * Sets the HashProviders instance used to manage hash providers.
	 * @param value - The HashProviders instance to use
	 */
	public set providers(value: HashProviders) {
		this._providers = value;
	}

	/**
	 * Gets the names of all registered hash algorithm providers.
	 * @returns An array of provider names (e.g., ['SHA-256', 'SHA-384', 'SHA-512'])
	 */
	public get names(): Array<string> {
		return this._providers.names;
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
		algorithm: string = "SHA-256",
	): Promise<string> {
		// Stringify the data using the configured stringify function
		const stringified = this._stringify(data);

		// Convert the string to a Uint8Array
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(stringified);

		// Get the provider for the specified algorithm
		let provider = this._providers.get(algorithm);
		if (!provider) {
			provider = new WebCrypto({ algorithm: "SHA-256" });
		}

		// Use the provider to hash the data
		return await provider.toHash(dataBuffer);
	}

	/**
	 * Generates a deterministic number within a specified range based on the hash of the provided data.
	 * This method uses the toHash function to create a consistent hash, then maps it to a number
	 * between min and max (inclusive).
	 *
	 * @param data - The data to hash (will be stringified before hashing)
	 * @param min - The minimum value of the range (inclusive)
	 * @param max - The maximum value of the range (inclusive)
	 * @param algorithm - The hash algorithm to use (defaults to 'SHA-256')
	 * @returns A Promise that resolves to a number between min and max (inclusive)
	 *
	 * @example
	 * ```ts
	 * const hashery = new Hashery();
	 * const num = await hashery.toNumber({ user: 'john' }, 1, 100);
	 * console.log(num); // Always returns the same number for the same input, e.g., 42
	 *
	 * // Using a different algorithm
	 * const num512 = await hashery.toNumber({ user: 'john' }, 0, 255, 'SHA-512');
	 * ```
	 */
	public async toNumber(
		data: unknown,
		min: number,
		max: number,
		algorithm: string = "SHA-256",
	): Promise<number> {
		if (min > max) {
			throw new Error("min cannot be greater than max");
		}

		// Get the hash as a hex string
		const hash = await this.toHash(data, algorithm);

		// Take the first 16 characters (64 bits) of the hash to convert to a number
		// This provides good distribution while avoiding precision issues with JavaScript numbers
		const hashSegment = hash.substring(0, 16);

		// Convert hex to a number (0 to 2^64 - 1)
		const hashNumber = Number.parseInt(hashSegment, 16);

		// Map the hash number to the desired range
		const range = max - min + 1;
		const mapped = min + (hashNumber % range);

		return mapped;
	}

	public loadProviders(
		providers?: Array<HashProvider>,
		options: HasheryLoadProviderOptions = { includeBase: true },
	): void {
		if (providers) {
			for (const provider of providers) {
				this._providers.add(provider);
			}
		}

		// load all the providers
		if (options.includeBase) {
			this.providers.add(new WebCrypto({ algorithm: "SHA-256" }));
			this.providers.add(new WebCrypto({ algorithm: "SHA-384" }));
			this.providers.add(new WebCrypto({ algorithm: "SHA-512" }));
			this.providers.add(new CRC());
			this.providers.add(new DJB2());
			this.providers.add(new FNV1());
			this.providers.add(new Murmer());
		}
	}
}

export type { WebCryptoHashAlgorithm, HasheryOptions, ParseFn, StringifyFn };
