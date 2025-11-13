import type { HashProvider } from "../types.ts";

/**
 * Murmer 32-bit hash algorithm implementation.
 *
 * Murmer is a non-cryptographic hash function based on MurmurHash3 by Austin Appleby.
 * It produces a 32-bit hash value with excellent distribution and performance,
 * making it suitable for hash tables, bloom filters, and checksums,
 * but NOT for cryptographic purposes.
 *
 * This implementation uses the MurmurHash3_x86_32 variant.
 *
 * @example
 * ```typescript
 * import { Hashery } from 'hashery';
 * import { Murmer } from 'hashery/providers/murmer';
 *
 * const hashery = new Hashery();
 * hashery.providers.add(new Murmer());
 *
 * const hash = await hashery.toHash({ data: 'hello' }, 'murmer');
 * console.log(hash); // "248bfa47"
 * ```
 */
export class Murmer implements HashProvider {
	private _seed: number;

	/**
	 * Creates a new Murmer instance.
	 *
	 * @param seed - Optional seed value for the hash (default: 0)
	 */
	constructor(seed: number = 0) {
		this._seed = seed >>> 0; // Ensure it's a 32-bit unsigned integer
	}

	/**
	 * The name identifier for this hash provider.
	 */
	public get name(): string {
		return "murmer";
	}

	/**
	 * Gets the current seed value used for hashing.
	 */
	public get seed(): number {
		return this._seed;
	}

	/**
	 * Computes the Murmer 32-bit hash of the provided data synchronously.
	 *
	 * @param data - The data to hash (Uint8Array, ArrayBuffer, or DataView)
	 * @returns An 8-character lowercase hexadecimal string
	 *
	 * @example
	 * ```typescript
	 * const murmer = new Murmer();
	 * const data = new TextEncoder().encode('hello');
	 * const hash = murmer.toHashSync(data);
	 * console.log(hash); // "248bfa47"
	 * ```
	 */
	public toHashSync(data: BufferSource): string {
		// Convert BufferSource to Uint8Array for consistent processing
		let bytes: Uint8Array;

		if (data instanceof Uint8Array) {
			bytes = data;
		} else if (data instanceof ArrayBuffer) {
			bytes = new Uint8Array(data);
		} else if (data instanceof DataView) {
			bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
		} else {
			// Fallback for other ArrayBufferView types (e.g., Int8Array, Uint16Array, etc.)
			const view = data as ArrayBufferView;
			bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
		}

		// MurmurHash3_x86_32 algorithm
		const c1 = 0xcc9e2d51;
		const c2 = 0x1b873593;
		const length = bytes.length;
		const nblocks = Math.floor(length / 4);

		let h1 = this._seed;

		// Process 4-byte blocks
		for (let i = 0; i < nblocks; i++) {
			const index = i * 4;
			let k1 =
				(bytes[index] & 0xff) |
				((bytes[index + 1] & 0xff) << 8) |
				((bytes[index + 2] & 0xff) << 16) |
				((bytes[index + 3] & 0xff) << 24);

			k1 = this._imul(k1, c1);
			k1 = this._rotl32(k1, 15);
			k1 = this._imul(k1, c2);

			h1 ^= k1;
			h1 = this._rotl32(h1, 13);
			h1 = this._imul(h1, 5) + 0xe6546b64;
		}

		// Process remaining bytes
		const tail = nblocks * 4;
		let k1 = 0;

		switch (length & 3) {
			case 3:
				k1 ^= (bytes[tail + 2] & 0xff) << 16;
			// fallthrough
			case 2:
				k1 ^= (bytes[tail + 1] & 0xff) << 8;
			// fallthrough
			case 1:
				k1 ^= bytes[tail] & 0xff;
				k1 = this._imul(k1, c1);
				k1 = this._rotl32(k1, 15);
				k1 = this._imul(k1, c2);
				h1 ^= k1;
		}

		// Finalization
		h1 ^= length;

		h1 ^= h1 >>> 16;
		h1 = this._imul(h1, 0x85ebca6b);
		h1 ^= h1 >>> 13;
		h1 = this._imul(h1, 0xc2b2ae35);
		h1 ^= h1 >>> 16;

		// Convert to unsigned 32-bit integer
		h1 = h1 >>> 0;

		// Convert to 8-character lowercase hexadecimal string
		const hashHex = h1.toString(16).padStart(8, "0");

		return hashHex;
	}

	/**
	 * Computes the Murmer 32-bit hash of the provided data.
	 *
	 * @param data - The data to hash (Uint8Array, ArrayBuffer, or DataView)
	 * @returns A Promise resolving to an 8-character lowercase hexadecimal string
	 *
	 * @example
	 * ```typescript
	 * const murmer = new Murmer();
	 * const data = new TextEncoder().encode('hello');
	 * const hash = await murmer.toHash(data);
	 * console.log(hash); // "248bfa47"
	 * ```
	 */
	public async toHash(data: BufferSource): Promise<string> {
		return this.toHashSync(data);
	}

	/**
	 * 32-bit integer multiplication with proper overflow handling.
	 * @private
	 */
	private _imul(a: number, b: number): number {
		// Use Math.imul if available, otherwise fallback to manual implementation
		/* v8 ignore next -- @preserve */
		if (Math.imul) {
			return Math.imul(a, b);
		}

		// Manual 32-bit multiplication
		/* v8 ignore next -- @preserve */
		const ah = (a >>> 16) & 0xffff;
		/* v8 ignore next -- @preserve */
		const al = a & 0xffff;
		/* v8 ignore next -- @preserve */
		const bh = (b >>> 16) & 0xffff;
		/* v8 ignore next -- @preserve */
		const bl = b & 0xffff;

		/* v8 ignore next -- @preserve */
		return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)) | 0;
	}

	/**
	 * Left rotate a 32-bit integer.
	 * @private
	 */
	private _rotl32(x: number, r: number): number {
		return (x << r) | (x >>> (32 - r));
	}
}
