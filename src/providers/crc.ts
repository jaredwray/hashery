import type { HashProvider } from "../types.ts";

export class CRC implements HashProvider {
    public get name(): string {
        return "crc32";
    }

    public async toHash(data: BufferSource): Promise<string> {
        // Convert BufferSource to Uint8Array
        let bytes: Uint8Array;

        if (data instanceof Uint8Array) {
            bytes = data;
        } else if (data instanceof ArrayBuffer) {
            bytes = new Uint8Array(data);
        } else if (data instanceof DataView) {
            bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        } else {
            const view = data as ArrayBufferView;
            bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
        }

        // CRC-32 algorithm (IEEE 802.3 polynomial)
        // This is the same algorithm used by PHP's crc32() function
        const CRC32_POLYNOMIAL = 0xEDB88320;
        let crc = 0xFFFFFFFF;

        for (let i = 0; i < bytes.length; i++) {
            crc = crc ^ bytes[i];
            for (let j = 0; j < 8; j++) {
                crc = (crc >>> 1) ^ (CRC32_POLYNOMIAL & -(crc & 1));
            }
        }

        // Finalize CRC
        crc = (crc ^ 0xFFFFFFFF) >>> 0;

        // Convert to hexadecimal string (8 characters, zero-padded)
        const hashHex = crc.toString(16).padStart(8, "0");
        return hashHex;
    }
}
