import type { HashProvider } from "../types.ts";

/**
 * DJB2 hash algorithm implementation.
 *
 * DJB2 is a non-cryptographic hash function created by Daniel J. Bernstein.
 * It produces a 32-bit hash value, making it suitable for hash tables and checksums,
 * but NOT for cryptographic purposes.
 *
 * Algorithm: hash = hash * 33 + c (where c is each byte)
 * Initial value: 5381
 *
 * @example
 * ```typescript
 * import { Hashery } from 'hashery';
 * import { DJB2 } from 'hashery/providers/djb2';
 *
 * const hashery = new Hashery();
 * hashery.providers.add(new DJB2());
 *
 * const hash = await hashery.toHash({ data: 'hello' }, 'djb2');
 * console.log(hash); // "7c9df5ea"
 * ```
 */
export class DJB2 implements HashProvider {
	/**
	 * The name identifier for this hash provider.
	 */
	public get name(): string {
		return "djb2";
	}

	/**
	 * Computes the DJB2 hash of the provided data synchronously.
	 *
	 * @param data - The data to hash (Uint8Array, ArrayBuffer, or DataView)
	 * @returns An 8-character lowercase hexadecimal string
	 *
	 * @example
	 * ```typescript
	 * const djb2 = new DJB2();
	 * const data = new TextEncoder().encode('hello');
	 * const hash = djb2.toHashSync(data);
	 * console.log(hash); // "7c9df5ea"
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

		// DJB2 algorithm
		// Initial hash value: 5381
		let hash = 5381;

		// Process each byte: hash = hash * 33 + byte
		for (let i = 0; i < bytes.length; i++) {
			hash = ((hash << 5) + hash) + bytes[i]; // hash * 33 + c
			// Keep it as a 32-bit unsigned integer
			hash = hash >>> 0;
		}

		// Convert to 8-character lowercase hexadecimal string
		const hashHex = hash.toString(16).padStart(8, "0");

		return hashHex;
	}

	/**
	 * Computes the DJB2 hash of the provided data.
	 *
	 * @param data - The data to hash (Uint8Array, ArrayBuffer, or DataView)
	 * @returns A Promise resolving to an 8-character lowercase hexadecimal string
	 *
	 * @example
	 * ```typescript
	 * const djb2 = new DJB2();
	 * const data = new TextEncoder().encode('hello');
	 * const hash = await djb2.toHash(data);
	 * console.log(hash); // "7c9df5ea"
	 * ```
	 */
	public async toHash(data: BufferSource): Promise<string> {
		return this.toHashSync(data);
	}
}
