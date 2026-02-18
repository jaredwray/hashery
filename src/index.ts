import { Hookified } from "hookified";
import { Cache } from "./cache.js";
import { CRC } from "./providers/crc.js";
import { WebCrypto } from "./providers/crypto.js";
import { DJB2 } from "./providers/djb2.js";
import { FNV1 } from "./providers/fnv1.js";
import { Murmur } from "./providers/murmur.js";
import { HashProviders } from "./providers.js";
import type {
	HashAlgorithm,
	HasheryLoadProviderOptions,
	HasheryOptions,
	HasheryToHashOptions,
	HasheryToHashSyncOptions,
	HasheryToNumberOptions,
	HasheryToNumberSyncOptions,
	HashProvider,
	ParseFn,
	StringifyFn,
	WebCryptoHashAlgorithm,
} from "./types.js";

export class Hashery extends Hookified {
	private _parse: ParseFn = JSON.parse;
	private _stringify: StringifyFn = JSON.stringify;
	private _providers = new HashProviders();
	private _defaultAlgorithm: string = "SHA-256";
	private _defaultAlgorithmSync: string = "djb2";
	private _cache: Cache;

	constructor(options?: HasheryOptions) {
		super(options);

		if (options?.parse) {
			this._parse = options.parse;
		}

		if (options?.stringify) {
			this._stringify = options.stringify;
		}

		if (options?.defaultAlgorithm) {
			this._defaultAlgorithm = options.defaultAlgorithm;
		}

		if (options?.defaultAlgorithmSync) {
			this._defaultAlgorithmSync = options.defaultAlgorithmSync;
		}

		this._cache = new Cache(options?.cache);

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
	 * Gets the default hash algorithm used when none is specified.
	 * @returns The current default algorithm (defaults to 'SHA-256')
	 */
	public get defaultAlgorithm(): string {
		return this._defaultAlgorithm;
	}

	/**
	 * Sets the default hash algorithm to use when none is specified.
	 * @param value - The default algorithm to use (e.g., 'SHA-256', 'SHA-512', 'djb2')
	 * @example
	 * ```ts
	 * const hashery = new Hashery();
	 * hashery.defaultAlgorithm = 'SHA-512';
	 *
	 * // Now toHash will use SHA-512 by default
	 * const hash = await hashery.toHash({ data: 'example' });
	 * ```
	 */
	public set defaultAlgorithm(value: string) {
		this._defaultAlgorithm = value;
	}

	/**
	 * Gets the default synchronous hash algorithm used when none is specified.
	 * @returns The current default synchronous algorithm (defaults to 'djb2')
	 */
	public get defaultAlgorithmSync(): string {
		return this._defaultAlgorithmSync;
	}

	/**
	 * Sets the default synchronous hash algorithm to use when none is specified.
	 * @param value - The default synchronous algorithm to use (e.g., 'djb2', 'fnv1', 'murmur', 'crc32')
	 * @example
	 * ```ts
	 * const hashery = new Hashery();
	 * hashery.defaultAlgorithmSync = 'fnv1';
	 *
	 * // Now synchronous operations will use fnv1 by default
	 * ```
	 */
	public set defaultAlgorithmSync(value: string) {
		this._defaultAlgorithmSync = value;
	}

	/**
	 * Gets the cache instance used to store computed hash values.
	 * @returns The Cache instance
	 * @example
	 * ```ts
	 * const hashery = new Hashery({ cache: { enabled: true } });
	 *
	 * // Access the cache
	 * hashery.cache.enabled; // true
	 * hashery.cache.size; // number of cached items
	 * hashery.cache.clear(); // clear all cached items
	 * ```
	 */
	public get cache(): Cache {
		return this._cache;
	}

	/**
	 * Generates a cryptographic hash of the provided data using the Web Crypto API.
	 * The data is first stringified using the configured stringify function, then hashed.
	 *
	 * If an invalid algorithm is provided, a 'warn' event is emitted and the method falls back
	 * to the default algorithm. You can listen to these warnings:
	 * ```ts
	 * hashery.on('warn', (message) => console.log(message));
	 * ```
	 *
	 * @param data - The data to hash (will be stringified before hashing)
	 * @param options - Optional configuration object
	 * @param options.algorithm - The hash algorithm to use (defaults to 'SHA-256')
	 * @param options.maxLength - Optional maximum length for the hash output
	 * @returns A Promise that resolves to the hexadecimal string representation of the hash
	 *
	 * @example
	 * ```ts
	 * const hashery = new Hashery();
	 * const hash = await hashery.toHash({ name: 'John', age: 30 });
	 * console.log(hash); // "a1b2c3d4..."
	 *
	 * // Using a different algorithm
	 * const hash512 = await hashery.toHash({ name: 'John' }, { algorithm: 'SHA-512' });
	 * ```
	 */
	public async toHash(
		data: unknown,
		options?: HasheryToHashOptions,
	): Promise<string> {
		// Before hook - allows modification of input data and algorithm
		const context = {
			data,
			algorithm: options?.algorithm ?? this._defaultAlgorithm,
			maxLength: options?.maxLength,
		};
		await this.beforeHook("toHash", context);

		// Stringify the data using the configured stringify function
		const stringified = this._stringify(context.data);

		// Check cache first
		const cacheKey = `${context.algorithm}:${stringified}`;
		if (this._cache.enabled) {
			const cached = this._cache.get(cacheKey);
			if (cached !== undefined) {
				let cachedHash = cached;
				// Apply maxLength if specified
				if (options?.maxLength && cachedHash.length > options.maxLength) {
					cachedHash = cachedHash.substring(0, options.maxLength);
				}

				// After hook - run even on cache hits for consistent behavior
				const result = {
					hash: cachedHash,
					data: context.data,
					algorithm: context.algorithm,
				};
				await this.afterHook("toHash", result);

				return result.hash;
			}
		}

		// Convert the string to a Uint8Array
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(stringified);

		// Get the provider for the specified algorithm
		let provider = this._providers.get(context.algorithm);
		if (!provider) {
			// Emit warning for invalid algorithm
			this.emit(
				"warn",
				`Invalid algorithm '${context.algorithm}' not found. Falling back to default algorithm '${this._defaultAlgorithm}'.`,
			);

			provider = new WebCrypto({
				algorithm: this._defaultAlgorithm as WebCryptoHashAlgorithm,
			});
		}

		// Use the provider to hash the data
		let hash = await provider.toHash(dataBuffer);

		// Store the full hash in cache before truncation
		if (this._cache.enabled) {
			this._cache.set(cacheKey, hash);
		}

		// if there is a max then change the hash
		if (options?.maxLength && hash.length > options?.maxLength) {
			hash = hash.substring(0, options.maxLength);
		}

		// After hook - allows modification/logging of result
		const result = { hash, data: context.data, algorithm: context.algorithm };
		await this.afterHook("toHash", result);

		return result.hash;
	}

	/**
	 * Generates a deterministic number within a specified range based on the hash of the provided data.
	 * This method uses the toHash function to create a consistent hash, then maps it to a number
	 * between min and max (inclusive).
	 *
	 * @param data - The data to hash (will be stringified before hashing)
	 * @param options - Configuration options (optional, defaults to min: 0, max: 100)
	 * @param options.min - The minimum value of the range (inclusive, defaults to 0)
	 * @param options.max - The maximum value of the range (inclusive, defaults to 100)
	 * @param options.algorithm - The hash algorithm to use (defaults to 'SHA-256')
	 * @param options.hashLength - Number of characters from hash to use for conversion (defaults to 16)
	 * @returns A Promise that resolves to a number between min and max (inclusive)
	 *
	 * @example
	 * ```ts
	 * const hashery = new Hashery();
	 * const num = await hashery.toNumber({ user: 'john' }); // Uses default min: 0, max: 100
	 * console.log(num); // Always returns the same number for the same input, e.g., 42
	 *
	 * // Using custom range
	 * const num2 = await hashery.toNumber({ user: 'john' }, { min: 1, max: 100 });
	 *
	 * // Using a different algorithm
	 * const num512 = await hashery.toNumber({ user: 'john' }, { min: 0, max: 255, algorithm: 'SHA-512' });
	 * ```
	 */
	public async toNumber(
		data: unknown,
		options: HasheryToNumberOptions = {},
	): Promise<number> {
		const {
			min = 0,
			max = 100,
			algorithm = this._defaultAlgorithm,
			hashLength = 16,
		} = options;

		if (min > max) {
			throw new Error("min cannot be greater than max");
		}

		// Get the hash as a hex string
		// Take the first hashLength characters of the hash to convert to a number
		// This provides good distribution while avoiding precision issues with JavaScript numbers
		const hash = await this.toHash(data, { algorithm, maxLength: hashLength });

		// Convert hex to a number
		const hashNumber = Number.parseInt(hash, 16);

		// Map the hash number to the desired range
		const range = max - min + 1;
		const mapped = min + (hashNumber % range);

		return mapped;
	}

	/**
	 * Generates a hash of the provided data synchronously using a non-cryptographic hash algorithm.
	 * The data is first stringified using the configured stringify function, then hashed.
	 *
	 * Note: This method only works with synchronous hash providers (djb2, fnv1, murmur, crc32).
	 * WebCrypto algorithms (SHA-256, SHA-384, SHA-512) are not supported and will throw an error.
	 *
	 * If an invalid algorithm is provided, a 'warn' event is emitted and the method falls back
	 * to the default synchronous algorithm. You can listen to these warnings:
	 * ```ts
	 * hashery.on('warn', (message) => console.log(message));
	 * ```
	 *
	 * @param data - The data to hash (will be stringified before hashing)
	 * @param options - Optional configuration object
	 * @param options.algorithm - The hash algorithm to use (defaults to 'djb2')
	 * @param options.maxLength - Optional maximum length for the hash output
	 * @returns The hexadecimal string representation of the hash
	 *
	 * @throws {Error} If the specified algorithm does not support synchronous hashing
	 * @throws {Error} If the default algorithm is not found
	 *
	 * @example
	 * ```ts
	 * const hashery = new Hashery();
	 * const hash = hashery.toHashSync({ name: 'John', age: 30 });
	 * console.log(hash); // "7c9df5ea..." (djb2 hash)
	 *
	 * // Using a different algorithm
	 * const hashFnv1 = hashery.toHashSync({ name: 'John' }, { algorithm: 'fnv1' });
	 * ```
	 */
	public toHashSync(data: unknown, options?: HasheryToHashSyncOptions): string {
		// Before hook - allows modification of input data and algorithm (synchronous/blocking)
		const context = {
			data,
			algorithm: options?.algorithm ?? this._defaultAlgorithmSync,
			maxLength: options?.maxLength,
		};
		this.hookSync("before:toHashSync", context);

		// Get algorithm from context (may have been modified by hook)
		const algorithm = context.algorithm;

		// Stringify the data using the configured stringify function
		const stringified = this._stringify(context.data);

		// Check cache first
		const cacheKey = `${algorithm}:${stringified}`;
		if (this._cache.enabled) {
			const cached = this._cache.get(cacheKey);
			if (cached !== undefined) {
				let cachedHash = cached;
				// Apply maxLength if specified
				if (options?.maxLength && cachedHash.length > options.maxLength) {
					cachedHash = cachedHash.substring(0, options.maxLength);
				}

				// After hook - run even on cache hits for consistent behavior
				const result = {
					hash: cachedHash,
					data: context.data,
					algorithm,
				};
				this.hookSync("after:toHashSync", result);

				return result.hash;
			}
		}

		// Convert the string to a Uint8Array
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(stringified);

		// Get the provider for the specified algorithm
		let provider = this._providers.get(algorithm);
		if (!provider) {
			// Emit warning for invalid algorithm
			this.emit(
				"warn",
				`Invalid algorithm '${algorithm}' not found. Falling back to default algorithm '${this._defaultAlgorithmSync}'.`,
			);

			// Fallback to default sync algorithm
			provider = this._providers.get(this._defaultAlgorithmSync);

			// If default algorithm is also not found, throw error
			if (!provider) {
				throw new Error(
					`Hash provider '${this._defaultAlgorithmSync}' (default) not found`,
				);
			}
		}

		// Check if provider supports synchronous hashing
		if (!provider.toHashSync) {
			throw new Error(
				`Hash provider '${algorithm}' does not support synchronous hashing. Use toHash() instead or choose a different algorithm (djb2, fnv1, murmur, crc32).`,
			);
		}

		// Use the provider to hash the data synchronously
		let hash = provider.toHashSync(dataBuffer);

		// Store the full hash in cache before truncation
		if (this._cache.enabled) {
			this._cache.set(cacheKey, hash);
		}

		// if there is a max then change the hash
		if (options?.maxLength && hash.length > options?.maxLength) {
			hash = hash.substring(0, options.maxLength);
		}

		// After hook - allows modification/logging of result (synchronous/blocking)
		const result = { hash, data: context.data, algorithm: context.algorithm };
		this.hookSync("after:toHashSync", result);

		return result.hash;
	}

	/**
	 * Generates a deterministic number within a specified range based on the hash of the provided data synchronously.
	 * This method uses the toHashSync function to create a consistent hash, then maps it to a number
	 * between min and max (inclusive).
	 *
	 * Note: This method only works with synchronous hash providers (djb2, fnv1, murmur, crc32).
	 *
	 * @param data - The data to hash (will be stringified before hashing)
	 * @param options - Configuration options (optional, defaults to min: 0, max: 100)
	 * @param options.min - The minimum value of the range (inclusive, defaults to 0)
	 * @param options.max - The maximum value of the range (inclusive, defaults to 100)
	 * @param options.algorithm - The hash algorithm to use (defaults to 'djb2')
	 * @param options.hashLength - Number of characters from hash to use for conversion (defaults to 16)
	 * @returns A number between min and max (inclusive)
	 *
	 * @throws {Error} If the specified algorithm does not support synchronous hashing
	 * @throws {Error} If min is greater than max
	 *
	 * @example
	 * ```ts
	 * const hashery = new Hashery();
	 * const num = hashery.toNumberSync({ user: 'john' }); // Uses default min: 0, max: 100
	 * console.log(num); // Always returns the same number for the same input, e.g., 42
	 *
	 * // Using custom range
	 * const num2 = hashery.toNumberSync({ user: 'john' }, { min: 1, max: 100 });
	 *
	 * // Using a different algorithm
	 * const numFnv1 = hashery.toNumberSync({ user: 'john' }, { min: 0, max: 255, algorithm: 'fnv1' });
	 * ```
	 */
	public toNumberSync(
		data: unknown,
		options: HasheryToNumberSyncOptions = {},
	): number {
		const {
			min = 0,
			max = 100,
			algorithm = this._defaultAlgorithmSync,
			hashLength = 16,
		} = options;

		if (min > max) {
			throw new Error("min cannot be greater than max");
		}

		// Get the hash as a hex string
		// Take the first hashLength characters of the hash to convert to a number
		// This provides good distribution while avoiding precision issues with JavaScript numbers
		const hash = this.toHashSync(data, { algorithm, maxLength: hashLength });

		// Convert hex to a number
		const hashNumber = Number.parseInt(hash, 16);

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
			this.providers.add(new Murmur());
		}
	}
}

export type { CacheOptions } from "./cache.js";
export { Cache } from "./cache.js";
export type {
	HashAlgorithm,
	WebCryptoHashAlgorithm,
	HasheryOptions,
	ParseFn,
	StringifyFn,
};
