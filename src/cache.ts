/**
 * Configuration options for the Cache class.
 */
export type CacheOptions = {
	/**
	 * Enable or disable the cache.
	 * Defaults to true (enabled).
	 */
	enabled?: boolean;

	/**
	 * Maximum number of items to store in the cache.
	 * Defaults to 4000. When limit is reached, oldest entries are evicted (FIFO).
	 *
	 * Note: JavaScript Map can hold up to 2^24 (~16.7 million) entries in most
	 * environments, but practical limits depend on available memory and key/value sizes.
	 * For hash caching, 4000-10000 entries is typically sufficient for most use cases.
	 */
	maxSize?: number;
};

/**
 * A simple FIFO (First In, First Out) cache for storing hash values.
 * When the cache reaches its maximum size, the oldest entries are evicted.
 *
 * The cache uses a JavaScript Map internally, which can theoretically hold up to
 * 2^24 (~16.7 million) entries. However, practical limits depend on available memory
 * and the size of cached keys/values. The default maxSize of 4000 provides a good
 * balance between performance and memory usage for typical hash caching scenarios.
 */
export class Cache {
	private _enabled = true;
	private _maxSize = 4000;
	private _store = new Map<string, string>();
	private _keys: string[] = [];

	constructor(options?: CacheOptions) {
		if (options?.enabled !== undefined) {
			this._enabled = options.enabled;
		}

		if (options?.maxSize !== undefined) {
			this._maxSize = options.maxSize;
		}
	}

	/**
	 * Gets whether the cache is enabled.
	 */
	public get enabled(): boolean {
		return this._enabled;
	}

	/**
	 * Sets whether the cache is enabled.
	 */
	public set enabled(value: boolean) {
		this._enabled = value;
	}

	/**
	 * Gets the maximum number of items the cache can hold.
	 */
	public get maxSize(): number {
		return this._maxSize;
	}

	/**
	 * Sets the maximum number of items the cache can hold.
	 */
	public set maxSize(value: number) {
		this._maxSize = value;
	}

	/**
	 * Gets the underlying Map store.
	 */
	public get store(): Map<string, string> {
		return this._store;
	}

	/**
	 * Gets the current number of items in the cache.
	 */
	public get size(): number {
		return this._store.size;
	}

	/**
	 * Gets a value from the cache.
	 * @param key - The cache key
	 * @returns The cached value, or undefined if not found
	 */
	public get(key: string): string | undefined {
		return this._store.get(key);
	}

	/**
	 * Sets a value in the cache with FIFO eviction.
	 * If the cache is disabled, this method does nothing.
	 * If the cache is at capacity, the oldest entry is removed before adding the new one.
	 * @param key - The cache key
	 * @param value - The value to cache
	 */
	public set(key: string, value: string): void {
		if (!this._enabled) {
			return;
		}

		// If key already exists, just update the value
		if (this._store.has(key)) {
			this._store.set(key, value);
			return;
		}

		// If at capacity, remove oldest (FIFO)
		if (this._store.size >= this._maxSize) {
			const oldestKey = this._keys.shift();
			/* v8 ignore next -- @preserve */
			if (oldestKey) {
				this._store.delete(oldestKey);
			}
		}

		// Add new entry
		this._keys.push(key);
		this._store.set(key, value);
	}

	/**
	 * Checks if a key exists in the cache.
	 * @param key - The cache key
	 * @returns True if the key exists, false otherwise
	 */
	public has(key: string): boolean {
		return this._store.has(key);
	}

	/**
	 * Clears all entries from the cache.
	 */
	public clear(): void {
		this._store.clear();
		this._keys = [];
	}
}
