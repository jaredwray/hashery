import { Hookified, type HookifiedOptions } from "hookified";

export type HasheryOptions = {} & HookifiedOptions;

export class Hashery extends Hookified {
	constructor(options?: HasheryOptions) {
		super(options);
	}
}
