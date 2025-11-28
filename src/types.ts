import type { HookifiedOptions } from "hookified";
import type { CacheOptions } from "./cache.js";

/**
 * Configuration options for Hashery instances.
 * Extends HookifiedOptions to include parse and stringify functionality.
 */
export type HasheryOptions = {
	/**
	 * Custom parse function to deserialize string data.
	 * Defaults to JSON.parse if not provided.
	 * @example
	 * ```ts
	 * import superjson from 'superjson';
	 *
	 * const hashery = new Hashery({
	 *   parse: (data) => superjson.parse(data)
	 * });
	 * ```
	 */
	parse?: ParseFn;

	/**
	 * Custom stringify function to serialize data to string format.
	 * Defaults to JSON.stringify if not provided.
	 * @example
	 * ```ts
	 * import superjson from 'superjson';
	 *
	 * const hashery = new Hashery({
	 *   stringify: (data) => superjson.stringify(data)
	 * });
	 * ```
	 */
	stringify?: StringifyFn;

	/**
	 * Array of hash providers to add to base providers
	 * Providers implement the HashProvider interface and enable custom hashing algorithms.
	 * @example
	 * ```ts
	 * const customProvider = {
	 *   name: 'custom-hash',
	 *   toHash: async (data) => {
	 *     // Custom hash implementation
	 *     return 'hash-value';
	 *   }
	 * };
	 *
	 * const hashery = new Hashery({
	 *   providers: [customProvider]
	 * });
	 * ```
	 */
	providers?: Array<HashProvider>;

	/**
	 * Whether to include base WebCrypto providers (SHA-256, SHA-384, SHA-512).
	 * Defaults to true.
	 * @example
	 * ```ts
	 * // Create instance without base providers
	 * const hashery = new Hashery({
	 *   includeBase: false,
	 *   providers: [customProvider]
	 * });
	 * ```
	 */
	includeBase?: boolean;

	/**
	 * Default hash algorithm to use when none is specified.
	 * Defaults to 'SHA-256'.
	 * @example
	 * ```ts
	 * const hashery = new Hashery({
	 *   defaultAlgorithm: 'SHA-512'
	 * });
	 *
	 * // This will use SHA-512 instead of SHA-256
	 * const hash = await hashery.toHash({ data: 'example' });
	 * ```
	 */
	defaultAlgorithm?: string;

	/**
	 * Default synchronous hash algorithm to use when none is specified.
	 * Defaults to 'djb2'.
	 * @example
	 * ```ts
	 * const hashery = new Hashery({
	 *   defaultAlgorithmSync: 'fnv1'
	 * });
	 *
	 * // This will use fnv1 for synchronous operations by default
	 * ```
	 */
	defaultAlgorithmSync?: string;

	/**
	 * Cache configuration options.
	 * Pass { enabled: true } to enable caching of hash results.
	 * @example
	 * ```ts
	 * const hashery = new Hashery({
	 *   cache: { enabled: true, maxSize: 500 }
	 * });
	 *
	 * // Hashes will be cached and reused for identical inputs
	 * ```
	 */
	cache?: CacheOptions;
} & HookifiedOptions;

/**
 * Options for the toHash method.
 * @example
 * ```ts
 * const hashery = new Hashery();
 *
 * // Using a specific algorithm
 * const hash = await hashery.toHash({ data: 'example' }, { algorithm: 'SHA-512' });
 *
 * // Truncating the hash output
 * const shortHash = await hashery.toHash(
 *   { data: 'example' },
 *   { algorithm: 'SHA-256', maxLength: 16 }
 * );
 * ```
 */
export type HasheryToHashOptions = {
	/**
	 * The hash algorithm to use.
	 * Defaults to 'SHA-256' if not specified.
	 * Supported algorithms include: 'SHA-256', 'SHA-384', 'SHA-512', 'djb2', 'fnv1', 'murmer', 'crc32'
	 */
	algorithm?: string;

	/**
	 * Maximum length for the hash output.
	 * If specified, the hash will be truncated to this length.
	 * @example
	 * ```ts
	 * // Get a 16-character hash instead of the full 64-character SHA-256 hash
	 * const hash = await hashery.toHash({ data: 'example' }, { maxLength: 16 });
	 * ```
	 */
	maxLength?: number;
};

/**
 * Options for the toNumber method.
 * @example
 * ```ts
 * const hashery = new Hashery();
 *
 * // Using default range (0-100)
 * const num = await hashery.toNumber({ user: 'john' });
 *
 * // Using custom range
 * const slot = await hashery.toNumber({ user: 'john' }, { min: 0, max: 9 });
 *
 * // Using different algorithm
 * const num512 = await hashery.toNumber(
 *   { user: 'john' },
 *   { min: 0, max: 255, algorithm: 'SHA-512' }
 * );
 * ```
 */
export type HasheryToNumberOptions = {
	/**
	 * The hash algorithm to use.
	 * Defaults to 'SHA-256' if not specified.
	 * Supported algorithms include: 'SHA-256', 'SHA-384', 'SHA-512', 'djb2', 'fnv1', 'murmer', 'crc32'
	 */
	algorithm?: string;

	/**
	 * The minimum value of the range (inclusive).
	 * Defaults to 0 if not specified.
	 * @example
	 * ```ts
	 * // Generate number between 1 and 100
	 * const num = await hashery.toNumber({ data: 'example' }, { min: 1, max: 100 });
	 * ```
	 */
	min?: number;

	/**
	 * The maximum value of the range (inclusive).
	 * Defaults to 100 if not specified.
	 * @example
	 * ```ts
	 * // Generate number between 0 and 1000
	 * const num = await hashery.toNumber({ data: 'example' }, { min: 0, max: 1000 });
	 * ```
	 */
	max?: number;

	/**
	 * Number of characters from the hash to use for conversion.
	 * Defaults to 16 if not specified.
	 * This provides good distribution while avoiding precision issues with JavaScript numbers.
	 * @example
	 * ```ts
	 * // Use more hash characters for better distribution
	 * const num = await hashery.toNumber({ data: 'example' }, { hashLength: 32 });
	 * ```
	 */
	hashLength?: number;
};

/**
 * Options for the toHashSync method.
 * @example
 * ```ts
 * const hashery = new Hashery();
 *
 * // Using a specific algorithm
 * const hash = hashery.toHashSync({ data: 'example' }, { algorithm: 'fnv1' });
 *
 * // Truncating the hash output
 * const shortHash = hashery.toHashSync(
 *   { data: 'example' },
 *   { algorithm: 'djb2', maxLength: 16 }
 * );
 * ```
 */
export type HasheryToHashSyncOptions = {
	/**
	 * The hash algorithm to use.
	 * Defaults to 'djb2' if not specified.
	 * Supported synchronous algorithms include: 'djb2', 'fnv1', 'murmer', 'crc32'
	 * Note: WebCrypto algorithms (SHA-256, SHA-384, SHA-512) are not supported in sync mode.
	 */
	algorithm?: string;

	/**
	 * Maximum length for the hash output.
	 * If specified, the hash will be truncated to this length.
	 * @example
	 * ```ts
	 * // Get a 16-character hash
	 * const hash = hashery.toHashSync({ data: 'example' }, { maxLength: 16 });
	 * ```
	 */
	maxLength?: number;
};

/**
 * Options for the toNumberSync method.
 * @example
 * ```ts
 * const hashery = new Hashery();
 *
 * // Using default range (0-100)
 * const num = hashery.toNumberSync({ user: 'john' });
 *
 * // Using custom range
 * const slot = hashery.toNumberSync({ user: 'john' }, { min: 0, max: 9 });
 *
 * // Using different algorithm
 * const num = hashery.toNumberSync(
 *   { user: 'john' },
 *   { min: 0, max: 255, algorithm: 'fnv1' }
 * );
 * ```
 */
export type HasheryToNumberSyncOptions = {
	/**
	 * The hash algorithm to use.
	 * Defaults to 'djb2' if not specified.
	 * Supported synchronous algorithms include: 'djb2', 'fnv1', 'murmer', 'crc32'
	 * Note: WebCrypto algorithms (SHA-256, SHA-384, SHA-512) are not supported in sync mode.
	 */
	algorithm?: string;

	/**
	 * The minimum value of the range (inclusive).
	 * Defaults to 0 if not specified.
	 * @example
	 * ```ts
	 * // Generate number between 1 and 100
	 * const num = hashery.toNumberSync({ data: 'example' }, { min: 1, max: 100 });
	 * ```
	 */
	min?: number;

	/**
	 * The maximum value of the range (inclusive).
	 * Defaults to 100 if not specified.
	 * @example
	 * ```ts
	 * // Generate number between 0 and 1000
	 * const num = hashery.toNumberSync({ data: 'example' }, { min: 0, max: 1000 });
	 * ```
	 */
	max?: number;

	/**
	 * Number of characters from the hash to use for conversion.
	 * Defaults to 16 if not specified.
	 * This provides good distribution while avoiding precision issues with JavaScript numbers.
	 * @example
	 * ```ts
	 * // Use more hash characters for better distribution
	 * const num = hashery.toNumberSync({ data: 'example' }, { hashLength: 32 });
	 * ```
	 */
	hashLength?: number;
};

/**
 * Function type for serializing data to a string.
 * @param data - The data to stringify
 * @returns The stringified representation
 */
export type StringifyFn = (data: unknown) => string;

/**
 * Function type for parsing string data.
 * @param data - The string data to parse
 * @returns The parsed data
 */
export type ParseFn = (data: string) => unknown;

/**
 * Supported hash algorithms for the Web Crypto API.
 * - SHA-256: Recommended algorithm (256-bit) - good balance of security and performance
 * - SHA-384: High security algorithm (384-bit)
 * - SHA-512: Highest security algorithm (512-bit)
 */
export type WebCryptoHashAlgorithm = "SHA-256" | "SHA-384" | "SHA-512";

export type HashProvider = {
	name: string;
	toHash(data: BufferSource): Promise<string>;
	toHashSync?(data: BufferSource): string; // Optional
};

export type HashProvidersOptions = {
	providers?: Array<HashProvider>;
	getFuzzy?: boolean;
};

export type HashProvidersGetOptions = {
	fuzzy?: boolean;
};

export type HasheryLoadProviderOptions = {
	includeBase?: boolean;
};
