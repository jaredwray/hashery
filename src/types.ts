import type { HookifiedOptions } from "hookified";

export type HasheryOptions = {
	parse?: ParseFn;
	stringify?: StringifyFn;
} & HookifiedOptions;

export type StringifyFn = (data: unknown) => string;
export type ParseFn = (data: string) => unknown;
