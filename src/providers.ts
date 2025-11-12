import type {
	HashProvider,
	HashProvidersGetOptions,
	HashProvidersOptions,
} from "./types.js";

/**
 * Manages a collection of hash providers for the Hashery system.
 * Provides methods to add, remove, and load multiple hash providers.
 */
export class HashProviders {
	private _providers: Map<string, HashProvider> = new Map();
	private _getFuzzy = true;

	/**
	 * Creates a new HashProviders instance.
	 * @param options - Optional configuration including initial providers to load
	 * @example
	 * ```ts
	 * const providers = new HashProviders({
	 *   providers: [{ name: 'custom', toHash: async (data) => '...' }]
	 * });
	 * ```
	 */
	constructor(options?: HashProvidersOptions) {
		if (options?.providers) {
			this.loadProviders(options?.providers);
		}

		if (options?.getFuzzy !== undefined) {
			this._getFuzzy = Boolean(options?.getFuzzy);
		}
	}

	/**
	 * Loads multiple hash providers at once.
	 * Each provider is added to the internal map using its name as the key.
	 * @param providers - Array of HashProvider objects to load
	 * @example
	 * ```ts
	 * const providers = new HashProviders();
	 * providers.loadProviders([
	 *   { name: 'md5', toHash: async (data) => '...' },
	 *   { name: 'sha1', toHash: async (data) => '...' }
	 * ]);
	 * ```
	 */
	public loadProviders(providers: Array<HashProvider>) {
		for (const provider of providers) {
			this._providers.set(provider.name, provider);
		}
	}

	/**
	 * Gets the internal Map of all registered hash providers.
	 * @returns Map of provider names to HashProvider objects
	 */
	public get providers(): Map<string, HashProvider> {
		return this._providers;
	}

	/**
	 * Sets the internal Map of hash providers, replacing all existing providers.
	 * @param providers - Map of provider names to HashProvider objects
	 */
	public set providers(providers: Map<string, HashProvider>) {
		this._providers = providers;
	}

	/**
	 * Gets an array of all provider names.
	 * @returns Array of provider names
	 * @example
	 * ```ts
	 * const providers = new HashProviders();
	 * providers.add({ name: 'sha256', toHash: async (data) => '...' });
	 * providers.add({ name: 'md5', toHash: async (data) => '...' });
	 * console.log(providers.names); // ['sha256', 'md5']
	 * ```
	 */
	public get names(): Array<string> {
		return Array.from(this._providers.keys());
	}

	/**
	 * Gets a hash provider by name with optional fuzzy matching.
	 *
	 * Fuzzy matching (enabled by default) attempts to find providers by:
	 * 1. Exact match (after trimming whitespace)
	 * 2. Case-insensitive match (lowercase)
	 * 3. Dash-removed match (e.g., "SHA-256" matches "sha256")
	 *
	 * @param name - The name of the provider to retrieve
	 * @param options - Optional configuration for the get operation
	 * @param options.fuzzy - Enable/disable fuzzy matching (overrides constructor setting)
	 * @returns The HashProvider if found, undefined otherwise
	 * @example
	 * ```ts
	 * const providers = new HashProviders();
	 * providers.add({ name: 'sha256', toHash: async (data) => '...' });
	 *
	 * // Exact match
	 * const provider = providers.get('sha256');
	 *
	 * // Fuzzy match (case-insensitive)
	 * const provider2 = providers.get('SHA256');
	 *
	 * // Fuzzy match (with dash)
	 * const provider3 = providers.get('SHA-256');
	 *
	 * // Disable fuzzy matching
	 * const provider4 = providers.get('SHA256', { fuzzy: false }); // returns undefined
	 * ```
	 */
	public get(
		name: string,
		options?: HashProvidersGetOptions,
	): HashProvider | undefined {
		// set the options
		const getFuzzy = options?.fuzzy ?? this._getFuzzy;

		// do the trim
		name = name.trim();

		let result = this._providers.get(name);

		// try with lower case
		if (result === undefined && getFuzzy === true) {
			name = name.toLowerCase();
			result = this._providers.get(name);
		}

		// try removing dash
		if (result === undefined && getFuzzy === true) {
			name = name.replaceAll("-", "");
			result = this._providers.get(name);
		}

		return result;
	}

	/**
	 * Adds a single hash provider to the collection.
	 * If a provider with the same name already exists, it will be replaced.
	 * @param provider - The HashProvider object to add
	 * @example
	 * ```ts
	 * const providers = new HashProviders();
	 * providers.add({
	 *   name: 'custom-hash',
	 *   toHash: async (data) => {
	 *     // Custom hashing logic
	 *     return 'hash-result';
	 *   }
	 * });
	 * ```
	 */
	public add(provider: HashProvider): void {
		this._providers.set(provider.name, provider);
	}

	/**
	 * Removes a hash provider from the collection by name.
	 * @param name - The name of the provider to remove
	 * @returns true if the provider was found and removed, false otherwise
	 * @example
	 * ```ts
	 * const providers = new HashProviders();
	 * providers.add({ name: 'custom', toHash: async (data) => '...' });
	 * const removed = providers.remove('custom'); // returns true
	 * const removed2 = providers.remove('nonexistent'); // returns false
	 * ```
	 */
	public remove(name: string): boolean {
		return this._providers.delete(name);
	}
}
