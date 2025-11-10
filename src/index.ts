import { Hookified } from "hookified";
import type { HasheryOptions, ParseFn, StringifyFn } from "./types.js";

export class Hashery extends Hookified {
	private _parse: ParseFn = JSON.parse;
	private _stringify: StringifyFn = JSON.stringify;

	constructor(options?: HasheryOptions) {
		super(options);

		if (options?.parse) {
			this._parse = options.parse;
		}

		if (options?.stringify) {
			this._stringify = options.stringify;
		}
	}

	/**
	 * Gets the parse function used to deserialize stored values.
	 * @returns The current parse function (defaults to JSON.parse)
	 */
	public get parse(): ParseFn {
		return this._parse;
	}

	/**
	 * Sets the parse function used to deserialize stored values.
	 * @param value - The parse function to use for deserialization
	 */
	public set parse(value: ParseFn) {
		this._parse = value;
	}

	/**
	 * Gets the stringify function used to serialize values for storage.
	 * @returns The current stringify function (defaults to JSON.stringify)
	 */
	public get stringify(): StringifyFn {
		return this._stringify;
	}

	/**
	 * Sets the stringify function used to serialize values for storage.
	 * @param value - The stringify function to use for serialization
	 */
	public set stringify(value: StringifyFn) {
		this._stringify = value;
	}
}

export type { HasheryOptions, ParseFn, StringifyFn };
