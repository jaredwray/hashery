import type { HashAlgorithm, HashProvider } from "../types.js";


export type WebCryptoOptions = {
	algorithm?: HashAlgorithm
}

export class WebCrypto implements HashProvider {
	private _algorithm: HashAlgorithm = "SHA-256";
	constructor(options?: WebCryptoOptions) {
		if(options?.algorithm) {
			this._algorithm = options?.algorithm;
		}

	}

	public get name(): string {
		return this._algorithm;
	}

	public async toHash(data: BufferSource): Promise<string> {
		// Hash the data using Web Crypto API
		const hashBuffer = await crypto.subtle.digest(this._algorithm, data);

		// Convert the hash to a hexadecimal string
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join("");

		return hashHex;
	}
}