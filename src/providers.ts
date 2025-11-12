import type { HashProvider, HashProvidersOptions } from "./types.js";

/**
 * Manages a collection of hash providers for the Hashery system.
 * Provides methods to add, remove, and load multiple hash providers.
 */
export class HashProviders {
	private _providers: Map<string, HashProvider> = new Map();

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
