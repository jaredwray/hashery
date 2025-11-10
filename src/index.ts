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

	public get parse(): ParseFn {
		return this._parse;
	}

	public set parse(value: ParseFn) {
		this._parse = value;
	}

	public get stringify(): StringifyFn {
		return this._stringify;
	}

	public set stringify(value: StringifyFn) {
		this._stringify = value;
	}
}

export type { HasheryOptions, ParseFn, StringifyFn };
