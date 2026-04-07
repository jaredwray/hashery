import { defineConfig } from "tsdown";

export default defineConfig([
	{
		entry: ["src/index.ts"],
		format: ["cjs", "esm"],
		dts: true,
		outDir: "dist/node",
		clean: true,
	},
	{
		entry: ["src/index.ts"],
		format: ["esm", "iife"],
		target: "es2020",
		outDir: "dist/browser",
		platform: "browser",
		minify: true,
		sourcemap: true,
		dts: false,
		clean: true,
		noExternal: [/.*/],
	},
]);
