import type { HookifiedOptions } from "hookified";

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
} & HookifiedOptions;

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
 * - SHA-1: Legacy algorithm (160-bit) - not recommended for security-critical applications
 * - SHA-256: Recommended algorithm (256-bit) - good balance of security and performance
 * - SHA-384: High security algorithm (384-bit)
 * - SHA-512: Highest security algorithm (512-bit)
 */
export type HashAlgorithm = "SHA-256" | "SHA-384" | "SHA-512";

export type HashProvider = {
	name: string;
	toHash(data: BufferSource): Promise<string>;
};

export type HashProvidersOptions = {
	providers?: Array<HashProvider>;
};
