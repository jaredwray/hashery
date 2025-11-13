import type { HashProvider } from "../types.ts";

/**
 * FNV-1 (Fowler-Noll-Vo) hash algorithm implementation.
 *
 * FNV-1 is a non-cryptographic hash function created by Glenn Fowler, Landon Curt Noll,
 * and Kiem-Phong Vo. It produces a 32-bit hash value, making it suitable for hash tables
 * and checksums, but NOT for cryptographic purposes.
 *
 * Algorithm: hash = (hash * FNV_prime) XOR octet_of_data
 * FNV-1 32-bit offset basis: 2166136261
 * FNV-1 32-bit prime: 16777619
 */
export class FNV1 implements HashProvider {
    /**
     * The name identifier for this hash provider.
     */
    public get name(): string {
        return "fnv1";
    }

    /**
     * Computes the FNV-1 hash of the provided data synchronously.
     *
     * @param data - The data to hash (Uint8Array, ArrayBuffer, or DataView)
     * @returns An 8-character lowercase hexadecimal string
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

        // FNV-1 algorithm constants
        const FNV_OFFSET_BASIS = 2166136261; // 32-bit offset basis
        const FNV_PRIME = 16777619; // 32-bit FNV prime

        // Initialize hash with FNV offset basis
        let hash = FNV_OFFSET_BASIS;

        // Process each byte: hash = (hash * FNV_prime) XOR byte
        for (let i = 0; i < bytes.length; i++) {
            hash = hash * FNV_PRIME;
            hash = hash ^ bytes[i];
            // Keep it as a 32-bit unsigned integer
            hash = hash >>> 0;
        }

        // Convert to 8-character lowercase hexadecimal string
        const hashHex = hash.toString(16).padStart(8, "0");

        return hashHex;
    }

    /**
     * Computes the FNV-1 hash of the provided data.
     *
     * @param data - The data to hash (Uint8Array, ArrayBuffer, or DataView)
     * @returns A Promise resolving to an 8-character lowercase hexadecimal string
     */
    public async toHash(data: BufferSource): Promise<string> {
        return this.toHashSync(data);
    }
}
